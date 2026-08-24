package voice

import (
	"fmt"
	"os"
	"os/exec"
	"time"
)

// FFmpegHelper provides utilities for video/audio processing
type FFmpegHelper struct{}

func NewFFmpegHelper() *FFmpegHelper {
	return &FFmpegHelper{}
}

// CheckFFmpeg checks if ffmpeg is available
func (h *FFmpegHelper) CheckFFmpeg() error {
	cmd := exec.Command("ffmpeg", "-version")
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("ffmpeg not found or not in PATH: %w", err)
	}
	return nil
}

// ConcatenateAudio concatenates multiple audio files into one
func (h *FFmpegHelper) ConcatenateAudio(inputFiles []string, outputFile string) error {
	if len(inputFiles) == 0 {
		return fmt.Errorf("no input files provided")
	}

	// Create concat list file
	listFile := "concat_list_temp.txt"
	var content string
	for _, f := range inputFiles {
		content += fmt.Sprintf("file '%s'\n", f)
	}
	if err := os.WriteFile(listFile, []byte(content), 0644); err != nil {
		return fmt.Errorf("creating concat list: %w", err)
	}
	defer os.Remove(listFile)

	cmd := exec.Command("ffmpeg", "-f", "concat", "-safe", "0", "-i", listFile,
		"-c", "copy", "-y", outputFile)

	start := time.Now()
	out, err := cmd.CombinedOutput()
	elapsed := time.Since(start)

	if err != nil {
		return fmt.Errorf("ffmpeg concat failed after %v: %w\n%s", elapsed, err, string(out))
	}

	fmt.Printf("Concatenated %d files in %v\n", len(inputFiles), elapsed)
	return nil
}

// ConvertAudio converts audio to specified format
func (h *FFmpegHelper) ConvertAudio(inputFile, outputFile, format string) error {
	cmd := exec.Command("ffmpeg", "-i", inputFile, "-y", outputFile)

	start := time.Now()
	out, err := cmd.CombinedOutput()
	elapsed := time.Since(start)

	if err != nil {
		return fmt.Errorf("ffmpeg convert failed after %v: %w\n%s", elapsed, err, string(out))
	}

	fmt.Printf("Converted %s in %v\n", format, elapsed)
	return nil
}

// GetAudioDuration returns the duration of an audio file in seconds
func (h *FFmpegHelper) GetAudioDuration(filePath string) (float64, error) {
	cmd := exec.Command("ffprobe", "-v", "error", "-show_entries",
		"format=duration", "-of", "default=noprint_wrappers=1:nokey=1", filePath)

	output, err := cmd.Output()
	if err != nil {
		return 0, fmt.Errorf("ffprobe failed: %w", err)
	}

	var duration float64
	if _, err := fmt.Sscanf(string(output), "%f", &duration); err != nil {
		return 0, fmt.Errorf("parsing duration: %w", err)
	}

	return duration, nil
}

// GenerateSilence creates a silence audio file of specified duration
func (h *FFmpegHelper) GenerateSilence(durationSeconds float64, outputFile string) error {
	cmd := exec.Command("ffmpeg", "-f", "lavfi", "-i",
		fmt.Sprintf("anullsrc=r=44100:cl=stereo"),
		"-t", fmt.Sprintf("%.2f", durationSeconds),
		"-y", outputFile)

	out, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("ffmpeg silence failed: %w\n%s", err, string(out))
	}

	return nil
}