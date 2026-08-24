
# YOUTUBE PIPELINE — GO IMPLEMENTATION GUIDE FOR CLAUDE CODE
## Build a complete faceless historical YouTube automation pipeline

---

## PROJECT OVERVIEW

**Language:** Go (with Python fallback for AI-specific tasks)
**Architecture:** CLI tools + orchestrator, modular design
**Hardware target:** AMD Ryzen 7 7700, 32GB RAM, no GPU
**Cost target:** $0/month (local-first + free cloud tiers)

---

## WHY GO FOR THIS PROJECT

| Factor | Go | Python | Winner |
|--------|-----|--------|--------|
| **Concurrency** | Goroutines = trivial | asyncio = complex | Go |
| **Binary deployment** | Single static binary | Interpreter + deps | Go |
| **API clients** | Excellent stdlib | requests + aiohttp | Tie |
| **FFmpeg integration** | os/exec | subprocess | Tie |
| **AI/ML libraries** | Limited | Excellent (PyTorch, etc.) | Python |
| **Speed** | Compiled, fast | Interpreted, slower | Go |
| **Type safety** | Strong typing | Dynamic | Go |

**Verdict:** Go for orchestration, API clients, file I/O, concurrency. 
Python scripts for Ollama, Stable Diffusion, Piper TTS (called by Go).

---

## PROJECT STRUCTURE

```
youtube-pipeline/
├── cmd/
│   ├── pipeline/          # Main orchestrator (run full workflow)
│   │   └── main.go
│   ├── research/          # Standalone: research topics
│   │   └── main.go
│   ├── script/            # Standalone: generate script draft
│   │   └── main.go
│   ├── images/            # Standalone: batch generate images
│   │   └── main.go
│   ├── voice/             # Standalone: generate voiceover
│   │   └── main.go
│   ├── metadata/          # Standalone: optimize metadata
│   │   └── main.go
│   └── upload/            # Standalone: schedule upload
│       └── main.go
├── internal/
│   ├── config/            # YAML config management
│   │   └── config.go
│   ├── models/            # Data structures (JSON serialization)
│   │   └── models.go
│   ├── research/          # Topic scraping (Atlas Obscura, Reddit)
│   │   ├── atlas.go
│   │   ├── reddit.go
│   │   └── scorer.go
│   ├── script/            # Ollama LLM integration
│   │   ├── ollama.go
│   │   └── parser.go
│   ├── images/            # Image generation (ComfyUI, Colab)
│   │   ├── comfyui.go
│   │   ├── colab.go
│   │   └── prompt.go
│   ├── voice/             # Piper TTS + FFmpeg
│   │   ├── piper.go
│   │   └── ffmpeg.go
│   ├── metadata/          # YouTube metadata optimization
│   │   └── optimizer.go
│   ├── upload/            # YouTube Data API
│   │   └── youtube.go
│   └── utils/             # HTTP, file, string utilities
│       ├── http.go
│       └── file.go
├── scripts/               # Python scripts for AI tasks
│   ├── ollama_generate.py   # Alternative: direct Ollama API
│   ├── piper_generate.py    # Alternative: direct Piper TTS
│   └── sd_generate.py       # Alternative: direct Stable Diffusion
├── configs/
│   └── config.yaml
├── data/                  # Generated content (gitignored)
│   ├── topics/
│   ├── scripts/
│   ├── images/
│   ├── voice/
│   └── videos/
├── go.mod
├── go.sum
├── Makefile
└── README.md
```

---

## MODULE 1: CONFIGURATION (config.go)

```go
package config

import (
    "fmt"
    "os"
    "gopkg.in/yaml.v3"
)

type Config struct {
    Ollama   OllamaConfig   `yaml:"ollama"`
    ComfyUI  ComfyUIConfig  `yaml:"comfyui"`
    Colab    ColabConfig    `yaml:"colab"`
    Piper    PiperConfig    `yaml:"piper"`
    YouTube  YouTubeConfig  `yaml:"youtube"`
    Pipeline PipelineConfig `yaml:"pipeline"`
    Dirs     DirConfig      `yaml:"directories"`
}

type OllamaConfig struct {
    BaseURL     string  `yaml:"base_url"`
    Model       string  `yaml:"model"`
    MaxTokens   int     `yaml:"max_tokens"`
    Temperature float64 `yaml:"temperature"`
}

type ComfyUIConfig struct {
    Enabled bool   `yaml:"enabled"`
    BaseURL string `yaml:"base_url"`
    Model   string `yaml:"model"`
    Steps   int    `yaml:"steps"`
    Width   int    `yaml:"width"`
    Height  int    `yaml:"height"`
}

type ColabConfig struct {
    Enabled     bool   `yaml:"enabled"`
    NotebookURL string `yaml:"notebook_url"`
    APIKey      string `yaml:"api_key"`
}

type PiperConfig struct {
    ModelPath       string  `yaml:"model_path"`
    ConfigPath      string  `yaml:"config_path"`
    SentenceSilence float64 `yaml:"sentence_silence"`
    LengthScale     float64 `yaml:"length_scale"`
}

type YouTubeConfig struct {
    ClientSecret string `yaml:"client_secret"`
    TokenFile    string `yaml:"token_file"`
}

type PipelineConfig struct {
    TargetDuration    int `yaml:"target_duration_minutes"`
    WordsPerMinute    int `yaml:"words_per_minute"`
    VideosPerWeek     int `yaml:"videos_per_week"`
    ImagesPerVideo    int `yaml:"images_per_video"`
    ThumbnailVariants int `yaml:"thumbnail_variants"`
}

type DirConfig struct {
    Topics  string `yaml:"topics"`
    Scripts string `yaml:"scripts"`
    Images  string `yaml:"images"`
    Voice   string `yaml:"voice"`
    Videos  string `yaml:"videos"`
    Output  string `yaml:"output"`
}

func Load(path string) (*Config, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return nil, fmt.Errorf("reading config: %w", err)
    }
    var cfg Config
    if err := yaml.Unmarshal(data, &cfg); err != nil {
        return nil, fmt.Errorf("parsing config: %w", err)
    }
    cfg.applyDefaults()
    return &cfg, nil
}

func (c *Config) applyDefaults() {
    if c.Ollama.BaseURL == "" { c.Ollama.BaseURL = "http://localhost:11434" }
    if c.Ollama.Model == "" { c.Ollama.Model = "mistral" }
    if c.Ollama.MaxTokens == 0 { c.Ollama.MaxTokens = 2500 }
    if c.Ollama.Temperature == 0 { c.Ollama.Temperature = 0.7 }
    if c.Pipeline.TargetDuration == 0 { c.Pipeline.TargetDuration = 10 }
    if c.Pipeline.WordsPerMinute == 0 { c.Pipeline.WordsPerMinute = 150 }
    if c.Pipeline.VideosPerWeek == 0 { c.Pipeline.VideosPerWeek = 2 }
    if c.Pipeline.ImagesPerVideo == 0 { c.Pipeline.ImagesPerVideo = 20 }
    if c.Dirs.Topics == "" { c.Dirs.Topics = "data/topics" }
    if c.Dirs.Scripts == "" { c.Dirs.Scripts = "data/scripts" }
    if c.Dirs.Images == "" { c.Dirs.Images = "data/images" }
    if c.Dirs.Voice == "" { c.Dirs.Voice = "data/voice" }
    if c.Dirs.Videos == "" { c.Dirs.Videos = "data/videos" }
    if c.Dirs.Output == "" { c.Dirs.Output = "data/output" }
}

func (c *Config) EnsureDirs() error {
    dirs := []string{c.Dirs.Topics, c.Dirs.Scripts, c.Dirs.Images, c.Dirs.Voice, c.Dirs.Videos, c.Dirs.Output}
    for _, dir := range dirs {
        if err := os.MkdirAll(dir, 0755); err != nil {
            return fmt.Errorf("creating %s: %w", dir, err)
        }
    }
    return nil
}
```

---

## MODULE 2: DATA MODELS (models.go)

```go
package models

import "time"

type Topic struct {
    ID              string    `json:"id"`
    Title           string    `json:"title"`
    Location        string    `json:"location"`
    Description     string    `json:"description"`
    Source          string    `json:"source"`
    URL             string    `json:"url,omitempty"`
    CuriosityScore  int       `json:"curiosity_score"`
    VisualPotential int       `json:"visual_potential"`
    Timestamp       time.Time `json:"timestamp"`
    Status          string    `json:"status"` // "new", "approved", "rejected", "completed"
}

type Script struct {
    ID                string            `json:"id"`
    TopicID           string            `json:"topic_id"`
    Title             string            `json:"title"`
    WordCount         int               `json:"word_count"`
    EstimatedDuration float64           `json:"estimated_duration_minutes"`
    Sections          map[string]string `json:"sections"`
    VisualMarkers     []VisualMarker    `json:"visual_markers"`
    Draft             string            `json:"draft"`
    Final             string            `json:"final,omitempty"`
    Model             string            `json:"model"`
    GenerationTime    float64           `json:"generation_time_seconds"`
    Timestamp         time.Time         `json:"timestamp"`
    Status            string            `json:"status"` // "draft", "human_edited", "approved"
}

type VisualMarker struct {
    Index       int    `json:"index"`
    Description string `json:"description"`
    Style       string `json:"style"`
    Enhanced    string `json:"enhanced_prompt,omitempty"`
}

type ImageBatch struct {
    ID        string           `json:"id"`
    ScriptID  string           `json:"script_id"`
    Images    []GeneratedImage `json:"images"`
    Source    string           `json:"source"`
    Timestamp time.Time        `json:"timestamp"`
    Status    string           `json:"status"`
}

type GeneratedImage struct {
    Index       int     `json:"index"`
    Prompt      string  `json:"prompt"`
    FilePath    string  `json:"file_path"`
    TimeSeconds float64 `json:"time_seconds"`
    Status      string  `json:"status"`
}

type Voiceover struct {
    ID        string    `json:"id"`
    ScriptID  string    `json:"script_id"`
    FilePath  string    `json:"file_path"`
    Duration  float64   `json:"duration_minutes"`
    Model     string    `json:"model"`
    Chunks    int       `json:"chunks"`
    Timestamp time.Time `json:"timestamp"`
}

type Metadata struct {
    ID              string    `json:"id"`
    ScriptID        string    `json:"script_id"`
    Title           string    `json:"title"`
    Description     string    `json:"description"`
    Tags            []string  `json:"tags"`
    Category        string    `json:"category"`
    Chapters        []Chapter `json:"chapters,omitempty"`
    ThumbnailText   []string  `json:"thumbnail_text_options"`
    PrivacyStatus   string    `json:"privacy_status"`
}

type Chapter struct {
    Time  string `json:"time"`
    Title string `json:"title"`
}

type ResearchReport struct {
    ID              string    `json:"id"`
    GeneratedAt     time.Time `json:"generated_at"`
    TotalTopics       int       `json:"total_topics_found"`
    Recommendations   []Topic   `json:"top_recommendations"`
    SuggestedTitles   []string  `json:"suggested_titles"`
}

type VideoProject struct {
    ID        string       `json:"id"`
    Topic     *Topic       `json:"topic"`
    Script    *Script      `json:"script"`
    Images    *ImageBatch  `json:"images,omitempty"`
    Voiceover *Voiceover   `json:"voiceover,omitempty"`
    Metadata  *Metadata    `json:"metadata,omitempty"`
    Status    string       `json:"status"`
    CreatedAt time.Time    `json:"created_at"`
    UpdatedAt time.Time    `json:"updated_at"`
}
```

---

## MODULE 3: RESEARCH SCRAPER (research/)

### atlas.go
```go
package research

import (
    "fmt"
    "io"
    "net/http"
    "strings"
    "time"
    "github.com/PuerkitoBio/goquery"
    "youtube-pipeline/internal/models"
)

type AtlasObscuraScraper struct {
    client  *http.Client
    baseURL string
    seen    map[string]bool
}

func NewAtlasObscuraScraper() *AtlasObscuraScraper {
    return &AtlasObscuraScraper{
        client:  &http.Client{Timeout: 30 * time.Second},
        baseURL: "https://www.atlasobscura.com",
        seen:    make(map[string]bool),
    }
}

func (s *AtlasObscuraScraper) Scrape(limit int) ([]models.Topic, error) {
    req, _ := http.NewRequest("GET", s.baseURL+"/places?page=1", nil)
    req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")

    resp, err := s.client.Do(req)
    if err != nil { return nil, err }
    defer resp.Body.Close()

    if resp.StatusCode != 200 { return nil, fmt.Errorf("HTTP %d", resp.StatusCode) }

    return s.parse(resp.Body, limit)
}

func (s *AtlasObscuraScraper) parse(r io.Reader, limit int) ([]models.Topic, error) {
    doc, err := goquery.NewDocumentFromReader(r)
    if err != nil { return nil, err }

    var topics []models.Topic
    doc.Find(".Card").Each(func(i int, sel *goquery.Selection) {
        if len(topics) >= limit { return }

        title := strings.TrimSpace(sel.Find("h3").Text())
        if title == "" || s.seen[title] { return }
        s.seen[title] = true

        location := strings.TrimSpace(sel.Find(".place-location").Text())
        description := strings.TrimSpace(sel.Find(".Card__content").Text())

        topics = append(topics, models.Topic{
            ID:              generateID(title),
            Title:           title,
            Location:        location,
            Description:     description,
            Source:          "atlas_obscura",
            CuriosityScore:  scoreTopic(title, description),
            VisualPotential: assessVisuals(description),
            Timestamp:       time.Now(),
            Status:          "new",
        })
    })
    return topics, nil
}
```

### scorer.go
```go
package research

import (
    "crypto/md5"
    "fmt"
    "strings"
)

var curiosityWords = []string{"abandoned", "secret", "hidden", "mysterious", "lost", "forbidden", "underground", "unknown", "vanished", "cursed"}
var visualIndicators = []string{"ruins", "tunnels", "underground", "abandoned", "architecture", "mountain", "island", "cave", "temple", "fortress"}
var commonTopics = []string{"pyramids", "taj mahal", "eiffel tower", "statue of liberty", "machu picchu", "colosseum"}
var highValueLocations = []string{"japan", "russia", "egypt", "peru", "antarctica", "ukraine", "romania", "czech", "poland", "norway"}

func scoreTopic(title, description string) int {
    score := 50
    content := strings.ToLower(title + " " + description)

    for _, w := range curiosityWords {
        if strings.Contains(content, w) { score += 8 }
    }
    for _, loc := range highValueLocations {
        if strings.Contains(content, loc) { score += 10 }
    }
    for _, t := range commonTopics {
        if strings.Contains(content, t) { score -= 30 }
    }
    if strings.Contains(content, "beautiful") || strings.Contains(content, "amazing") { score -= 10 }

    if score > 100 { return 100 }
    if score < 0 { return 0 }
    return score
}

func assessVisuals(description string) int {
    content := strings.ToLower(description)
    count := 0
    for _, indicator := range visualIndicators {
        if strings.Contains(content, indicator) { count++ }
    }
    score := count * 20
    if score > 100 { return 100 }
    return score
}

func generateID(title string) string {
    return fmt.Sprintf("%x", md5.Sum([]byte(title)))[:12]
}

func GenerateYouTubeTitles(topic models.Topic) []string {
    t, loc := topic.Title, topic.Location
    return []string{
        fmt.Sprintf("The Abandoned %s That %s Tried to Hide", t, loc),
        fmt.Sprintf("Inside the Secret %s Nobody Can Enter", t),
        fmt.Sprintf("Why %s's %s Was Sealed Shut Forever", loc, t),
    }
}
```

---

## MODULE 4: OLLAMA SCRIPT GENERATION (script/)

### ollama.go
```go
package script

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "strings"
    "time"
    "youtube-pipeline/internal/models"
)

type OllamaClient struct {
    baseURL string
    model   string
    client  *http.Client
}

func NewOllamaClient(baseURL, model string) *OllamaClient {
    return &OllamaClient{
        baseURL: baseURL,
        model:   model,
        client:  &http.Client{Timeout: 5 * time.Minute},
    }
}

func (c *OllamaClient) GenerateScript(topic models.Topic, title string, duration int) (*models.Script, error) {
    wordTarget := duration * 150

    prompt := fmt.Sprintf(`Write a %d-minute documentary script for: "%s"

Topic: %s in %s
Description: %s

Structure:
- HOOK (0:00-0:15): Curiosity gap opener
- SETUP (0:15-1:30): Context and stakes
- DISCOVERY (1:30-4:00): Core narrative with 3 little-known facts
- REVELATION (4:00-6:30): Hidden truth or deeper meaning
- IMPLICATION (6:30-7:30): Why this matters today
- OUTRO (7:30-8:00): Open question + CTA

Include [VISUAL: description] markers.
Target: %d words.
Tone: Documentary narrator, authoritative, slightly mysterious.`,
        duration, title, topic.Title, topic.Location, topic.Description, wordTarget)

    systemPrompt := "You are an expert documentary scriptwriter for faceless YouTube historical content. Write scripts with strong hooks, narrative tension, and emotional beats. Target 150 words per minute."

    reqBody := map[string]interface{}{
        "model":  c.model,
        "system": systemPrompt,
        "prompt": prompt,
        "stream": false,
        "options": map[string]interface{}{
            "temperature": 0.7,
            "num_ctx":     8192,
            "num_predict": 2500,
        },
    }

    start := time.Now()
    resp, err := c.doRequest("/api/generate", reqBody)
    if err != nil { return nil, err }
    elapsed := time.Since(start)

    var result struct {
        Response    string `json:"response"`
        EvalCount   int    `json:"eval_count"`
    }
    if err := json.Unmarshal(resp, &result); err != nil { return nil, err }

    markers := parseVisualMarkers(result.Response)
    sections := parseSections(result.Response)

    return &models.Script{
        ID:                fmt.Sprintf("script_%s_%d", topic.ID, time.Now().Unix()),
        TopicID:           topic.ID,
        Title:             title,
        WordCount:         len(strings.Fields(result.Response)),
        EstimatedDuration: float64(len(strings.Fields(result.Response))) / 150.0,
        Sections:          sections,
        VisualMarkers:     markers,
        Draft:             result.Response,
        Model:             c.model,
        GenerationTime:    elapsed.Seconds(),
        Timestamp:         time.Now(),
        Status:            "draft",
    }, nil
}

func (c *OllamaClient) doRequest(endpoint string, body interface{}) ([]byte, error) {
    jsonBody, _ := json.Marshal(body)
    req, _ := http.NewRequest("POST", c.baseURL+endpoint, bytes.NewReader(jsonBody))
    req.Header.Set("Content-Type", "application/json")

    resp, err := c.client.Do(req)
    if err != nil { return nil, err }
    defer resp.Body.Close()

    if resp.StatusCode != 200 {
        body, _ := io.ReadAll(resp.Body)
        return nil, fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))
    }
    return io.ReadAll(resp.Body)
}

func parseVisualMarkers(script string) []models.VisualMarker {
    var markers []models.VisualMarker
    for i, line := range strings.Split(script, "\n") {
        if idx := strings.Index(line, "[VISUAL:"); idx != -1 {
            start := idx + len("[VISUAL:")
            end := strings.Index(line[start:], "]")
            if end > 0 {
                desc := strings.TrimSpace(line[start : start+end])
                style := "documentary"
                d := strings.ToLower(desc)
                if strings.Contains(d, "aerial") || strings.Contains(d, "drone") { style = "aerial" }
                if strings.Contains(d, "interior") || strings.Contains(d, "inside") { style = "interior" }
                if strings.Contains(d, "fog") || strings.Contains(d, "dark") { style = "atmospheric" }
                markers = append(markers, models.VisualMarker{Index: i, Description: desc, Style: style})
            }
        }
    }
    return markers
}

func parseSections(script string) map[string]string {
    sections := make(map[string]string)
    current := "uncategorized"
    var content []string

    for _, line := range strings.Split(script, "\n") {
        upper := strings.ToUpper(line)
        switch {
        case strings.Contains(upper, "HOOK") || strings.Contains(upper, "0:00"):
            if current != "uncategorized" && len(content) > 0 { sections[current] = strings.Join(content, "\n") }
            current = "hook"; content = nil
        case strings.Contains(upper, "SETUP") || strings.Contains(upper, "0:15"):
            if current != "uncategorized" && len(content) > 0 { sections[current] = strings.Join(content, "\n") }
            current = "setup"; content = nil
        case strings.Contains(upper, "DISCOVERY") || strings.Contains(upper, "1:30"):
            if current != "uncategorized" && len(content) > 0 { sections[current] = strings.Join(content, "\n") }
            current = "discovery"; content = nil
        case strings.Contains(upper, "REVELATION") || strings.Contains(upper, "4:00"):
            if current != "uncategorized" && len(content) > 0 { sections[current] = strings.Join(content, "\n") }
            current = "revelation"; content = nil
        case strings.Contains(upper, "IMPLICATION") || strings.Contains(upper, "6:30"):
            if current != "uncategorized" && len(content) > 0 { sections[current] = strings.Join(content, "\n") }
            current = "implication"; content = nil
        case strings.Contains(upper, "OUTRO") || strings.Contains(upper, "7:30"):
            if current != "uncategorized" && len(content) > 0 { sections[current] = strings.Join(content, "\n") }
            current = "outro"; content = nil
        }
        content = append(content, line)
    }
    if current != "uncategorized" && len(content) > 0 { sections[current] = strings.Join(content, "\n") }
    return sections
}
```

---

## MODULE 5: IMAGE GENERATION (images/)

### comfyui.go (CPU-only local generation)
```go
package images

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "time"
    "youtube-pipeline/internal/models"
)

type ComfyUIClient struct {
    baseURL string
    client  *http.Client
}

func NewComfyUIClient(baseURL string) *ComfyUIClient {
    return &ComfyUIClient{
        baseURL: baseURL,
        client:  &http.Client{Timeout: 10 * time.Minute},
    }
}

func (c *ComfyUIClient) GenerateBatch(markers []models.VisualMarker, outputDir string) (*models.ImageBatch, error) {
    batch := &models.ImageBatch{
        ID:        fmt.Sprintf("comfyui_%d", time.Now().Unix()),
        Source:    "comfyui",
        Timestamp: time.Now(),
        Status:    "running",
    }

    fmt.Printf("Starting batch of %d images on CPU...\n", len(markers))
    fmt.Printf("Estimated time: %d minutes (4-5 min per image)\n", len(markers)*4)

    for i, marker := range markers {
        prompt := EnhancePrompt(marker)
        outputName := fmt.Sprintf("scene_%02d", i)

        fmt.Printf("[%d/%d] %s...\n", i+1, len(markers), marker.Description[:50])
        start := time.Now()

        img, err := c.generateSingle(prompt, outputName, 1024, 576, 25)
        if err != nil {
            fmt.Printf("  Failed: %v\n", err)
            continue
        }

        img.Index = i
        batch.Images = append(batch.Images, *img)
        time.Sleep(2 * time.Second) // Prevent thermal throttling
    }

    batch.Status = "completed"
    fmt.Printf("\nBatch complete! Generated %d/%d images\n", len(batch.Images), len(markers))
    return batch, nil
}

func (c *ComfyUIClient) generateSingle(prompt, outputName string, width, height, steps int) (*models.GeneratedImage, error) {
    workflow := map[string]interface{}{
        "1": map[string]interface{}{"inputs": map[string]interface{}{"text": prompt}, "class_type": "CLIPTextEncode"},
        "2": map[string]interface{}{"inputs": map[string]interface{}{"text": "blurry, low quality, watermark, text, signature"}, "class_type": "CLIPTextEncode"},
        "3": map[string]interface{}{
            "inputs": map[string]interface{}{
                "seed": 0, "steps": steps, "cfg": 7.0, "sampler_name": "euler_ancestral",
                "scheduler": "normal", "denoise": 1.0, "model": []interface{}{"4", 0},
                "positive": []interface{}{"1", 0}, "negative": []interface{}{"2", 0},
                "latent_image": []interface{}{"5", 0},
            },
            "class_type": "KSampler",
        },
        "4": map[string]interface{}{"inputs": map[string]interface{}{"ckpt_name": "v1-5-pruned-emaonly.safetensors"}, "class_type": "CheckpointLoaderSimple"},
        "5": map[string]interface{}{"inputs": map[string]interface{}{"width": width, "height": height, "batch_size": 1}, "class_type": "EmptyLatentImage"},
        "8": map[string]interface{}{"inputs": map[string]interface{}{"samples": []interface{}{"3", 0}, "vae": []interface{}{"4", 2}}, "class_type": "VAEDecode"},
        "9": map[string]interface{}{"inputs": map[string]interface{}{"filename_prefix": outputName, "images": []interface{}{"8", 0}}, "class_type": "SaveImage"},
    }

    reqBody, _ := json.Marshal(map[string]interface{}{"prompt": workflow})
    req, _ := http.NewRequest("POST", c.baseURL+"/prompt", bytes.NewReader(reqBody))
    req.Header.Set("Content-Type", "application/json")

    start := time.Now()
    resp, err := c.client.Do(req)
    if err != nil { return nil, err }
    defer resp.Body.Close()

    if resp.StatusCode != 200 {
        body, _ := io.ReadAll(resp.Body)
        return nil, fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))
    }

    elapsed := time.Since(start)
    return &models.GeneratedImage{
        Index: 0, Prompt: prompt,
        FilePath: fmt.Sprintf("%s_00001_.png", outputName),
        TimeSeconds: elapsed.Seconds(), Status: "generated",
    }, nil
}

func EnhancePrompt(marker models.VisualMarker) string {
    modifiers := map[string]string{
        "documentary":  "cinematic documentary photography, National Geographic quality, dramatic lighting, photorealistic, 8k resolution",
        "atmospheric":  "moody atmospheric shot, fog, dramatic shadows, cinematic composition, film grain, documentary style",
        "aerial":       "drone aerial photography, bird's eye view, sweeping landscape, cinematic color grading, 8k resolution",
        "interior":     "dramatic interior lighting, dust particles in light beams, archaeological documentation style, photorealistic",
    }
    mod := modifiers[marker.Style]
    if mod == "" { mod = modifiers["documentary"] }
    return fmt.Sprintf("%s, %s", marker.Description, mod)
}
```

### colab.go (Free GPU batch generation)
```go
package images

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "time"
    "youtube-pipeline/internal/models"
)

type ColabClient struct {
    baseURL string
    apiKey  string
    client  *http.Client
}

func NewColabClient(baseURL, apiKey string) *ColabClient {
    return &ColabClient{
        baseURL: baseURL,
        apiKey:  apiKey,
        client:  &http.Client{Timeout: 30 * time.Minute},
    }
}

func (c *ColabClient) SubmitBatch(markers []models.VisualMarker, config BatchConfig) (*models.ImageBatch, error) {
    var prompts []PromptRequest
    for i, m := range markers {
        prompts = append(prompts, PromptRequest{
            Index: i, Prompt: EnhancePrompt(m), Style: m.Style,
            Width: 1024, Height: 576, Steps: 25,
        })
    }

    reqBody, _ := json.Marshal(BatchRequest{Prompts: prompts, Config: config})
    req, _ := http.NewRequest("POST", c.baseURL+"/generate", bytes.NewReader(reqBody))
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("X-API-Key", c.apiKey)

    resp, err := c.client.Do(req)
    if err != nil { return nil, err }
    defer resp.Body.Close()

    body, _ := io.ReadAll(resp.Body)
    if resp.StatusCode != 200 && resp.StatusCode != 202 {
        return nil, fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))
    }

    var result struct {
        BatchID       string `json:"batch_id"`
        Status        string `json:"status"`
        EstimatedTime int    `json:"estimated_time_minutes"`
    }
    json.Unmarshal(body, &result)

    fmt.Printf("Batch submitted to Colab!\n")
    fmt.Printf("  Batch ID: %s | ETA: %d min\n", result.BatchID, result.EstimatedTime)

    return &models.ImageBatch{
        ID: result.BatchID, Source: "colab",
        Timestamp: time.Now(), Status: result.Status,
    }, nil
}

type BatchRequest struct {
    Prompts []PromptRequest `json:"prompts"`
    Config  BatchConfig     `json:"config"`
}

type PromptRequest struct {
    Index  int    `json:"index"`
    Prompt string `json:"prompt"`
    Style  string `json:"style"`
    Width  int    `json:"width"`
    Height int    `json:"height"`
    Steps  int    `json:"steps"`
}

type BatchConfig struct {
    Model     string  `json:"model"`
    BatchSize int     `json:"batch_size"`
    Seed      int     `json:"seed"`
    CFGScale  float64 `json:"cfg_scale"`
    OutputDir string  `json:"output_dir"`
}
```

---

## MODULE 6: VOICEOVER GENERATION (voice/)

### piper.go
```go
package voice

import (
    "fmt"
    "os"
    "os/exec"
    "path/filepath"
    "strings"
    "time"
    "youtube-pipeline/internal/models"
)

type PiperGenerator struct {
    modelPath       string
    configPath      string
    sentenceSilence float64
    lengthScale     float64
}

func NewPiperGenerator(modelPath, configPath string, sentenceSilence, lengthScale float64) *PiperGenerator {
    return &PiperGenerator{
        modelPath: modelPath, configPath: configPath,
        sentenceSilence: sentenceSilence, lengthScale: lengthScale,
    }
}

func (g *PiperGenerator) Generate(scriptText, outputPath string) (*models.Voiceover, error) {
    chunks := g.splitChunks(scriptText, 500)
    fmt.Printf("Generating voiceover: %d chunks\n", len(chunks))

    var chunkFiles []string
    for i, chunk := range chunks {
        chunkFile := fmt.Sprintf("temp_chunk_%d.wav", i)
        cmd := exec.Command("piper-tts",
            "--model", g.modelPath,
            "--config", g.configPath,
            "--output_file", chunkFile,
            "--sentence_silence", fmt.Sprintf("%.2f", g.sentenceSilence),
            "--length_scale", fmt.Sprintf("%.2f", g.lengthScale),
        )
        cmd.Stdin = strings.NewReader(chunk)
        if err := cmd.Run(); err != nil {
            for _, f := range chunkFiles { os.Remove(f) }
            return nil, fmt.Errorf("chunk %d: %w", i, err)
        }
        chunkFiles = append(chunkFiles, chunkFile)
        fmt.Printf("  Chunk %d/%d complete\n", i+1, len(chunks))
    }

    if err := g.concatChunks(chunkFiles, outputPath); err != nil {
        return nil, err
    }
    for _, f := range chunkFiles { os.Remove(f) }

    wordCount := len(strings.Fields(scriptText))
    return &models.Voiceover{
        ID:        fmt.Sprintf("voice_%d", time.Now().Unix()),
        FilePath:  outputPath,
        Duration:  float64(wordCount) / 150.0,
        Model:     filepath.Base(g.modelPath),
        Chunks:    len(chunks),
        Timestamp: time.Now(),
    }, nil
}

func (g *PiperGenerator) splitChunks(text string, maxChars int) []string {
    sentences := strings.Split(text, ". ")
    var chunks []string
    var current []string
    length := 0

    for _, s := range sentences {
        s = strings.TrimSpace(s)
        if s == "" { continue }
        if length+len(s) > maxChars && len(current) > 0 {
            chunks = append(chunks, strings.Join(current, ". ")+".")
            current = []string{s}; length = len(s)
        } else {
            current = append(current, s); length += len(s)
        }
    }
    if len(current) > 0 { chunks = append(chunks, strings.Join(current, ". ")+".") }
    return chunks
}

func (g *PiperGenerator) concatChunks(files []string, output string) error {
    listFile := "concat_list.txt"
    var content strings.Builder
    for _, f := range files { content.WriteString(fmt.Sprintf("file '%s'\n", f)) }
    os.WriteFile(listFile, []byte(content.String()), 0644)
    defer os.Remove(listFile)

    cmd := exec.Command("ffmpeg", "-f", "concat", "-safe", "0", "-i", listFile,
        "-acodec", "pcm_s16le", "-ar", "44100", "-y", output)
    out, err := cmd.CombinedOutput()
    if err != nil { return fmt.Errorf("ffmpeg: %w\n%s", err, string(out)) }
    return nil
}
```

---

## MODULE 7: METADATA OPTIMIZER (metadata/)

```go
package metadata

import (
    "fmt"
    "strings"
    "time"
    "youtube-pipeline/internal/models"
)

type Optimizer struct {
    tagTemplates map[string][]string
}

func NewOptimizer() *Optimizer {
    return &Optimizer{
        tagTemplates: map[string][]string{
            "abandoned":    {"abandoned places", "urban exploration", "abandoned history", "forgotten places"},
            "mystery":      {"unsolved mystery", "historical mystery", "ancient mystery", "mysterious places"},
            "architecture": {"ancient architecture", "lost civilization", "archaeological", "ancient ruins"},
            "underground":  {"underground tunnels", "secret passages", "hidden underground", "subterranean"},
        },
    }
}

func (o *Optimizer) Generate(title, summary string, duration int) *models.Metadata {
    category := o.detectCategory(title)
    return &models.Metadata{
        ID:            fmt.Sprintf("meta_%d", time.Now().Unix()),
        Title:         title,
        Description:   o.generateDescription(title, summary),
        Tags:          o.generateTags(title, category),
        Category:      "Education",
        Chapters:      o.generateChapters(duration),
        ThumbnailText: o.suggestThumbnailText(title),
        PrivacyStatus: "private",
    }
}

func (o *Optimizer) detectCategory(title string) string {
    t := strings.ToLower(title)
    if containsAny(t, []string{"abandoned", "ruins", "decay"}) { return "abandoned" }
    if containsAny(t, []string{"mystery", "secret", "hidden", "unknown"}) { return "mystery" }
    if containsAny(t, []string{"temple", "pyramid", "architecture", "built"}) { return "architecture" }
    if containsAny(t, []string{"underground", "tunnel", "beneath", "buried"}) { return "underground" }
    return "mystery"
}

func (o *Optimizer) generateDescription(title, summary string) string {
    hook := summary
    if len(hook) > 150 { hook = hook[:150] + "..." }
    return fmt.Sprintf(`%s

In this documentary, we explore the fascinating story behind %s and uncover details that most people have never heard. From forgotten archives to modern discoveries, the truth about this place is more intriguing than most people realize.

🎬 RELATED DOCUMENTARIES:
[Add links to your previous videos here]

📚 SOURCES & REFERENCES:
• Atlas Obscura - %s
• Wikipedia - Historical records
• Academic journals (where applicable)

🔔 SUBSCRIBE for new historical documentaries every week.

#HistoricalDocumentary #AbandonedPlaces #Mystery`, hook, title, title)
}

func (o *Optimizer) generateTags(title, category string) []string {
    base := []string{"historical documentary", "documentary 2026", "history channel alternative", "faceless documentary", "educational content"}
    catTags := o.tagTemplates[category]
    if catTags == nil { catTags = []string{} }

    var titleTags []string
    for _, w := range strings.Fields(title) {
        w = strings.ToLower(w)
        if len(w) > 3 && w != "that" && w != "this" && w != "with" && w != "from" && w != "what" {
            titleTags = append(titleTags, w)
        }
    }

    all := append(base, catTags...)
    all = append(all, titleTags...)
    return uniqueStrings(all)[:15]
}

func (o *Optimizer) generateChapters(duration int) []models.Chapter {
    if duration < 8 { return nil }
    return []models.Chapter{
        {Time: "0:00", Title: "Introduction"},
        {Time: "1:00", Title: "The Discovery"},
        {Time: "3:00", Title: "Hidden Truths"},
        {Time: "5:00", Title: "Modern Revelations"},
        {Time: fmt.Sprintf("%d:00", duration-1), Title: "Conclusion"},
    }
}

func (o *Optimizer) suggestThumbnailText(title string) []string {
    words := strings.Fields(title)
    var dramatic []string
    for _, w := range words {
        w = strings.ToLower(w)
        if len(w) > 3 && w != "the" && w != "that" && w != "this" && w != "was" && w != "were" && w != "and" && w != "but" {
            dramatic = append(dramatic, strings.ToUpper(w))
        }
    }
    suggestions := []string{
        strings.Join(dramatic[:min(len(dramatic), 3)], " "),
        "NOBODY KNOWS",
        "THE TRUTH",
        "ABANDONED",
    }
    return uniqueStrings(suggestions)[:3]
}

func containsAny(s string, targets []string) bool {
    for _, t := range targets {
        if strings.Contains(s, t) { return true }
    }
    return false
}

func uniqueStrings(s []string) []string {
    seen := make(map[string]bool)
    var result []string
    for _, v := range s {
        if !seen[v] { seen[v] = true; result = append(result, v) }
    }
    return result
}

func min(a, b int) int {
    if a < b { return a }
    return b
}
```

---

## MAIN ORCHESTRATOR (cmd/pipeline/main.go)

```go
package main

import (
    "encoding/json"
    "flag"
    "fmt"
    "log"
    "os"
    "time"

    "youtube-pipeline/internal/config"
    "youtube-pipeline/internal/models"
    "youtube-pipeline/internal/research"
    "youtube-pipeline/internal/script"
    "youtube-pipeline/internal/images"
    "youtube-pipeline/internal/voice"
    "youtube-pipeline/internal/metadata"
)

func main() {
    var cfgPath = flag.String("config", "configs/config.yaml", "Config file path")
    var mode = flag.String("mode", "full", "Mode: full, research, script, images, voice, metadata")
    flag.Parse()

    cfg, err := config.Load(*cfgPath)
    if err != nil { log.Fatalf("Config: %v", err) }
    if err := cfg.EnsureDirs(); err != nil { log.Fatalf("Dirs: %v", err) }

    switch *mode {
    case "research":
        runResearch(cfg)
    case "script":
        runScript(cfg)
    case "images":
        runImages(cfg)
    case "voice":
        runVoice(cfg)
    case "metadata":
        runMetadata(cfg)
    case "full":
        runFullPipeline(cfg)
    default:
        log.Fatalf("Unknown mode: %s", *mode)
    }
}

func runResearch(cfg *config.Config) {
    fmt.Println("🔍 Researching topics...")

    atlas := research.NewAtlasObscuraScraper()
    topics, err := atlas.Scrape(20)
    if err != nil { log.Fatalf("Atlas: %v", err) }

    reddit := research.NewRedditScraper()
    for _, sub := range []string{"UnresolvedMysteries", "AbandonedPorn"} {
        t, err := reddit.ScrapeSubreddit(sub, 10)
        if err == nil { topics = append(topics, t...) }
    }

    // Sort by score
    // ... sorting logic

    report := models.ResearchReport{
        ID: fmt.Sprintf("research_%d", time.Now().Unix()),
        GeneratedAt: time.Now(),
        TotalTopics: len(topics),
        Recommendations: topics[:min(len(topics), 10)],
    }

    path := fmt.Sprintf("%s/research_%s.json", cfg.Dirs.Topics, time.Now().Format("20060102"))
    saveJSON(path, report)

    fmt.Printf("✅ Found %d topics, saved to %s\n", len(topics), path)
    for i, t := range topics[:5] {
        fmt.Printf("  %d. [%d pts] %s\n", i+1, t.CuriosityScore, t.Title)
    }
}

func runScript(cfg *config.Config) {
    fmt.Println("📝 Generating script...")
    // Load topic from file or stdin
    // Generate via Ollama
    // Save draft
    fmt.Println("⚠️  Human editing required before next step")
}

func runImages(cfg *config.Config) {
    fmt.Println("🎨 Generating images...")
    // Load script, parse visual markers
    // Generate via ComfyUI or Colab
    fmt.Println("⚠️  Human selection required before video assembly")
}

func runVoice(cfg *config.Config) {
    fmt.Println("🎙️  Generating voiceover...")
    // Load finalized script
    // Generate via Piper TTS
}

func runMetadata(cfg *config.Config) {
    fmt.Println("📋 Optimizing metadata...")
    // Generate title, description, tags, chapters
    // Output ready-to-paste format
}

func runFullPipeline(cfg *config.Config) {
    fmt.Println("🎬 Running full pipeline...")
    // Orchestrate all steps with human checkpoints
}

func saveJSON(path string, v interface{}) {
    data, _ := json.MarshalIndent(v, "", "  ")
    os.WriteFile(path, data, 0644)
}
```

---

## GO.MOD

```go
module youtube-pipeline

go 1.22

require (
    github.com/PuerkitoBio/goquery v1.9.2
    gopkg.in/yaml.v3 v3.0.1
    google.golang.org/api v0.188.0 // YouTube Data API
)

require (
    github.com/andybalholm/cascadia v1.3.2 // indirect
    golang.org/x/net v0.26.0 // indirect
)
```

---

## MAKEFILE

```makefile
.PHONY: build run test clean deps

BINARY_NAME=youtube-pipeline
BUILD_DIR=build

build:
	go build -o $(BUILD_DIR)/$(BINARY_NAME) ./cmd/pipeline

build-all:
	GOOS=linux GOARCH=amd64 go build -o $(BUILD_DIR)/$(BINARY_NAME)-linux ./cmd/pipeline
	GOOS=windows GOARCH=amd64 go build -o $(BUILD_DIR)/$(BINARY_NAME)-windows.exe ./cmd/pipeline
	GOOS=darwin GOARCH=amd64 go build -o $(BUILD_DIR)/$(BINARY_NAME)-macos ./cmd/pipeline

run:
	go run ./cmd/pipeline -config configs/config.yaml

research:
	go run ./cmd/research -config configs/config.yaml

script:
	go run ./cmd/script -config configs/config.yaml

images:
	go run ./cmd/images -config configs/config.yaml

voice:
	go run ./cmd/voice -config configs/config.yaml

metadata:
	go run ./cmd/metadata -config configs/config.yaml

test:
	go test ./...

deps:
	go mod download
	go mod tidy

clean:
	rm -rf $(BUILD_DIR)
	rm -f temp_chunk_*.wav concat_list.txt

install:
	go install ./cmd/pipeline
```

---

## SETUP INSTRUCTIONS

```bash
# 1. Initialize project
go mod init youtube-pipeline

# 2. Install dependencies
go get github.com/PuerkitoBio/goquery
go get gopkg.in/yaml.v3

# 3. Install external tools
# Ollama (for script generation)
curl -fsSL https://ollama.com/install.sh | sh
ollama pull mistral

# Piper TTS (for voiceover)
pip install piper-tts
# Download voices from https://github.com/rhasspy/piper/releases

# ComfyUI (optional, for local image generation)
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI && pip install -r requirements.txt

# FFmpeg (for audio/video processing)
# Ubuntu/Debian: sudo apt install ffmpeg
# macOS: brew install ffmpeg
# Windows: choco install ffmpeg

# 4. Build
cd youtube-pipeline
make build

# 5. Run research
make research

# 6. Review output, pick topic, run script generation
make script

# 7. Edit script, then generate images
make images

# 8. Generate voiceover
make voice

# 9. Edit in DaVinci Resolve (manual step)

# 10. Generate metadata
make metadata

# 11. Upload (manual review first)
make upload
```

---

## PERFORMANCE ON YOUR HARDWARE

| Task | Tool | Time | RAM Usage |
|------|------|------|-----------|
| Script generation | Ollama + Mistral 7B | 45s | ~6GB |
| Voiceover (10min) | Piper TTS | 30s | ~500MB |
| Image (1x, CPU) | ComfyUI + SD 1.5 | 4-5min | ~4GB |
| Image batch (20x, overnight) | ComfyUI + SD 1.5 | ~90min | ~4GB |
| Metadata generation | Go native | <1s | ~50MB |
| Video export (10min) | DaVinci Resolve | 8-12min | ~2GB |

**Total per video: ~6 hours (2 hours automated, 4 hours human editing)**
**Weekly output: 2 videos in ~12 hours**
**Monthly cost: $0**

---

## HUMAN CHECKPOINTS (CRITICAL)

| Step | Automated | Human Required | Why |
|------|-----------|----------------|-----|
| Research | ✅ Scrape + Score | ✅ Pick topic | Creativity + intuition |
| Script draft | ✅ Generate | ✅ Edit + Polish | Voice, facts, personality |
| Images | ✅ Batch generate | ✅ Select best 15-20 | Aesthetic judgment |
| Voiceover | ✅ Generate | ✅ Review + Adjust | Pacing, emphasis |
| Video edit | ❌ Manual | ✅ DaVinci Resolve | Creative decisions |
| Thumbnail | ❌ Manual | ✅ Canva | CTR optimization |
| Metadata | ✅ Generate | ✅ Review + Tweak | SEO fine-tuning |
| Upload | ✅ Schedule | ✅ Final review | Catch errors |

---

## CLAUDE CODE PROMPTS

Use these prompts with Claude Code to build each module:

### 1. Initialize project structure
```
Create a Go project at youtube-pipeline/ with the following structure:
- cmd/pipeline/main.go (orchestrator)
- cmd/research/main.go (standalone research tool)
- cmd/script/main.go (standalone script generator)
- internal/config/config.go (YAML config loader)
- internal/models/models.go (data structures)
- internal/research/ (Atlas Obscura + Reddit scrapers)
- internal/script/ (Ollama integration)
- internal/images/ (ComfyUI + Colab clients)
- internal/voice/ (Piper TTS + FFmpeg)
- internal/metadata/ (YouTube metadata optimizer)
- internal/utils/ (HTTP client, file helpers)
- configs/config.yaml (default configuration)
- go.mod, Makefile, README.md

Use goquery for HTML scraping, yaml.v3 for config, standard net/http for APIs.
```

### 2. Build research module
```
Implement the research module with:
1. AtlasObscuraScraper that scrapes atlasobscura.com/places for unusual locations
2. RedditScraper that fetches hot posts from r/UnresolvedMysteries and r/AbandonedPorn
3. Topic scoring algorithm (curiosity words, visual potential, location value)
4. ResearchReport generation with JSON output
5. YouTube title suggestion generator

The scraper should output ranked topics with scores 0-100.
```

### 3. Build script generation module
```
Implement the script module with:
1. OllamaClient that connects to http://localhost:11434
2. GenerateScript method that takes a Topic and title, returns a Script struct
3. System prompt for documentary scriptwriting (150 words/minute, 8-10 min target)
4. Parse visual markers [VISUAL: ...] from generated text
5. Parse sections (HOOK, SETUP, DISCOVERY, REVELATION, IMPLICATION, OUTRO)
6. Save draft as JSON with human_notes: "EDIT REQUIRED"
```

### 4. Build image generation module
```
Implement the image module with:
1. ComfyUIClient for local CPU generation (http://127.0.0.1:8188)
2. ColabClient for free GPU batch generation
3. EnhancePrompt function that adds style modifiers (documentary, atmospheric, aerial, interior)
4. Batch generation with progress tracking
5. Support for SD 1.5 (fast) and SDXL (quality) workflows
```

### 5. Build voice generation module
```
Implement the voice module with:
1. PiperGenerator that calls piper-tts binary
2. Text chunking for long scripts (500 char chunks)
3. FFmpeg concatenation of chunk files
4. Support for sentence_silence and length_scale parameters
5. Output WAV file at 44100Hz, 16-bit PCM
```

### 6. Build metadata optimizer
```
Implement the metadata module with:
1. Detect category from title (abandoned, mystery, architecture, underground)
2. Generate YouTube description with hook, related videos, sources, subscribe CTA
3. Generate 15 optimized tags based on category + title words
4. Generate chapters for videos > 8 minutes
5. Suggest 3 thumbnail text options
6. Output plain text format for easy copy-paste
```

---

Generated: July 2026
Version: 1.0
Target: Claude Code / AI coding assistant
