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

		fmt.Printf("[%d/%d] %s...\n", i+1, len(markers), marker.Description[:min(50, len(marker.Description))])

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
				"seed":       0,
				"steps":      steps,
				"cfg":        7.0,
				"sampler_name": "euler_ancestral",
				"scheduler":    "normal",
				"denoise":    1.0,
				"model":      []interface{}{"4", 0},
				"positive":   []interface{}{"1", 0},
				"negative":   []interface{}{"2", 0},
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
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))
	}

	elapsed := time.Since(start)
	return &models.GeneratedImage{
		Index:       0,
		Prompt:      prompt,
		FilePath:    fmt.Sprintf("%s_00001_.png", outputName),
		TimeSeconds: elapsed.Seconds(),
		Status:      "generated",
	}, nil
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}