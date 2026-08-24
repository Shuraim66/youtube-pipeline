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
	"youtube-pipeline/internal/research"
)

func main() {
	cfgPath := flag.String("config", "configs/config.yaml", "Config file path")
	addTopic := flag.String("add", "", "Add a custom topic (format: 'title|location|description')")
	flag.Parse()

	cfg, err := config.Load(*cfgPath)
	if err != nil {
		log.Fatalf("Config: %v", err)
	}
	if err := cfg.EnsureDirs(); err != nil {
		log.Fatalf("Dirs: %v", err)
	}

	if *addTopic != "" {
		addCustomTopic(cfg, *addTopic)
		return
	}

	// Try live research
	topics, err := researchFromAPIs()
	if err != nil || len(topics) == 0 {
		fmt.Println("⚠️  Live research unavailable (Cloudflare/API restrictions)")
		fmt.Println("   Using built-in sample topics or add your own with -add flag")
	}

	// Load existing topics or use samples
	loadOrCreateTopics(cfg)

	// Run research with available topics
	runResearchWithTopics(cfg)
}

func addCustomTopic(cfg *config.Config, topicStr string) {
	parts := splitTopicString(topicStr, "|")
	if len(parts) < 3 {
		log.Fatalf("Invalid format. Use: -add 'title|location|description'")
	}

	topic := models.Topic{
		ID:              research.GenerateID(parts[0]),
		Title:           parts[0],
		Location:        parts[1],
		Description:     parts[2],
		Source:          "user_added",
		CuriosityScore:  research.ScoreTopic(parts[0], parts[2]),
		VisualPotential: research.AssessVisuals(parts[2]),
		Timestamp:       time.Now(),
		Status:          "new",
	}

	// Append to topics file
	path := fmt.Sprintf("%s/topics_%s.json", cfg.Dirs.Topics, time.Now().Format("20060102"))
	t := loadTopicsFromFile(path)
	t = append(t, topic)
	saveTopics(path, t)

	fmt.Printf("✅ Added topic: %s\n", topic.Title)
}

func loadOrCreateTopics(cfg *config.Config) {
	// Check if we have topics
	topicsPath := findLatestTopicsFile(cfg.Dirs.Topics)
	if topicsPath == "" {
		// Create sample topics
		sampleTopics := research.SampleTopics()
		saveTopics(fmt.Sprintf("%s/topics_%s.json", cfg.Dirs.Topics, time.Now().Format("20060102_150405")), sampleTopics)
		fmt.Println("📝 Created sample topics database")
	}
}

func runResearchWithTopics(cfg *config.Config) {
	// Load topics
	topicsPath := findLatestTopicsFile(cfg.Dirs.Topics)
	topics := loadTopicsFromFile(topicsPath)

	if len(topics) == 0 {
		fmt.Println("❌ No topics found!")
		return
	}

	// Sort by score
	for i := 0; i < len(topics); i++ {
		for j := i + 1; j < len(topics); j++ {
			if topics[i].CuriosityScore < topics[j].CuriosityScore {
				topics[i], topics[j] = topics[j], topics[i]
			}
		}
	}

	// Save report
	report := models.ResearchReport{
		ID:              fmt.Sprintf("research_%d", time.Now().Unix()),
		GeneratedAt:     time.Now(),
		TotalTopics:     len(topics),
		Recommendations: topics[:min(len(topics), 10)],
		SuggestedTitles: generateTitles(topics[:min(len(topics), 3)]),
	}

	path := fmt.Sprintf("%s/research_%s.json", cfg.Dirs.Topics, time.Now().Format("20060102_150405"))
	saveJSON(path, report)

	fmt.Printf("✅ Found %d topics, saved to %s\n", len(topics), path)
	for i, t := range topics[:min(len(topics), 5)] {
		fmt.Printf("  %d. [%d pts] %s\n", i+1, t.CuriosityScore, t.Title)
	}

	fmt.Printf("\nSuggested titles:\n")
	for i, title := range report.SuggestedTitles {
		fmt.Printf("  %d. %s\n", i+1, title)
	}
}

// Helper functions
func splitTopicString(s, sep string) []string {
	var result []string
	start := 0
	for i := 0; i < len(s); i++ {
		if i >= len(sep) && s[i-len(sep)+1:i+1] == sep {
			result = append(result, s[start:i-len(sep)+1])
			start = i + 1
		}
	}
	result = append(result, s[start:])
	return result
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func findLatestTopicsFile(dir string) string {
	files, _ := os.ReadDir(dir)
	var latestTime time.Time
	var latestFile string

	for _, f := range files {
		if !stringsHasSuffix(f.Name(), ".json") {
			continue
		}
		info, _ := f.Info()
		if info.ModTime().After(latestTime) {
			latestTime = info.ModTime()
			latestFile = dir + "/" + f.Name()
		}
	}
	return latestFile
}

func loadTopicsFromFile(path string) []models.Topic {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil
	}
	var report models.ResearchReport
	json.Unmarshal(data, &report)
	return report.Recommendations
}

func saveTopics(path string, topics []models.Topic) {
	report := models.ResearchReport{
		ID:              fmt.Sprintf("research_%d", time.Now().Unix()),
		GeneratedAt:     time.Now(),
		TotalTopics:     len(topics),
		Recommendations: topics,
		SuggestedTitles: generateTitles(topics[:min(len(topics), 5)]),
	}
	data, _ := json.MarshalIndent(report, "", "  ")
	os.WriteFile(path, data, 0644)
}

func generateTitles(topics []models.Topic) []string {
	var titles []string
	for _, t := range topics {
		titles = append(titles, research.GenerateYouTubeTitles(t)...)
	}
	unique := uniqueStrings(titles)
	if len(unique) > 10 {
		return unique[:10]
	}
	return unique
}

func uniqueStrings(s []string) []string {
	seen := make(map[string]bool)
	var result []string
	for _, v := range s {
		if !seen[v] {
			seen[v] = true
			result = append(result, v)
		}
	}
	return result
}

func stringsHasSuffix(s, suffix string) bool {
	return len(s) >= len(suffix) && s[len(s)-len(suffix):] == suffix
}

func saveJSON(path string, v interface{}) {
	data, _ := json.MarshalIndent(v, "", "  ")
	os.WriteFile(path, data, 0644)
}

func researchFromAPIs() ([]models.Topic, error) {
	var topics []models.Topic

	atlas := research.NewAtlasObscuraScraper()
	t, err := atlas.Scrape(20)
	if err == nil {
		topics = append(topics, t...)
	}

	reddit := research.NewRedditScraper()
	for _, sub := range []string{"UnresolvedMysteries", "AbandonedPorn"} {
		r, err := reddit.ScrapeSubreddit(sub, 10)
		if err == nil {
			topics = append(topics, r...)
		}
	}

	return topics, nil
}