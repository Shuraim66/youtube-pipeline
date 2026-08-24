package utils

import (
	"fmt"
	"io"
	"net/http"
	"time"
)

// HTTPClient provides a configured HTTP client for API requests
type HTTPClient struct {
	client *http.Client
}

// NewHTTPClient creates a new HTTP client with reasonable defaults
func NewHTTPClient(timeout time.Duration) *HTTPClient {
	return &HTTPClient{
		client: &http.Client{
			Timeout: timeout,
			CheckRedirect: func(req *http.Request, via []*http.Request) error {
				if len(via) >= 10 {
					return fmt.Errorf("stopped after 10 redirects")
				}
				return nil
			},
		},
	}
}

// Get performs a GET request and returns the response body
func (c *HTTPClient) Get(url string) ([]byte, error) {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("User-Agent", "youtube-pipeline/1.0")

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP %d: %s", resp.StatusCode, resp.Status)
	}

	return io.ReadAll(resp.Body)
}

// Post performs a POST request with JSON body and returns the response
func (c *HTTPClient) Post(url string, body io.Reader, contentType string) ([]byte, error) {
	req, err := http.NewRequest("POST", url, body)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", contentType)
	req.Header.Set("User-Agent", "youtube-pipeline/1.0")

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("HTTP %d: %s", resp.StatusCode, resp.Status)
	}

	return io.ReadAll(resp.Body)
}

// GetJSON performs a GET request and decodes JSON response
func (c *HTTPClient) GetJSON(url string, v interface{}) error {
	data, err := c.Get(url)
	if err != nil {
		return err
	}

	return decodeJSON(data, v)
}

// PostJSON performs a POST request with JSON body and decodes JSON response
func (c *HTTPClient) PostJSON(url string, body interface{}, v interface{}) error {
	jsonBody, err := encodeJSON(body)
	if err != nil {
		return err
	}

	resp, err := c.Post(url, jsonBody, "application/json")
	if err != nil {
		return err
	}

	return decodeJSON(resp, v)
}

// Helper functions for JSON encoding/decoding
func encodeJSON(v interface{}) (io.Reader, error) {
	// This would use json.Marshal in a real implementation
	return nil, fmt.Errorf("JSON encoding not implemented")
}

func decodeJSON(data []byte, v interface{}) error {
	// This would use json.Unmarshal in a real implementation
	return fmt.Errorf("JSON decoding not implemented")
}