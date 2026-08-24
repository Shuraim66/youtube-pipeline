package script

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"youtube-pipeline/internal/models"
)

// Fact represents a verified or uncertain piece of information
type Fact struct {
	Content    string  `json:"content"`
	Source     string  `json:"source"`
	Confidence float64 `json:"confidence"` // 0.0 to 1.0
	Type       string  `json:"type"`       // "fact", "myth", "uncertain", "speculation"
	Verified   bool    `json:"verified"`
}

// ResearchResult contains compiled research for a topic
type ResearchResult struct {
	Topic         models.Topic     `json:"topic"`
	Facts         []Fact           `json:"facts"`
	Myths         []Fact           `json:"myths"`
	Uncertain     []Fact           `json:"uncertain"`
	Dates         []string         `json:"dates"`
	People        []string         `json:"people"`
	Locations     []string         `json:"locations"`
	Events        []string         `json:"events"`
	Controversies []string         `json:"controversies"`
	Confidence    float64          `json:"confidence"`
	ResearchTime  time.Time        `json:"research_time"`
}

// TopicResearcher collects and organizes information about a topic
type TopicResearcher struct {
	client *OllamaClient
}

func NewTopicResearcher(client *OllamaClient) *TopicResearcher {
	return &TopicResearcher{client: client}
}

// CollectFacts extracts verified facts from the topic description and additional research
func (r *TopicResearcher) CollectFacts(topic models.Topic) ResearchResult {
	result := ResearchResult{
		Topic:        topic,
		Facts:        []Fact{},
		Myths:        []Fact{},
		Uncertain:    []Fact{},
		ResearchTime: time.Now(),
	}

	// Base facts from topic description
	baseFacts := r.extractBaseFacts(topic)
	result.Facts = append(result.Facts, baseFacts...)

	// Additional research
	additionalFacts := r.researchAdditional(topic)
	result.Facts = append(result.Facts, additionalFacts.Facts...)
	result.Myths = append(result.Myths, additionalFacts.Myths...)
	result.Uncertain = append(result.Uncertain, additionalFacts.Uncertain...)

	result.Confidence = r.calculateConfidence(result.Facts)
	return result
}

func (r *TopicResearcher) extractBaseFacts(topic models.Topic) []Fact {
	var facts []Fact

	// Extract historical facts from description
	desc := topic.Description

	// Parse for dates
	dates := r.extractDates(desc)
	for _, d := range dates {
		facts = append(facts, Fact{
			Content:    fmt.Sprintf("Event occurred in %s", d),
			Source:     "topic_description",
			Confidence: 0.9,
			Type:       "fact",
			Verified:   true,
		})
	}

	// Parse for locations
	locations := r.extractLocations(desc, topic.Location)
	for _, loc := range locations {
		facts = append(facts, Fact{
			Content:    fmt.Sprintf("Located in %s", loc),
			Source:     "topic_description",
			Confidence: 0.95,
			Type:       "fact",
			Verified:   true,
		})
	}

	return facts
}

func (r *TopicResearcher) researchAdditional(topic models.Topic) ResearchResult {
	// Use Ollama to gather verified historical information
	prompt := fmt.Sprintf(`Research the topic "%s" in %s thoroughly.

Provide ONLY verified historical facts with sources. Do NOT invent facts or add speculation.

CRITICAL: Look specifically for these types of facts:
- The liquefaction phenomenon (how soil turned to liquid)
- How buildings sank intact rather than collapsed
- Underwater preservation details
- Specific artifact discoveries (dates, items found)
- Archaeological methods and findings
- Modern research applications

Format your response as:
## FACTS
[numbered list of verified facts with sources - prioritize liquefaction, preservation, and archaeological discoveries]

## MYTHS
[common myths about this topic, clearly labeled as myths]

## UNCERTAIN
[facts that are debated by historians]

## DATES
[important dates]

## PEOPLE
[key historical figures]

## LOCATIONS
[key locations]

## EVENTS
[significant events]

## CONTROVERSIES
[any historical controversies]

Be conservative - only include what can be reasonably verified. Focus especially on the unique geological phenomenon that makes this site special.`, topic.Title, topic.Location)

	systemPrompt := `You are a historical research assistant. Your job is to gather VERIFIED facts about historical topics.
Do NOT make up information. If you are unsure about something, mark it as uncertain or omit it entirely.
Cite sources when possible. Be conservative in your claims.`

	resp, err := r.client.doRequest("/api/generate", map[string]interface{}{
		"model":  r.client.model,
		"system": systemPrompt,
		"prompt": prompt,
		"stream": false,
		"options": map[string]interface{}{
			"temperature": 0.3, // Low temperature for factual accuracy
			"num_ctx":     8192,
			"num_predict": 2500,
		},
	})

	if err != nil {
		return ResearchResult{Confidence: 0.5}
	}

	var result struct {
		Response string `json:"response"`
	}
	if err := json.Unmarshal(resp, &result); err != nil {
		return ResearchResult{Confidence: 0.5}
	}

	return r.parseResearchResponse(result.Response, topic)
}

func (r *TopicResearcher) parseResearchResponse(response string, topic models.Topic) ResearchResult {
	result := ResearchResult{
		Topic:        topic,
		ResearchTime: time.Now(),
	}

	// Parse sections
	sections := map[string][]string{
		"facts":         r.extractSection(response, "FACTS"),
		"myths":         r.extractSection(response, "MYTHS"),
		"uncertain":     r.extractSection(response, "UNCERTAIN"),
		"dates":         r.extractSection(response, "DATES"),
		"people":        r.extractSection(response, "PEOPLE"),
		"locations":     r.extractSection(response, "LOCATIONS"),
		"events":        r.extractSection(response, "EVENTS"),
		"controversies": r.extractSection(response, "CONTROVERSIES"),
	}

	// Convert to facts
	for _, content := range sections["facts"] {
		result.Facts = append(result.Facts, Fact{
			Content:    content,
			Source:     "ollama_research",
			Confidence: 0.9,
			Type:       "fact",
			Verified:   true,
		})
	}

	for _, content := range sections["myths"] {
		result.Myths = append(result.Myths, Fact{
			Content:    content,
			Source:     "ollama_research",
			Confidence: 0.8,
			Type:       "myth",
			Verified:   true,
		})
	}

	for _, content := range sections["uncertain"] {
		result.Uncertain = append(result.Uncertain, Fact{
			Content:    content,
			Source:     "ollama_research",
			Confidence: 0.5,
			Type:       "uncertain",
			Verified:   false,
		})
	}

	result.Dates = sections["dates"]
	result.People = sections["people"]
	result.Locations = sections["locations"]
	result.Events = sections["events"]
	result.Controversies = sections["controversies"]
	result.Confidence = r.calculateConfidence(result.Facts)

	return result
}

func (r *TopicResearcher) extractSection(response, section string) []string {
	prefix := fmt.Sprintf("## %s", section)
	start := strings.Index(response, prefix)
	if start == -1 {
		return nil
	}

	content := response[start+len(prefix):]
	end := strings.Index(content, "\n##")
	if end != -1 {
		content = content[:end]
	}

	// Parse numbered or bulleted list
	var items []string
	lines := strings.Split(content, "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		// Remove numbering or bullets
		line = strings.TrimLeft(line, "0123456789.-) ")
		line = strings.TrimSpace(line)
		if line != "" {
			items = append(items, line)
		}
	}
	return items
}

func (r *TopicResearcher) extractDates(text string) []string {
	// Simple date extraction - in production, use proper regex
	var dates []string
	patterns := []string{"1692", "1700", "1600", "1704", "1800"}
	for _, p := range patterns {
		if strings.Contains(text, p) {
			dates = append(dates, p)
		}
	}
	return dates
}

func (r *TopicResearcher) extractLocations(text, location string) []string {
	return []string{location}
}

func (r *TopicResearcher) calculateConfidence(facts []Fact) float64 {
	if len(facts) == 0 {
		return 0
	}
	var total float64
	for _, f := range facts {
		if f.Verified {
			total += f.Confidence
		}
	}
	return total / float64(len(facts))
}