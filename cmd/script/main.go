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
	"youtube-pipeline/internal/script"
)

func main() {
	cfgPath := flag.String("config", "configs/config.yaml", "Config file path")
	topicID := flag.String("topic", "", "Topic ID to generate script for")
	title := flag.String("title", "", "Video title")
	duration := flag.Int("duration", 10, "Target duration in minutes")
	flag.Parse()

	cfg, err := config.Load(*cfgPath)
	if err != nil {
		log.Fatalf("Config: %v", err)
	}

	// Load topic
	var topic models.Topic
	if *topicID != "" {
		topic = loadTopicByID(cfg.Dirs.Topics, *topicID)
	} else {
		topic = loadLatestTopic(cfg.Dirs.Topics)
	}

	if topic.ID == "" {
		log.Fatalf("No topic found. Run 'make research' first or specify topic ID with -topic")
	}

	// Generate script
	client := script.NewOllamaClient(cfg.Ollama.BaseURL, cfg.Ollama.Model)
	titleText := *title
	if titleText == "" {
		titleText = fmt.Sprintf("The Secret of %s", topic.Title)
	}

	fmt.Printf("Generating script for: %s\n", titleText)
	script, err := client.GenerateScript(topic, titleText, *duration)
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
	fmt.Printf("🎨 Visual markers: %d\n\n", len(script.VisualMarkers))

	fmt.Println("Visual markers found:")
	for i, m := range script.VisualMarkers {
		fmt.Printf("  %d. [%s] %s\n", i+1, m.Style, m.Description)
	}

	fmt.Printf("\n⚠️  HUMAN EDITING REQUIRED before proceeding to image generation\n")
	fmt.Printf("   Edit the script in: %s\n", filename)
}

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

func stringsHasSuffix(s, suffix string) bool {
	return len(s) >= len(suffix) && s[len(s)-len(suffix):] == suffix
}