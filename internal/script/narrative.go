package script

import (
	"fmt"
	"strings"
)

// StoryArc defines the narrative structure
type StoryArc struct {
	Hook           string  `json:"hook"`
	Setup          string  `json:"setup"`
	Conflict       string  `json:"conflict"`
	Discovery      string  `json:"discovery"`
	Escalation     string  `json:"escalation"`
	Reveal         string  `json:"reveal"`
	Conclusion     string  `json:"conclusion"`
	CTA            string  `json:"cta"`
	VisualPlan     []Scene `json:"visual_plan"`
	EstimatedWords int     `json:"estimated_words"`
}

// Scene represents a visual-narration pair
type Scene struct {
	Section    string `json:"section"`
	Narration  string `json:"narration"`
	Visual     string `json:"visual"`
	Duration   string `json:"duration"`
	Importance int    `json:"importance"` // 1-5
}

// NarrativePlanner creates story structures from research data
type NarrativePlanner struct{}

func NewNarrativePlanner() *NarrativePlanner {
	return &NarrativePlanner{}
}

// PlanStory creates a compelling narrative arc from research results
func (p *NarrativePlanner) PlanStory(research ResearchResult, durationMinutes int) StoryArc {
	arc := StoryArc{
		VisualPlan: make([]Scene, 0),
	}

	// Calculate target word count
	targetWords := durationMinutes * 150
	arc.EstimatedWords = targetWords

	// Generate all sections from research data - scene-based, concrete storytelling
	arc.Hook = p.generateHook(research)
	arc.Setup = p.generateSetup(research)
	arc.Conflict = p.generateConflict(research)
	arc.Discovery = p.generateDiscoveries(research)
	arc.Escalation = p.generateEscalation(research)
	arc.Reveal = p.generateReveal(research)
	arc.Conclusion = p.generateConclusion(research)
	arc.CTA = p.generateCTA(research.Topic.Title)

	// Add visual scenes
	p.addVisualScenes(&arc, research)

	return arc
}

func (p *NarrativePlanner) generateHook(research ResearchResult) string {
	facts := research.Facts

	// Find the "sank intact" or liquefaction fact for the hook
	var hookFact string
	for _, f := range facts {
		content := strings.ToLower(f.Content)
		if strings.Contains(content, "sank") || strings.Contains(content, "intact") ||
			strings.Contains(content, "liquefaction") || strings.Contains(content, "liquid") {
			hookFact = f.Content
			break
		}
	}

	// Build hook from the actual phenomenon - create curiosity gap
	if hookFact != "" {
		return fmt.Sprintf(`[HOOK]
%s

[QUESTION]
How could this event become a geological time capsule?

[CURIOUSITY LOOP]
The answer lies in a phenomenon that scientists still study today.`,
			hookFact)
	}

	// Fallback hook based on topic
	return fmt.Sprintf(`[HOOK]
%s

[QUESTION]
What makes this site uniquely preserved?

[CURIOUSITY LOOP]
The answer involves a discovery about how natural forces can preserve history.`,
		research.Topic.Title)
}

func (p *NarrativePlanner) generateSetup(research ResearchResult) string {
	facts := research.Facts

	// Find specific setup facts
	var locationFact, peopleFact, dateFact, scaleFact string
	for _, f := range facts {
		content := strings.ToLower(f.Content)
		if strings.Contains(content, "location") || strings.Contains(content, "jamaica") ||
			strings.Contains(content, "palisadoes") || strings.Contains(content, "harbor") ||
			strings.Contains(content, "peninsula") {
			locationFact = f.Content
		}
		if strings.Contains(content, "pirate") || strings.Contains(content, "morgan") ||
			strings.Contains(content, "governor") || strings.Contains(content, "merchant") ||
			strings.Contains(content, "colonial") || strings.Contains(content, "settlement") {
			peopleFact = f.Content
		}
		if strings.Contains(content, "september") || strings.Contains(content, "june") ||
			strings.Contains(content, "july") || strings.Contains(content, "1692") ||
			strings.Contains(content, "1693") || strings.Contains(content, "date") {
			dateFact = f.Content
		}
		if strings.Contains(content, "ship") || strings.Contains(content, "vessel") ||
			strings.Contains(content, "crowded") || strings.Contains(content, "harbor") ||
			strings.Contains(content, "port") || strings.Contains(content, "commerce") {
			scaleFact = f.Content
		}
	}

	// Build setup from facts
	var setupParts []string
	if locationFact != "" {
		setupParts = append(setupParts, fmt.Sprintf("Location: %s", locationFact))
	}
	if dateFact != "" {
		setupParts = append(setupParts, fmt.Sprintf("Date: %s", dateFact))
	}
	if peopleFact != "" {
		setupParts = append(setupParts, fmt.Sprintf("People: %s", peopleFact))
	}
	if scaleFact != "" {
		setupParts = append(setupParts, fmt.Sprintf("Scale: %s", scaleFact))
	}

	setup := "[SETUP]\n"
	if len(setupParts) > 0 {
		setup += strings.Join(setupParts, "\n\n")
	} else {
		setup += "Historical location with significant maritime importance"
	}

	setup += "\n\n[CONFLICT]\nWhat happened when the ground beneath this thriving settlement began to fail?"

	return setup
}

func (p *NarrativePlanner) generateConflict(research ResearchResult) string {
	facts := research.Facts

	// Find the earthquake facts
	var quakeFact, tsunamiFact string
	for _, f := range facts {
		content := strings.ToLower(f.Content)
		if strings.Contains(content, "earthquake") || strings.Contains(content, "magnitude") ||
			strings.Contains(content, "quake") || strings.Contains(content, "shake") {
			quakeFact = f.Content
		}
		if strings.Contains(content, "tsunami") || strings.Contains(content, "wave") ||
			strings.Contains(content, "flood") || strings.Contains(content, "water") {
			tsunamiFact = f.Content
		}
	}

	// Build conflict from facts
	var conflict string
	conflict = "[CONFLICT]\n"

	if quakeFact != "" {
		conflict += fmt.Sprintf("%s\n\n", quakeFact)
	} else if tsunamiFact != "" {
		conflict += fmt.Sprintf("%s\n\n", tsunamiFact)
	} else {
		conflict += "The ground began to shake violently.\n\n"
	}

	conflict += "[CURIOUSITY LOOP]\nWhy didn't the buildings simply collapse? What was different about this disaster?"

	return conflict
}

func (p *NarrativePlanner) generateDiscoveries(research ResearchResult) string {
	facts := research.Facts

	// Build discovery narrative from actual facts
	var narrative strings.Builder
	narrative.WriteString("[DISCOVERY]\n")

	// Find specific facts for each discovery - concrete details only
	var discovery1, discovery2, discovery3 string
	for _, f := range facts {
		content := strings.ToLower(f.Content)
		if strings.Contains(content, "liquefaction") || strings.Contains(content, "liquid ground") ||
			strings.Contains(content, "sand") || strings.Contains(content, "mud") ||
			strings.Contains(content, "soil") || strings.Contains(content, "ground") {
			discovery1 = f.Content
		}
		if strings.Contains(content, "preserved") || strings.Contains(content, "intact") ||
			strings.Contains(content, "street") || strings.Contains(content, "building") ||
			strings.Contains(content, "underwater") || strings.Contains(content, "archaeology") {
			discovery2 = f.Content
		}
		if strings.Contains(content, "artifact") || strings.Contains(content, "divers") ||
			strings.Contains(content, "bottle") || strings.Contains(content, "china") ||
			strings.Contains(content, "coin") || strings.Contains(content, "grave") {
			discovery3 = f.Content
		}
	}

	if discovery1 != "" {
		narrative.WriteString(fmt.Sprintf("1) %s\n\n", discovery1))
	}
	if discovery2 != "" {
		narrative.WriteString(fmt.Sprintf("2) %s\n\n", discovery2))
	}
	if discovery3 != "" {
		narrative.WriteString(fmt.Sprintf("3) %s\n\n", discovery3))
	}

	// If no discoveries found, use generic placeholder
	if discovery1 == "" && discovery2 == "" && discovery3 == "" {
		narrative.WriteString("1) The site revealed unexpected preservation patterns\n\n")
		narrative.WriteString("2) Archaeological findings showed unusual conditions\n\n")
		narrative.WriteString("3) Modern analysis continues to uncover new details\n\n")
	}

	return narrative.String()
}

func (p *NarrativePlanner) generateEscalation(research ResearchResult) string {
	facts := research.Facts

	// Find escalation facts
	var escalationFact string
	for _, f := range facts {
		content := strings.ToLower(f.Content)
		if strings.Contains(content, "tsunami") || strings.Contains(content, "wave") ||
			strings.Contains(content, "flood") || strings.Contains(content, "six hours") {
			escalationFact = f.Content
			break
		}
	}

	escalation := "[ESCALATION]\n"
	if escalationFact != "" {
		escalation += escalationFact + "\n\n"
	} else {
		escalation += "The event triggered additional catastrophic effects.\n\n"
	}

	escalation += "[CURIOUSITY LOOP]\nWhat if the second disaster preserved what the first threatened to destroy?"

	return escalation
}

func (p *NarrativePlanner) generateReveal(research ResearchResult) string {
	facts := research.Facts

	// Find the liquefaction preservation fact - THIS IS THE REVEAL
	var revealFact string
	for _, f := range facts {
		content := strings.ToLower(f.Content)
		if strings.Contains(content, "liquefaction") || strings.Contains(content, "intact") ||
			strings.Contains(content, "preserved") || strings.Contains(content, "underwater") ||
			strings.Contains(content, "sank") || strings.Contains(content, "liquid") {
			revealFact = f.Content
			break
		}
	}

	// Find why it matters facts
	var importanceFact string
	for _, f := range facts {
		content := strings.ToLower(f.Content)
		if strings.Contains(content, "engineer") || strings.Contains(content, "study") ||
			strings.Contains(content, "modern") || strings.Contains(content, "threaten") ||
			strings.Contains(content, "applies") {
			importanceFact = f.Content
			break
		}
	}

	reveal := "[REVEAL]\n"
	if revealFact != "" {
		reveal += fmt.Sprintf("The key finding: %s\n", revealFact)
	} else {
		reveal += "The key finding: The ground turned to liquid and preserved everything.\n"
	}

	reveal += "\n[WHY IT MATTERS]\n"
	if importanceFact != "" {
		reveal += importanceFact
	} else {
		reveal += "This discovery has implications for understanding natural disasters and preservation."
	}

	return reveal
}

func (p *NarrativePlanner) generateConclusion(research ResearchResult) string {
	facts := research.Facts

	// Find conclusion facts
	var artifactFact, dateFact string
	for _, f := range facts {
		content := strings.ToLower(f.Content)
		if strings.Contains(content, "2018") || strings.Contains(content, "2019") ||
			strings.Contains(content, "2020") || strings.Contains(content, "church") ||
			strings.Contains(content, "grave") || strings.Contains(content, "coffin") {
			artifactFact = f.Content
		}
		if strings.Contains(content, "bottle") || strings.Contains(content, "rum") ||
			strings.Contains(content, "label") || strings.Contains(content, "330 year") {
			dateFact = f.Content
		}
	}

	conclusion := "[CONCLUSION]\n"
	if artifactFact != "" {
		conclusion += fmt.Sprintf("%s\n\n", artifactFact)
	} else {
		conclusion += "Archaeological findings continue to reveal the site's secrets.\n\n"
	}

	if dateFact != "" {
		conclusion += fmt.Sprintf("%s\n\n", dateFact)
	} else {
		conclusion += "The preservation offers insights into historical daily life.\n\n"
	}

	conclusion += "[CTA]\nWhat other natural events have created accidental preservation? Subscribe for more discoveries."

	return conclusion
}

func (p *NarrativePlanner) generateCTA(topicTitle string) string {
	return fmt.Sprintf(`[CTA]
%s's secrets are still waiting to be discovered. Subscribe for more historical mysteries.`,
		topicTitle)
}

func (p *NarrativePlanner) addVisualScenes(arc *StoryArc, research ResearchResult) {
	arc.VisualPlan = append(arc.VisualPlan,
		Scene{
			Section:    "hook",
			Narration:  arc.Hook,
			Visual:     "Aerial drone shot showing submerged ruins with dramatic lighting",
			Duration:   "0:20",
			Importance: 5,
		},
		Scene{
			Section:    "setup",
			Narration:  arc.Setup,
			Visual:     "Historical recreation showing the location and its significance",
			Duration:   "0:35",
			Importance: 4,
		},
		Scene{
			Section:    "conflict",
			Narration:  arc.Conflict,
			Visual:     "Animation showing ground failure and water effects",
			Duration:   "0:30",
			Importance: 5,
		},
		Scene{
			Section:    "discovery",
			Narration:  arc.Discovery,
			Visual:     "Underwater footage of preserved artifacts and structures",
			Duration:   "1:00",
			Importance: 4,
		},
		Scene{
			Section:    "escalation",
			Narration:  arc.Escalation,
			Visual:     "Animation showing secondary effects and preservation",
			Duration:   "0:30",
			Importance: 4,
		},
		Scene{
			Section:    "reveal",
			Narration:  arc.Reveal,
			Visual:     "3D scan showing preserved structures and artifacts",
			Duration:   "0:45",
			Importance: 5,
		},
		Scene{
			Section:    "conclusion",
			Narration:  arc.Conclusion,
			Visual:     "Modern archaeological techniques and findings",
			Duration:   "0:30",
			Importance: 3,
		},
		Scene{
			Section:    "cta",
			Narration:  arc.CTA,
			Visual:     "Channel branding and subscribe animation",
			Duration:   "0:15",
			Importance: 2,
		},
	)
}

func (p *NarrativePlanner) firstNonEmpty(a, b string) string {
	if a != "" {
		return a
	}
	return b
}