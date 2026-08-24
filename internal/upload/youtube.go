package upload

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"youtube-pipeline/internal/models"

	"google.golang.org/api/youtube/v3"
	"google.golang.org/api/option"
)

// YouTubeUploader handles YouTube Data API uploads
type YouTubeUploader struct {
	service *youtube.Service
}

// NewYouTubeUploader creates a new YouTube uploader client
func NewYouTubeUploader(tokenFile, clientSecret string) (*YouTubeUploader, error) {
	// Load credentials from file
	scopes := []string{youtube.YoutubeUploadScope}

	service, err := youtube.NewService(context.Background(),
		option.WithCredentialsFile(clientSecret),
		option.WithScopes(scopes...))
	if err != nil {
		return nil, fmt.Errorf("creating YouTube service: %w", err)
	}

	return &YouTubeUploader{
		service: service,
	}, nil
}

// UploadVideo uploads a video to YouTube
func (u *YouTubeUploader) UploadVideo(project *models.VideoProject) (string, error) {
	if project.VideoPath == "" {
		project.VideoPath = filepath.Join("data/videos", fmt.Sprintf("%s.mp4", project.ID))
	}

	// Check if video file exists
	if _, err := os.Stat(project.VideoPath); os.IsNotExist(err) {
		return "", fmt.Errorf("video file not found: %s", project.VideoPath)
	}

	// Build video metadata
	title := project.Metadata.Title
	description := project.Metadata.Description
	tags := project.Metadata.Tags
	// Ensure tags count is within limits
	if len(tags) > 50 {
		tags = tags[:50]
	}

	// Build video resource
	video := &youtube.Video{
		Snippet: &youtube.VideoSnippet{
			Title:       title,
			Description: description,
			Tags:        tags,
		},
		Status: &youtube.VideoStatus{
			PrivacyStatus: project.Metadata.PrivacyStatus,
		},
	}

	// Upload the video using resumable upload
	upload := u.service.Videos.Insert([]string{"snippet", "status"}, video)

	// Read video file for upload
	file, err := os.Open(project.VideoPath)
	if err != nil {
		return "", fmt.Errorf("opening video file: %w", err)
	}
	defer file.Close()

	// Set media for upload
	upload = upload.Media(file)

	// Execute upload
	resp, err := upload.Do()
	if err != nil {
		return "", fmt.Errorf("upload failed: %w", err)
	}

	fmt.Printf("Video uploaded! ID: %s\n", resp.Id)
	return resp.Id, nil
}

// GetUploadStatus returns the upload status of a video
func (u *YouTubeUploader) GetUploadStatus(videoID string) (*youtube.Video, error) {
	video, err := u.service.Videos.List([]string{"id", "snippet", "status"}).Id(videoID).Do()
	if err != nil {
		return nil, fmt.Errorf("getting video status: %w", err)
	}
	if len(video.Items) == 0 {
		return nil, fmt.Errorf("video not found")
	}
	return video.Items[0], nil
}