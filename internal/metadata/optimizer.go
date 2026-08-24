package metadata

import (
	"fmt"
	"strings"
	"time"

	"youtube-pipeline/internal/models"
)

type Optimizer struct {
	tagTemplates map[string][]string
}

func NewOptimizer() *Optimizer {
	return &Optimizer{
		tagTemplates: map[string][]string{
			"abandoned":    {"abandoned places", "urban exploration", "abandoned history", "forgotten places"},
			"mystery":      {"unsolved mystery", "historical mystery", "ancient mystery", "mysterious places"},
			"architecture": {"ancient architecture", "lost civilization", "archaeological", "ancient ruins"},
			"underground":  {"underground tunnels", "secret passages", "hidden underground", "subterranean"},
		},
	}
}

func (o *Optimizer) Generate(title, summary string, duration int) *models.Metadata {
	category := o.detectCategory(title)
	return &models.Metadata{
		ID:            fmt.Sprintf("meta_%d", time.Now().Unix()),
		Title:         title,
		Description:   o.generateDescription(title, summary),
		Tags:          o.generateTags(title, category),
		Category:      "Education",
		Chapters:      o.generateChapters(duration),
		ThumbnailText: o.suggestThumbnailText(title),
		PrivacyStatus: "private",
	}
}

func (o *Optimizer) detectCategory(title string) string {
	t := strings.ToLower(title)
	if containsAny(t, []string{"abandoned", "ruins", "decay"}) {
		return "abandoned"
	}
	if containsAny(t, []string{"mystery", "secret", "hidden", "unknown"}) {
		return "mystery"
	}
	if containsAny(t, []string{"temple", "pyramid", "architecture", "built"}) {
		return "architecture"
	}
	if containsAny(t, []string{"underground", "tunnel", "beneath", "buried"}) {
		return "underground"
	}
	return "mystery"
}

func (o *Optimizer) generateDescription(title, summary string) string {
	hook := summary
	if len(hook) > 150 {
		hook = hook[:150] + "..."
	}
	return fmt.Sprintf(`%s

In this documentary, we explore the fascinating story behind %s and uncover details that most people have never heard. From forgotten archives to modern discoveries, the truth about this place is more intriguing than most people realize.

🎬 RELATED DOCUMENTARIES:
[Add links to your previous videos here]

📚 SOURCES & REFERENCES:
• Atlas Obscura - %s
• Wikipedia - Historical records
• Academic journals (where applicable)

🔔 SUBSCRIBE for new historical documentaries every week.

#HistoricalDocumentary #AbandonedPlaces #Mystery`, hook, title, title)
}

func (o *Optimizer) generateTags(title, category string) []string {
	base := []string{"historical documentary", "documentary 2026", "history channel alternative", "faceless documentary", "educational content"}
	catTags := o.tagTemplates[category]
	if catTags == nil {
		catTags = []string{}
	}

	var titleTags []string
	for _, w := range strings.Fields(title) {
		w = strings.ToLower(w)
		if len(w) > 3 && w != "that" && w != "this" && w != "with" && w != "from" && w != "what" {
			titleTags = append(titleTags, w)
		}
	}

	all := append(base, catTags...)
	all = append(all, titleTags...)
	return uniqueStrings(all)[:15]
}

func (o *Optimizer) generateChapters(duration int) []models.Chapter {
	if duration < 8 {
		return nil
	}
	return []models.Chapter{
		{Time: "0:00", Title: "Introduction"},
		{Time: "1:00", Title: "The Discovery"},
		{Time: "3:00", Title: "Hidden Truths"},
		{Time: "5:00", Title: "Modern Revelations"},
		{Time: fmt.Sprintf("%d:00", duration-1), Title: "Conclusion"},
	}
}

func (o *Optimizer) suggestThumbnailText(title string) []string {
	words := strings.Fields(title)
	var dramatic []string
	for _, w := range words {
		w = strings.ToLower(w)
		if len(w) > 3 && w != "the" && w != "that" && w != "this" && w != "was" && w != "were" && w != "and" && w != "but" {
			dramatic = append(dramatic, strings.ToUpper(w))
		}
	}
	suggestions := []string{
		strings.Join(dramatic[:min(len(dramatic), 3)], " "),
		"NOBODY KNOWS",
		"THE TRUTH",
		"ABANDONED",
	}
	return uniqueStrings(suggestions)[:3]
}

func containsAny(s string, targets []string) bool {
	for _, t := range targets {
		if strings.Contains(s, t) {
			return true
		}
	}
	return false
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

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}