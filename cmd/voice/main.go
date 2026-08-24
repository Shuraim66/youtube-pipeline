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
	"youtube-pipeline/internal/voice"
)

func main() {
	cfgPath := flag.String("config", "configs/config.yaml", "Config file path")
	scriptFile := flag.String("script", "", "Script JSON file to generate voiceover for")
	outputFile := flag.String("output", "", "Output audio file path")
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

	// Load script content
	data, err := os.ReadFile(scriptPath)
	if err != nil {
		log.Fatalf("Reading script: %v", err)
	}

	var script models.Script
	if err := json.Unmarshal(data, &script); err != nil {
		log.Fatalf("Parsing script: %v", err)
	}

	// Determine output path
	outputPath := *outputFile
	if outputPath == "" {
		outputPath = fmt.Sprintf("%s/voice_%s.wav", cfg.Dirs.Voice, time.Now().Format("20060102_150405"))
	}

	// Generate voiceover
	generator := voice.NewPiperGenerator(
		cfg.Piper.ModelPath,
		cfg.Piper.ConfigPath,
		cfg.Piper.SentenceSilence,
		cfg.Piper.LengthScale,
	)

	fmt.Printf("🎙️  Generating voiceover...\n")
	fmt.Printf("   Script: %s\n", scriptPath)
	fmt.Printf("   Output: %s\n", outputPath)

	voiceover, err := generator.Generate(script.Final, outputPath)
	if err != nil {
		log.Fatalf("Voice generation: %v", err)
	}

	fmt.Printf("✅ Voiceover generated!\n")
	fmt.Printf("📁 Saved to: %s\n", outputPath)
	fmt.Printf("⏱️  Duration: %.1f minutes\n", voiceover.Duration)
	fmt.Printf("🔊 Model: %s\n", voiceover.Model)
	fmt.Printf("📝 Chunks: %d\n", voiceover.Chunks)

	// Verify with FFmpeg
	ffmpeg := voice.NewFFmpegHelper()
	duration, err := ffmpeg.GetAudioDuration(outputPath)
	if err == nil {
		fmt.Printf("📊 Verified duration: %.2f seconds\n", duration)
	}
}

func stringsHasSuffix(s, suffix string) bool {
	return len(s) >= len(suffix) && s[len(s)-len(suffix):] == suffix
}