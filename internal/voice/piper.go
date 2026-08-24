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
		modelPath:       modelPath,
		configPath:      configPath,
		sentenceSilence: sentenceSilence,
		lengthScale:     lengthScale,
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
			for _, f := range chunkFiles {
				os.Remove(f)
			}
			return nil, fmt.Errorf("chunk %d: %w", i, err)
		}
		chunkFiles = append(chunkFiles, chunkFile)
		fmt.Printf("  Chunk %d/%d complete\n", i+1, len(chunks))
	}

	if err := g.concatChunks(chunkFiles, outputPath); err != nil {
		return nil, err
	}
	for _, f := range chunkFiles {
		os.Remove(f)
	}

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
		if s == "" {
			continue
		}
		if length+len(s) > maxChars && len(current) > 0 {
			chunks = append(chunks, strings.Join(current, ". ")+".")
			current = []string{s}
			length = len(s)
		} else {
			current = append(current, s)
			length += len(s)
		}
	}
	if len(current) > 0 {
		chunks = append(chunks, strings.Join(current, ". ")+".")
	}
	return chunks
}

func (g *PiperGenerator) concatChunks(files []string, output string) error {
	listFile := "concat_list.txt"
	var content strings.Builder
	for _, f := range files {
		content.WriteString(fmt.Sprintf("file '%s'\n", f))
	}
	os.WriteFile(listFile, []byte(content.String()), 0644)
	defer os.Remove(listFile)

	cmd := exec.Command("ffmpeg", "-f", "concat", "-safe", "0", "-i", listFile,
		"-acodec", "pcm_s16le", "-ar", "44100", "-y", output)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("ffmpeg: %w\n%s", err, string(out))
	}
	return nil
}