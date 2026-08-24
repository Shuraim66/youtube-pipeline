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

type ColabClient struct {
	baseURL string
	apiKey  string
	client  *http.Client
}

func NewColabClient(baseURL, apiKey string) *ColabClient {
	return &ColabClient{
		baseURL: baseURL,
		apiKey:  apiKey,
		client:  &http.Client{Timeout: 30 * time.Minute},
	}
}

func (c *ColabClient) SubmitBatch(markers []models.VisualMarker, config BatchConfig) (*models.ImageBatch, error) {
	var prompts []PromptRequest
	for i, m := range markers {
		prompts = append(prompts, PromptRequest{
			Index:  i,
			Prompt: EnhancePrompt(m),
			Style:  m.Style,
			Width:  1024,
			Height: 576,
			Steps:  25,
		})
	}

	reqBody, _ := json.Marshal(BatchRequest{Prompts: prompts, Config: config})
	req, _ := http.NewRequest("POST", c.baseURL+"/generate", bytes.NewReader(reqBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", c.apiKey)

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != 200 && resp.StatusCode != 202 {
		return nil, fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))
	}

	var result struct {
		BatchID       string `json:"batch_id"`
		Status        string `json:"status"`
		EstimatedTime int    `json:"estimated_time_minutes"`
	}
	json.Unmarshal(body, &result)

	fmt.Printf("Batch submitted to Colab!\n")
	fmt.Printf("  Batch ID: %s | ETA: %d min\n", result.BatchID, result.EstimatedTime)

	return &models.ImageBatch{
		ID:        result.BatchID,
		Source:    "colab",
		Timestamp: time.Now(),
		Status:    result.Status,
	}, nil
}

type BatchRequest struct {
	Prompts []PromptRequest `json:"prompts"`
	Config  BatchConfig     `json:"config"`
}

type PromptRequest struct {
	Index  int    `json:"index"`
	Prompt string `json:"prompt"`
	Style  string `json:"style"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
	Steps  int    `json:"steps"`
}

type BatchConfig struct {
	Model     string  `json:"model"`
	BatchSize int     `json:"batch_size"`
	Seed      int     `json:"seed"`
	CFGScale  float64 `json:"cfg_scale"`
	OutputDir string  `json:"output_dir"`
}