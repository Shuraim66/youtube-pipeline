package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"

	"youtube-pipeline/internal/config"
	"youtube-pipeline/internal/images"
	"youtube-pipeline/internal/models"
)

func main() {
	cfgPath := flag.String("config", "configs/config.yaml", "Config file path")
	scriptFile := flag.String("script", "", "Script JSON file to generate images for")
	useColab := flag.Bool("colab", false, "Use Colab GPU instead of local ComfyUI")
	flag.Parse()

	cfg, err := config.Load(*cfgPath)
	if err != nil {
		log.Fatalf("Config: %v", err)
	}

	// Load script
	scriptPath := *scriptFile
	if scriptPath == "" {
		// Find latest script
		files, _ := os.ReadDir(cfg.Dirs.Scripts)
		for i := len(files) - 1; i >= 0; i-- {
			if stringsHasSuffix(files[i].Name(), ".json") {
				scriptPath = cfg.Dirs.Scripts + "/" + files[i].Name()
				break
			}
		}
	}

	if scriptPath == "" {
		log.Fatalf("No script found. Run 'make script' first or specify with -script")
	}

	// Load script and extract markers
	markers := extractMarkersFromScript(scriptPath)
	if len(markers) == 0 {
		log.Fatalf("No visual markers found in script: %s", scriptPath)
	}

	fmt.Printf("🎨 Generating %d images from script...\n", len(markers))

	if *useColab {
		// Use Colab
		client := images.NewColabClient(cfg.Colab.NotebookURL, cfg.Colab.APIKey)
		batch, err := client.SubmitBatch(markers, images.BatchConfig{
			Model:     cfg.ComfyUI.Model,
			BatchSize: 1,
			Seed:      42,
			CFGScale:  7.0,
			OutputDir: cfg.Dirs.Images,
		})
		if err != nil {
			log.Fatalf("Colab batch: %v", err)
		}
		fmt.Printf("✅ Batch submitted! ID: %s\n", batch.ID)
	} else {
		// Use local ComfyUI
		client := images.NewComfyUIClient(cfg.ComfyUI.BaseURL)
		batch, err := client.GenerateBatch(markers, cfg.Dirs.Images)
		if err != nil {
			log.Fatalf("ComfyUI: %v", err)
		}
		fmt.Printf("✅ Batch complete! Generated %d images\n", len(batch.Images))
	}

	fmt.Println("\n⚠️  HUMAN SELECTION REQUIRED")
	fmt.Println("   Review generated images and select the best 15-20 for the video.")
	fmt.Println("   Delete unwanted images from:", cfg.Dirs.Images)
}

func extractMarkersFromScript(path string) []models.VisualMarker {
	// Load script JSON
	data, err := os.ReadFile(path)
	if err != nil {
		return nil
	}

	var script models.Script
	if err := json.Unmarshal(data, &script); err != nil {
		return nil
	}

	return script.VisualMarkers
}

func stringsHasSuffix(s, suffix string) bool {
	return len(s) >= len(suffix) && s[len(s)-len(suffix):] == suffix
}