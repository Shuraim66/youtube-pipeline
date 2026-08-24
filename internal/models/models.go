package models

import "time"

type Topic struct {
	ID              string    `json:"id"`
	Title           string    `json:"title"`
	Location        string    `json:"location"`
	Description     string    `json:"description"`
	Source          string    `json:"source"`
	URL             string    `json:"url,omitempty"`
	CuriosityScore  int       `json:"curiosity_score"`
	VisualPotential int       `json:"visual_potential"`
	Timestamp       time.Time `json:"timestamp"`
	Status          string    `json:"status"` // "new", "approved", "rejected", "completed"
}

type Script struct {
	ID                string            `json:"id"`
	TopicID           string            `json:"topic_id"`
	Title             string            `json:"title"`
	WordCount         int               `json:"word_count"`
	EstimatedDuration float64           `json:"estimated_duration_minutes"`
	Sections          map[string]string `json:"sections"`
	VisualMarkers     []VisualMarker    `json:"visual_markers"`
	Draft             string            `json:"draft"`
	Final             string            `json:"final,omitempty"`
	Model             string            `json:"model"`
	GenerationTime    float64           `json:"generation_time_seconds"`
	Timestamp         time.Time         `json:"timestamp"`
	Status            string            `json:"status"` // "draft", "human_edited", "approved"
}

type VisualMarker struct {
	Index       int    `json:"index"`
	Description string `json:"description"`
	Style       string `json:"style"`
	Enhanced    string `json:"enhanced_prompt,omitempty"`
}

type ImageBatch struct {
	ID        string           `json:"id"`
	ScriptID  string           `json:"script_id"`
	Images    []GeneratedImage `json:"images"`
	Source    string           `json:"source"`
	Timestamp time.Time        `json:"timestamp"`
	Status    string           `json:"status"`
}

type GeneratedImage struct {
	Index       int     `json:"index"`
	Prompt      string  `json:"prompt"`
	FilePath    string  `json:"file_path"`
	TimeSeconds float64 `json:"time_seconds"`
	Status      string  `json:"status"`
}

type Voiceover struct {
	ID        string    `json:"id"`
	ScriptID  string    `json:"script_id"`
	FilePath  string    `json:"file_path"`
	Duration  float64   `json:"duration_minutes"`
	Model     string    `json:"model"`
	Chunks    int       `json:"chunks"`
	Timestamp time.Time `json:"timestamp"`
}

type Metadata struct {
	ID            string    `json:"id"`
	ScriptID      string    `json:"script_id"`
	Title         string    `json:"title"`
	Description   string    `json:"description"`
	Tags          []string  `json:"tags"`
	Category      string    `json:"category"`
	Chapters      []Chapter `json:"chapters,omitempty"`
	ThumbnailText []string  `json:"thumbnail_text_options"`
	PrivacyStatus string    `json:"privacy_status"`
}

type Chapter struct {
	Time  string `json:"time"`
	Title string `json:"title"`
}

type ResearchReport struct {
	ID              string    `json:"id"`
	GeneratedAt     time.Time `json:"generated_at"`
	TotalTopics     int       `json:"total_topics_found"`
	Recommendations []Topic   `json:"top_recommendations"`
	SuggestedTitles []string  `json:"suggested_titles"`
}

type VideoProject struct {
	ID          string       `json:"id"`
	Topic       *Topic       `json:"topic"`
	Script      *Script      `json:"script"`
	Images      *ImageBatch  `json:"images,omitempty"`
	Voiceover   *Voiceover  `json:"voiceover,omitempty"`
	Metadata    *Metadata    `json:"metadata,omitempty"`
	VideoPath   string       `json:"video_path,omitempty"`
	Status      string       `json:"status"`
	CreatedAt   time.Time    `json:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at"`
}