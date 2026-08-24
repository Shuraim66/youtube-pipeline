package research

import (
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"youtube-pipeline/internal/models"
)

type AtlasObscuraScraper struct {
	client  *http.Client
	baseURL string
	seen    map[string]bool
}

func NewAtlasObscuraScraper() *AtlasObscuraScraper {
	return &AtlasObscuraScraper{
		client:  &http.Client{Timeout: 30 * time.Second},
		baseURL: "https://www.atlasobscura.com",
		seen:    make(map[string]bool),
	}
}

func (s *AtlasObscuraScraper) Scrape(limit int) ([]models.Topic, error) {
	req, _ := http.NewRequest("GET", s.baseURL+"/places?page=1", nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	return s.parse(resp.Body, limit)
}

func (s *AtlasObscuraScraper) parse(r io.Reader, limit int) ([]models.Topic, error) {
	doc, err := goquery.NewDocumentFromReader(r)
	if err != nil {
		return nil, err
	}

	var topics []models.Topic
	doc.Find(".Card").Each(func(i int, sel *goquery.Selection) {
		if len(topics) >= limit {
			return
		}

		title := strings.TrimSpace(sel.Find("h3").Text())
		if title == "" || s.seen[title] {
			return
		}
		s.seen[title] = true

		location := strings.TrimSpace(sel.Find(".place-location").Text())
		description := strings.TrimSpace(sel.Find(".Card__content").Text())

		topics = append(topics, models.Topic{
			ID:              GenerateID(title),
			Title:           title,
			Location:        location,
			Description:     description,
			Source:          "atlas_obscura",
			CuriosityScore:  ScoreTopic(title, description),
			VisualPotential: AssessVisuals(description),
			Timestamp:       time.Now(),
			Status:          "new",
		})
	})
	return topics, nil
}