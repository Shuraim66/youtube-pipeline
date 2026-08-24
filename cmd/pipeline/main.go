package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"sort"
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
	cfgPath := flag.String("config", "configs/config.yaml", "Config file path")
	mode := flag.String("mode", "full", "Mode: full, research, script, images, voice, metadata")
	topicID := flag.String("topic", "", "Specific topic ID to use")
	title := flag.String("title", "", "Video title override")
	duration := flag.Int("duration", 10, "Target duration in minutes")
	flag.Parse()

	cfg, err := config.Load(*cfgPath)
	if err != nil {
		log.Fatalf("Config: %v", err)
	}
	if err := cfg.EnsureDirs(); err != nil {
		log.Fatalf("Dirs: %v", err)
	}

	switch *mode {
	case "research":
		runResearch(cfg)
	case "script":
		runScript(cfg, *topicID, *title, *duration)
	case "images":
		runImages(cfg, *topicID)
	case "voice":
		runVoice(cfg, *topicID)
	case "metadata":
		runMetadata(cfg, *topicID, *duration)
	case "full":
		runFullPipeline(cfg, *topicID, *title, *duration)
	default:
		log.Fatalf("Unknown mode: %s", *mode)
	}
}

func runResearch(cfg *config.Config) {
	fmt.Println("🔍 Researching topics...")

	// Load existing topics
	existingTopics := loadExistingTopics(cfg)

	// Try live research
	liveTopics, _ := researchFromAPIs()
	if len(liveTopics) > 0 {
		existingTopics = append(existingTopics, liveTopics...)
	} else {
		fmt.Println("⚠️  External APIs unavailable")
	}

	// If no topics, use samples
	if len(existingTopics) == 0 {
		fmt.Println("   Using sample topics for demo")
		existingTopics = research.SampleTopics()
	}

	topics := existingTopics

	// Sort by score
	sort.Slice(topics, func(i, j int) bool {
		return topics[i].CuriosityScore > topics[j].CuriosityScore
	})

	// Deduplicate
	seen := make(map[string]bool)
	var uniqueTopics []models.Topic
	for _, t := range topics {
		if !seen[t.ID] {
			seen[t.ID] = true
			uniqueTopics = append(uniqueTopics, t)
		}
	}
	topics = uniqueTopics

	// Calculate slice limits
	recCount := min(len(topics), 10)
	titleCount := min(len(topics), 5)

	report := models.ResearchReport{
		ID:              fmt.Sprintf("research_%d", time.Now().Unix()),
		GeneratedAt:     time.Now(),
		TotalTopics:     len(topics),
		Recommendations: topics[:recCount],
		SuggestedTitles: generateSuggestedTitles(topics[:titleCount]),
	}

	path := fmt.Sprintf("%s/research_%s.json", cfg.Dirs.Topics, time.Now().Format("20060102_150405"))
	saveJSON(path, report)

	fmt.Printf("✅ Found %d topics, saved to %s\n", len(topics), path)
	for i, t := range topics[:titleCount] {
		fmt.Printf("  %d. [%d pts] %s (Visual: %d%%)\n", i+1, t.CuriosityScore, t.Title, t.VisualPotential)
	}
}

func runScript(cfg *config.Config, topicID, title string, duration int) {
	fmt.Println("📝 Generating script...")

	// Load topic
	var topic models.Topic
	if topicID != "" {
		topic = loadTopicByID(cfg.Dirs.Topics, topicID)
	} else {
		topic = loadLatestTopic(cfg.Dirs.Topics)
	}

	if topic.ID == "" {
		log.Fatalf("No topic found. Run research first or specify topic ID with -topic")
	}

	titleText := title
	if titleText == "" {
		titleText = fmt.Sprintf("The Secret of %s", topic.Title)
	}

	// Generate script
	client := script.NewOllamaClient(cfg.Ollama.BaseURL, cfg.Ollama.Model)
	script, err := client.GenerateScript(topic, titleText, duration)
	if err != nil {
		log.Fatalf("Script generation: %v", err)
	}

	// Save script
	filename := fmt.Sprintf("%s/script_%s.json", cfg.Dirs.Scripts, script.ID)
	data, _ := json.MarshalIndent(script, "", "  ")
	os.WriteFile(filename, data, 0644)

	fmt.Printf("✅ Script generated!\n")
	fmt.Printf("📁 Saved to: %s\n", filename)
	fmt.Printf("📝 Word count: %d\n", script.WordCount)
	fmt.Printf("⏱️  Estimated duration: %.1f minutes\n", script.EstimatedDuration)
	fmt.Printf("🎨 Visual markers: %d\n", len(script.VisualMarkers))
}

func runImages(cfg *config.Config, topicID string) {
	fmt.Println("🎨 Generating images...")

	// Find latest script
	scriptPath := findLatestScript(cfg.Dirs.Scripts)
	if scriptPath == "" {
		log.Fatalf("No script found. Run script generation first")
	}

	// Load script and extract markers
	markers := extractMarkersFromScript(scriptPath)
	if len(markers) == 0 {
		log.Fatalf("No visual markers found in script")
	}

	fmt.Printf("Found %d visual markers\n", len(markers))

	// Use ComfyUI
	client := images.NewComfyUIClient(cfg.ComfyUI.BaseURL)
	batch, err := client.GenerateBatch(markers, cfg.Dirs.Images)
	if err != nil {
		log.Fatalf("Image generation: %v", err)
	}

	fmt.Printf("✅ Generated %d images\n", len(batch.Images))

	// Save batch metadata
	batchPath := fmt.Sprintf("%s/batch_%s.json", cfg.Dirs.Images, batch.ID)
	data, _ := json.MarshalIndent(batch, "", "  ")
	os.WriteFile(batchPath, data, 0644)
	fmt.Printf("📁 Batch metadata: %s\n", batchPath)
}

func runVoice(cfg *config.Config, topicID string) {
	fmt.Println("🎙️  Generating voiceover...")

	// Find latest script
	scriptPath := findLatestScript(cfg.Dirs.Scripts)
	if scriptPath == "" {
		log.Fatalf("No script found. Run script generation first")
	}

	// Load script
	data, _ := os.ReadFile(scriptPath)
	var script models.Script
	json.Unmarshal(data, &script)

	if script.Final == "" {
		log.Fatalf("Script not finalized. Edit and save the script first")
	}

	// Generate voiceover
	generator := voice.NewPiperGenerator(
		cfg.Piper.ModelPath,
		cfg.Piper.ConfigPath,
		cfg.Piper.SentenceSilence,
		cfg.Piper.LengthScale,
	)

	outputPath := fmt.Sprintf("%s/voice_%s.wav", cfg.Dirs.Voice, time.Now().Format("20060102_150405"))
	voiceover, err := generator.Generate(script.Final, outputPath)
	if err != nil {
		log.Fatalf("Voice generation: %v", err)
	}

	fmt.Printf("✅ Voiceover generated!\n")
	fmt.Printf("📁 Saved to: %s\n", outputPath)
	fmt.Printf("⏱️  Duration: %.1f minutes\n", voiceover.Duration)
}

func runMetadata(cfg *config.Config, topicID string, duration int) {
	fmt.Println("📋 Optimizing metadata...")

	// Load topic
	var topic models.Topic
	if topicID != "" {
		topic = loadTopicByID(cfg.Dirs.Topics, topicID)
	} else {
		topic = loadLatestTopic(cfg.Dirs.Topics)
	}

	// Generate metadata
	optimizer := metadata.NewOptimizer()
	meta := optimizer.Generate(topic.Title, topic.Description, duration)

	// Save metadata
	timestamp := time.Now().Format("20060102_150405")
	filename := fmt.Sprintf("%s/metadata_%s.json", cfg.Dirs.Output, timestamp)
	data, _ := json.MarshalIndent(meta, "", "  ")
	os.WriteFile(filename, data, 0644)

	fmt.Printf("✅ Metadata generated!\n")
	fmt.Printf("📁 Saved to: %s\n\n", filename)

	fmt.Println("=== YOUTUBE UPLOAD TEMPLATE ===\n")
	fmt.Printf("📺 TITLE:\n%s\n\n", meta.Title)
	fmt.Printf("📖 DESCRIPTION:\n%s\n\n", meta.Description)
	fmt.Printf("🏷️  TAGS (%d):\n%s\n", len(meta.Tags), stringsJoin(meta.Tags, ", "))
}

func runFullPipeline(cfg *config.Config, topicID, title string, duration int) {
	fmt.Println("🎬 Running full pipeline...\n")

	// Step 1: Research
	fmt.Println("=== STEP 1: Research ===")
	runResearch(cfg)

	// Step 2: Script Generation
	fmt.Println("\n=== STEP 2: Script Generation ===")
	runScript(cfg, topicID, title, duration)

	// Step 3: Image Generation
	fmt.Println("\n=== STEP 3: Image Generation ===")
	runImages(cfg, topicID)

	// Step 4: Voiceover
	fmt.Println("\n=== STEP 4: Voiceover ===")
	runVoice(cfg, topicID)

	// Step 5: Metadata
	fmt.Println("\n=== STEP 5: Metadata ===")
	runMetadata(cfg, topicID, duration)

	fmt.Println("\n✅ Pipeline complete!")
	fmt.Println("\n⚠️  NEXT STEPS:")
	fmt.Println("   1. Select best images from data/images/")
	fmt.Println("   2. Edit script in data/scripts/ if needed")
	fmt.Println("   3. Render video in DaVinci Resolve")
	fmt.Println("   4. Create thumbnail in Canva")
	fmt.Println("   5. Upload with: make upload")
}

func researchFromAPIs() ([]models.Topic, error) {
	var topics []models.Topic

	atlas := research.NewAtlasObscuraScraper()
	t, err := atlas.Scrape(20)
	if err == nil {
		topics = append(topics, t...)
	}

	reddit := research.NewRedditScraper()
	for _, sub := range []string{"UnresolvedMysteries", "AbandonedPorn"} {
		r, err := reddit.ScrapeSubreddit(sub, 10)
		if err == nil {
			topics = append(topics, r...)
		}
	}

	return topics, nil
}

func loadExistingTopics(cfg *config.Config) []models.Topic {
	topicsPath := findLatestTopicsFile(cfg.Dirs.Topics)
	if topicsPath == "" {
		return nil
	}
	data, err := os.ReadFile(topicsPath)
	if err != nil {
		return nil
	}
	var report models.ResearchReport
	json.Unmarshal(data, &report)
	return report.Recommendations
}

func findLatestTopicsFile(dir string) string {
	files, _ := os.ReadDir(dir)
	var latestTime time.Time
	var latestFile string

	for _, f := range files {
		if !stringsHasSuffix(f.Name(), ".json") {
			continue
		}
		info, _ := f.Info()
		if info.ModTime().After(latestTime) {
			latestTime = info.ModTime()
			latestFile = dir + "/" + f.Name()
		}
	}
	return latestFile
}

func generateSuggestedTitles(topics []models.Topic) []string {
	var titles []string
	for _, t := range topics {
		titles = append(titles, research.GenerateYouTubeTitles(t)...)
	}
	unique := uniqueStrings(titles)
	if len(unique) > 10 {
		return unique[:10]
	}
	return unique
}

func saveJSON(path string, v interface{}) {
	data, _ := json.MarshalIndent(v, "", "  ")
	os.WriteFile(path, data, 0644)
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func uniqueStrings(s []string) []string {
	seen := make(map[string]bool)
	var result []string
	for _, v := range s {
		if !seen[v] {
			seen[v] = true
			result = append(result, v)
		}
	}
	return result
}

func stringsJoin(elems []string, sep string) string {
	switch len(elems) {
	case 0:
		return ""
	case 1:
		return elems[0]
	}
	n := len(sep) * (len(elems) - 1)
	for i := 0; i < len(elems); i++ {
		n += len(elems[i])
	}
	var b []byte
	b = append(b, elems[0]...)
	for _, s := range elems[1:] {
		b = append(b, sep...)
		b = append(b, s...)
	}
	return string(b)
}

// Helper functions
func loadTopicByID(dir, id string) models.Topic {
	files, _ := os.ReadDir(dir)
	for _, f := range files {
		if !stringsHasSuffix(f.Name(), ".json") {
			continue
		}
		data, _ := os.ReadFile(dir + "/" + f.Name())
		var report models.ResearchReport
		json.Unmarshal(data, &report)
		for _, t := range report.Recommendations {
			if t.ID == id {
				return t
			}
		}
	}
	return models.Topic{}
}

func loadLatestTopic(dir string) models.Topic {
	files, _ := os.ReadDir(dir)
	var latestTime time.Time
	var latestFile string

	for _, f := range files {
		if !stringsHasSuffix(f.Name(), ".json") {
			continue
		}
		info, _ := f.Info()
		if info.ModTime().After(latestTime) {
			latestTime = info.ModTime()
			latestFile = dir + "/" + f.Name()
		}
	}

	if latestFile == "" {
		return models.Topic{}
	}

	data, _ := os.ReadFile(latestFile)
	var report models.ResearchReport
	json.Unmarshal(data, &report)

	if len(report.Recommendations) > 0 {
		return report.Recommendations[0]
	}
	return models.Topic{}
}

func findLatestScript(dir string) string {
	files, _ := os.ReadDir(dir)
	var latestTime time.Time
	var latestFile string

	for _, f := range files {
		if !stringsHasSuffix(f.Name(), ".json") {
			continue
		}
		info, _ := f.Info()
		if info.ModTime().After(latestTime) {
			latestTime = info.ModTime()
			latestFile = dir + "/" + f.Name()
		}
	}
	return latestFile
}

func extractMarkersFromScript(path string) []models.VisualMarker {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil
	}

	var script models.Script
	json.Unmarshal(data, &script)
	return script.VisualMarkers
}

func stringsHasSuffix(s, suffix string) bool {
	return len(s) >= len(suffix) && s[len(s)-len(suffix):] == suffix
}