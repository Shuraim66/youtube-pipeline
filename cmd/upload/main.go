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
	"youtube-pipeline/internal/upload"
)

func main() {
	cfgPath := flag.String("config", "configs/config.yaml", "Config file path")
	videoID := flag.String("video", "", "Video project ID or path")
	metadataPath := flag.String("metadata", "", "Metadata JSON file")
	title := flag.String("title", "", "Video title")
	description := flag.String("description", "", "Video description")
	flag.Parse()

	cfg, err := config.Load(*cfgPath)
	if err != nil {
		log.Fatalf("Config: %v", err)
	}

	// Load metadata
	var meta models.Metadata
	if *metadataPath != "" {
		data, err := os.ReadFile(*metadataPath)
		if err != nil {
			log.Fatalf("Reading metadata: %v", err)
		}
		json.Unmarshal(data, &meta)
	} else if *videoID != "" {
		meta = loadMetadataByID(cfg.Dirs.Output, *videoID)
	} else {
		// Find latest metadata
		meta = loadLatestMetadata(cfg.Dirs.Output)
	}

	if meta.ID == "" {
		log.Fatalf("No metadata found. Run 'make metadata' first or specify with -metadata")
	}

	// Override with command line flags
	if *title != "" {
		meta.Title = *title
	}
	if *description != "" {
		meta.Description = *description
	}

	// Build video project
	project := &models.VideoProject{
		ID:        fmt.Sprintf("video_%d", time.Now().Unix()),
		Metadata:  &meta,
		Status:    "ready",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Find associated files
	if project.VideoPath == "" {
		project.VideoPath = findVideoFile(cfg.Dirs.Videos, project.ID)
	}
	if project.Voiceover == nil {
		project.Voiceover = findVoiceover(cfg.Dirs.Voice, meta.ScriptID)
	}
	if project.Images == nil {
		project.Images = findImages(cfg.Dirs.Images, meta.ScriptID)
	}

	// Check required files
	missing := []string{}
	if project.VideoPath == "" || !fileExists(project.VideoPath) {
		missing = append(missing, "video file (render in DaVinci Resolve)")
	}
	if project.Voiceover == nil || !fileExists(project.Voiceover.FilePath) {
		missing = append(missing, "voiceover audio")
	}
	if project.Images == nil || len(project.Images.Images) == 0 {
		missing = append(missing, "images")
	}

	if len(missing) > 0 {
		fmt.Println("⚠️  Missing required files:")
		for _, m := range missing {
			fmt.Printf("   - %s\n", m)
		}
		fmt.Println("\n   Complete missing steps before uploading.")
		return
	}

	// Upload
	fmt.Println("🚀 Preparing to upload video...")
	fmt.Printf("   Title: %s\n", meta.Title)
	fmt.Printf("   Privacy: %s\n", meta.PrivacyStatus)

	if cfg.YouTube.ClientSecret == "" || cfg.YouTube.TokenFile == "" {
		fmt.Println("\n⚠️  YouTube credentials not configured.")
		fmt.Println("   Set YouTube.client_secret and YouTube.token_file in config.yaml")
		fmt.Println("\n   Preview mode - showing upload details:")
		fmt.Println("\n=== PREVIEW ===")
		fmt.Printf("Title: %s\n\nDescription:\n%s\n\nTags:\n%s\n",
			meta.Title, meta.Description, strings.Join(meta.Tags, ", "))
		return
	}

	uploader, err := upload.NewYouTubeUploader(cfg.YouTube.TokenFile, cfg.YouTube.ClientSecret)
	if err != nil {
		log.Fatalf("Creating uploader: %v", err)
	}

	uploadedID, err := uploader.UploadVideo(project)
	if err != nil {
		log.Fatalf("Upload: %v", err)
	}

	fmt.Printf("✅ Video uploaded successfully!\n")
	fmt.Printf("🔗 Video ID: %s\n", uploadedID)
	fmt.Printf("🔗 URL: https://youtube.com/watch?v=%s\n", uploadedID)

	fmt.Printf("✅ Video uploaded successfully!\n")
	fmt.Printf("🔗 Video ID: %s\n", videoID)
	fmt.Printf("🔗 URL: https://youtube.com/watch?v=%s\n", videoID)
}

func loadMetadataByID(dir, id string) models.Metadata {
	files, _ := os.ReadDir(dir)
	for _, f := range files {
		if !stringsHasSuffix(f.Name(), ".json") {
			continue
		}
		data, _ := os.ReadFile(dir + "/" + f.Name())
		var meta models.Metadata
		json.Unmarshal(data, &meta)
		if meta.ID == id {
			return meta
		}
	}
	return models.Metadata{}
}

func loadLatestMetadata(dir string) models.Metadata {
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
		return models.Metadata{}
	}

	data, _ := os.ReadFile(latestFile)
	var meta models.Metadata
	json.Unmarshal(data, &meta)
	return meta
}

func findVideoFile(dir, id string) string {
	files, _ := os.ReadDir(dir)
	for _, f := range files {
		if strings.Contains(f.Name(), id) && (stringsHasSuffix(f.Name(), ".mp4") || stringsHasSuffix(f.Name(), ".mov")) {
			return dir + "/" + f.Name()
		}
	}
	return ""
}

func findVoiceover(dir, scriptID string) *models.Voiceover {
	files, _ := os.ReadDir(dir)
	for _, f := range files {
		if stringsContains(f.Name(), scriptID) && stringsHasSuffix(f.Name(), ".wav") {
			path := dir + "/" + f.Name()
			return &models.Voiceover{
				FilePath: path,
			}
		}
	}
	return nil
}

func findImages(dir, scriptID string) *models.ImageBatch {
	// Find images directory for this script
	return &models.ImageBatch{
		ID:     scriptID,
		Status: "pending",
	}
}

func fileExists(path string) bool {
	info, err := os.Stat(path)
	return err == nil && !info.IsDir()
}

func stringsHasSuffix(s, suffix string) bool {
	return len(s) >= len(suffix) && s[len(s)-len(suffix):] == suffix
}

func stringsContains(s, substr string) bool {
	return strings.Contains(s, substr)
}