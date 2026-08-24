package research

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"youtube-pipeline/internal/models"
)

type RedditScraper struct {
	client  *http.Client
	baseURL string
}

type redditPost struct {
	Data struct {
		Children []struct {
			Data struct {
				Title       string `json:"title"`
				Subreddit   string `json:"subreddit"`
				Author      string `json:"author"`
				Score       int    `json:"score"`
				URL         string `json:"url"`
				Permalink   string `json:"permalink"`
				CreatedUtime int64  `json:"created_utc"`
			} `json:"data"`
		} `json:"children"`
	} `json:"data"`
}

func NewRedditScraper() *RedditScraper {
	return &RedditScraper{
		client:  &http.Client{Timeout: 30 * time.Second},
		baseURL: "https://www.reddit.com",
	}
}

func (s *RedditScraper) ScrapeSubreddit(subreddit string, limit int) ([]models.Topic, error) {
	url := fmt.Sprintf("%s/r/%s/hot.json?limit=%d", s.baseURL, subreddit, limit)

	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("User-Agent", "youtube-pipeline/1.0 (by /u/yourusername)")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("Reddit HTTP %d", resp.StatusCode)
	}

	var result redditPost
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	var topics []models.Topic
	for _, child := range result.Data.Children {
		post := child.Data
		title := post.Title

		topics = append(topics, models.Topic{
			ID:              GenerateID(title),
			Title:           title,
			Location:        subreddit,
			Description:     fmt.Sprintf("Reddit post from r/%s (score: %d)", post.Subreddit, post.Score),
			Source:          "reddit",
			URL:             fmt.Sprintf("%s/r/%s/comments/%s", s.baseURL, post.Subreddit, post.Permalink),
			CuriosityScore:  ScoreTopic(title, ""),
			VisualPotential: AssessVisuals(title),
			Timestamp:       time.Unix(post.CreatedUtime, 0),
			Status:          "new",
		})
	}

	return topics, nil
}