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
	if c.Ollama.BaseURL == "" {
		c.Ollama.BaseURL = "http://localhost:11434"
	}
	if c.Ollama.Model == "" {
		c.Ollama.Model = "mistral"
	}
	if c.Ollama.MaxTokens == 0 {
		c.Ollama.MaxTokens = 2500
	}
	if c.Ollama.Temperature == 0 {
		c.Ollama.Temperature = 0.7
	}
	if c.Pipeline.TargetDuration == 0 {
		c.Pipeline.TargetDuration = 10
	}
	if c.Pipeline.WordsPerMinute == 0 {
		c.Pipeline.WordsPerMinute = 150
	}
	if c.Pipeline.VideosPerWeek == 0 {
		c.Pipeline.VideosPerWeek = 2
	}
	if c.Pipeline.ImagesPerVideo == 0 {
		c.Pipeline.ImagesPerVideo = 20
	}
	if c.Dirs.Topics == "" {
		c.Dirs.Topics = "data/topics"
	}
	if c.Dirs.Scripts == "" {
		c.Dirs.Scripts = "data/scripts"
	}
	if c.Dirs.Images == "" {
		c.Dirs.Images = "data/images"
	}
	if c.Dirs.Voice == "" {
		c.Dirs.Voice = "data/voice"
	}
	if c.Dirs.Videos == "" {
		c.Dirs.Videos = "data/videos"
	}
	if c.Dirs.Output == "" {
		c.Dirs.Output = "data/output"
	}
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