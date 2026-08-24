package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"youtube-pipeline/internal/config"
	"youtube-pipeline/internal/models"
	"youtube-pipeline/internal/metadata"
)

func main() {
	cfgPath := flag.String("config", "configs/config.yaml", "Config file path")
	topicID := flag.String("topic", "", "Topic ID to generate metadata for")
	scriptID := flag.String("script", "", "Script ID to generate metadata for")
	duration := flag.Int("duration", 10, "Video duration in minutes")
	flag.Parse()

	cfg, err := config.Load(*cfgPath)
	if err != nil {
		log.Fatalf("Config: %v", err)
	}

	// Load topic
	var topic models.Topic
	if *topicID != "" {
		topic = loadTopicByID(cfg.Dirs.Topics, *topicID)
	} else if *scriptID != "" {
		topic = loadTopicByScriptID(cfg.Dirs.Scripts, *scriptID)
	} else {
		topic = loadLatestTopic(cfg.Dirs.Topics)
	}

	if topic.ID == "" {
		log.Fatalf("No topic found. Run 'make research' first or specify with -topic")
	}

	// Load script if available
	var script models.Script
	if *scriptID != "" {
		script = loadScriptByID(cfg.Dirs.Scripts, *scriptID)
	}

	// Generate metadata
	optimizer := metadata.NewOptimizer()
	title := topic.Title
	summary := topic.Description

	if len(script.Sections) > 0 {
		// Use script sections for better summary
		if hook, ok := script.Sections["hook"]; ok {
			summary = hook
		}
	}

	meta := optimizer.Generate(title, summary, *duration)
	meta.ScriptID = script.ID

	// Save metadata
	timestamp := time.Now().Format("20060102_150405")
	filename := fmt.Sprintf("%s/metadata_%s.json", cfg.Dirs.Output, timestamp)
	data, _ := json.MarshalIndent(meta, "", "  ")
	os.WriteFile(filename, data, 0644)

	fmt.Printf("📋 Metadata generated!\n")
	fmt.Printf("📁 Saved to: %s\n\n", filename)

	// Print formatted output for copy-paste
	fmt.Println("=== YOUTUBE UPLOAD TEMPLATE ===\n")

	fmt.Printf("📺 TITLE:\n%s\n\n", meta.Title)

	fmt.Printf("📖 DESCRIPTION:\n%s\n\n", meta.Description)

	fmt.Printf("🏷️  TAGS (%d):\n%s\n\n", len(meta.Tags), strings.Join(meta.Tags, ", "))

	if len(meta.Chapters) > 0 {
		fmt.Println("📚 CHAPTERS:")
		for _, ch := range meta.Chapters {
			fmt.Printf("   %s - %s\n", ch.Time, ch.Title)
		}
		fmt.Println()
	}

	fmt.Println("🖼️  THUMBNAIL TEXT OPTIONS:")
	for i, t := range meta.ThumbnailText {
		fmt.Printf("   %d. %s\n", i+1, t)
	}

	fmt.Printf("\n📊 CATEGORY: %s\n", meta.Category)
	fmt.Printf("🔒 PRIVACY: %s\n", meta.PrivacyStatus)

	fmt.Println("\n⚠️  Review and edit before uploading!")
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

func loadTopicByScriptID(dir, scriptID string) models.Topic {
	// This would require a different lookup mechanism
	return models.Topic{}
}

func loadScriptByID(dir, id string) models.Script {
	files, _ := os.ReadDir(dir)
	for _, f := range files {
		if !stringsHasSuffix(f.Name(), ".json") {
			continue
		}
		data, _ := os.ReadFile(dir + "/" + f.Name())
		var script models.Script
		json.Unmarshal(data, &script)
		if script.ID == id {
			return script
		}
	}
	return models.Script{}
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