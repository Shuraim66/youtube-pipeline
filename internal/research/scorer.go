package research

import (
	"crypto/md5"
	"fmt"
	"strings"
	"time"

	"youtube-pipeline/internal/models"
)

var curiosityWords = []string{"abandoned", "secret", "hidden", "mysterious", "lost", "forbidden", "underground", "unknown", "vanished", "cursed"}
var visualIndicators = []string{"ruins", "tunnels", "underground", "abandoned", "architecture", "mountain", "island", "cave", "temple", "fortress"}
var commonTopics = []string{"pyramids", "taj mahal", "eiffel tower", "statue of liberty", "machu picchu", "colosseum"}
var highValueLocations = []string{"japan", "russia", "egypt", "peru", "antarctica", "ukraine", "romania", "czech", "poland", "norway"}

func ScoreTopic(title, description string) int {
	score := 50
	content := strings.ToLower(title + " " + description)

	for _, w := range curiosityWords {
		if strings.Contains(content, w) {
			score += 8
		}
	}
	for _, loc := range highValueLocations {
		if strings.Contains(content, loc) {
			score += 10
		}
	}
	for _, t := range commonTopics {
		if strings.Contains(content, t) {
			score -= 30
		}
	}
	if strings.Contains(content, "beautiful") || strings.Contains(content, "amazing") {
		score -= 10
	}

	if score > 100 {
		return 100
	}
	if score < 0 {
		return 0
	}
	return score
}

func AssessVisuals(description string) int {
	content := strings.ToLower(description)
	count := 0
	for _, indicator := range visualIndicators {
		if strings.Contains(content, indicator) {
			count++
		}
	}
	score := count * 20
	if score > 100 {
		return 100
	}
	return score
}

func GenerateID(title string) string {
	return fmt.Sprintf("%x", md5.Sum([]byte(title)))[:12]
}

func GenerateYouTubeTitles(topic models.Topic) []string {
	t, loc := topic.Title, topic.Location
	return []string{
		fmt.Sprintf("The Abandoned %s That %s Tried to Hide", t, loc),
		fmt.Sprintf("Inside the Secret %s Nobody Can Enter", t),
		fmt.Sprintf("Why %s's %s Was Sealed Shut Forever", loc, t),
	}
}

// SampleTopics provides fallback topics for testing when external APIs are unavailable
func SampleTopics() []models.Topic {
	return []models.Topic{
		{
			ID:              "topic_001",
			Title:           "The Sunken City of Port Royal",
			Location:        "Jamaica",
			Description:     "A once-thriving pirate haven swallowed by the sea after a catastrophic earthquake in 1692. The underwater ruins reveal what life was like in the Golden Age of Piracy.",
			Source:          "sample",
			CuriosityScore:  95,
			VisualPotential: 85,
			Timestamp:       time.Now(),
			Status:          "new",
		},
		{
			ID:              "topic_002",
			Title:           "The Forbidden City of Tenochtitlan",
			Location:        "Mexico",
			Description:     "The massive floating city built by the Aztecs above the ruins of Tenochtitlan, hidden deep in the mountains and never discovered by Spanish conquistadors.",
			Source:          "sample",
			CuriosityScore:  92,
			VisualPotential: 90,
			Timestamp:       time.Now(),
			Status:          "new",
		},
		{
			ID:              "topic_003",
			Title:           "The Underground Catacombs of Paris",
			Location:        "France",
			Description:     "Massive underground tunnels and chambers containing the remains of millions of Parisians, carved from the limestone bedrock over centuries.",
			Source:          "sample",
			CuriosityScore:  88,
			VisualPotential: 75,
			Timestamp:       time.Now(),
			Status:          "new",
		},
	}
}