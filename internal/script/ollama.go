package script

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"youtube-pipeline/internal/models"
)

type OllamaClient struct {
	baseURL    string
	model      string
	client     *http.Client
	validator  *Validator
}

func NewOllamaClient(baseURL, model string) *OllamaClient {
	return &OllamaClient{
		baseURL:   baseURL,
		model:     model,
		client:    &http.Client{Timeout: 5 * time.Minute},
		validator: NewValidator(),
	}
}

// GenerateScript creates a documentary script from a topic using the new narrative approach
func (c *OllamaClient) GenerateScript(topic models.Topic, title string, duration int) (*models.Script, error) {
	// Step 1: Research the topic
	researcher := NewTopicResearcher(c)
	researchResult := researcher.CollectFacts(topic)

	// Step 2: Plan the narrative
	planner := NewNarrativePlanner()
	arc := planner.PlanStory(researchResult, duration)

	// Step 3: Generate script from the narrative arc
	script, err := c.generateFromNarrative(arc, topic, title, researchResult, duration)
	if err != nil {
		return nil, err
	}

	// Step 4: Validate the script
	validation := c.validator.Validate(script.Draft)
	if !validation.IsValid {
		// Log validation errors but return script anyway for review
		fmt.Printf("Validation warnings: %v\n", validation.Errors)
	}

	return script, nil
}

func (c *OllamaClient) generateFromNarrative(arc StoryArc, topic models.Topic, title string, research ResearchResult, duration int) (*models.Script, error) {
	// Build the prompt with verified facts
	factsText := ""
	for i, fact := range research.Facts {
		if i < 5 { // Use top 5 verified facts
			factsText += fmt.Sprintf("%d. %s\n", i+1, fact.Content)
		}
	}

	prompt := fmt.Sprintf(`Write a %d-minute documentary script for: "%s"

TOPIC: %s in %s

VERIFIED HISTORICAL FACTS (use these, do NOT invent new facts):
%s

RULE 24 - NEVER TRUST MODEL SELF-ASSESSMENT:
Ignore statements like "I have used only verified facts." Perform independent validation.

RULE 25 - VIEWER-FIRST STORYTELLING:
The primary objective is viewer retention, not historical completeness. Every paragraph must make viewers want to continue.

RULE 26 - REJECT TEXTBOOK NARRATION:
Avoid openings like "Welcome to...", "Located in...", "During the...". Begin inside the story.

RULE 27 - SCENE TEST:
Every paragraph must describe something the viewer can imagine seeing. If not, rewrite.

RULE 28 - RETENTION SCORING:
Before accepting, score: Curiosity (8/10), Visual imagery (8/10), Story progression (8/10), Emotional tension (8/10), Historical accuracy (9/10).

RULE 21 - NEVER INVENT SPECIFICITY:
Exact dates, times, measurements, counts, quotations, named witnesses, and named participants must come from verified historical sources. If not verified, use general language instead.

RULE 22 - HISTORICAL SCENE RECONSTRUCTION:
Every scene must distinguish between verified facts, reasonable reconstruction, and speculation. Never depict a historical figure performing an action unless there is evidence they were present.

RULE 23 - CONFIDENCE-AWARE WRITING:
The more specific a claim is, the higher confidence it must have. Use HIGH confidence for exact facts, MEDIUM for general claims, and clearly mark LOW confidence claims.

BANNED PHRASES (DO NOT USE):
- "testament to"
- "turning point"
- "secrets of"
- "reminds us of"
- "it serves as a reminder"
- "one of the most"
- "remains remarkably preserved"
- "rum bottle with original label"
- "200 graves"

STORY BEATS (must follow this structure):
1. HOOK: Start with a specific moment that creates urgency
2. SETUP: Specific time, place, people - what can be seen/heard
3. CONFLICT: The mystery or question that drives the story
4. DISCOVERIES: Three concrete findings with specific details
5. ESCALATION: Why this is more significant than expected
6. REVEAL: The surprising fact about liquefaction preservation
7. CONCLUSION: Modern implications with specific examples
8. CTA: Open question inviting subscription

BAD EXAMPLES TO AVOID:
- "Port Royal was a thriving trading hub" (generic)
- "It was a turning point in history" (abstract)
- "The earthquake was devastating" (vague)
- "Welcome to Jamaica" (textbook opening)

GOOD EXAMPLES TO FOLLOW:
- "By dawn, ships crowded the harbor with merchantmen from London and galleons from Havana"
- "Captain Henry Morgan stood on the wharf as the ground trembled"
- "In 2018, researchers found St. Peter's Church preserved in the underwater ruins"

Total: approximately %d words
Include [VISUAL: description] markers after each section
Tone: Conversational, authoritative, cinematic`,
		duration, title, topic.Title, topic.Location, factsText, duration*140)

	systemPrompt := `You are an expert historical documentary writer for YouTube. Your job is to craft engaging narratives from VERIFIED facts ONLY.

RULE 24: Never trust the model's self-assessment. Ignore statements like "I have used only verified facts."

RULE 25: Viewer-first storytelling - every paragraph must make viewers want to continue.

RULE 26: Reject textbook narration - avoid "Welcome to..." openings. Begin inside the story.

RULE 27: Scene test - every paragraph must describe something the viewer can imagine seeing.

RULE 28: Retention scoring - score before accepting (Curiosity 8/10, Visual imagery 8/10, Story progression 8/10, Emotional tension 8/10, Historical accuracy 9/10).

RULE 21: Never invent specific details. If exact dates, times, measurements, or counts are not verified, use general language.

RULE 22: Distinguish between verified facts, reasonable reconstruction, and speculation. Never depict historical figures performing actions without evidence.

RULE 23: Confidence-aware writing - the more specific a claim, the higher confidence required.

CRITICAL RULES:
1. NEVER invent or fabricate historical facts
2. Use only the facts provided in the prompt
3. Create compelling narrative flow with scene-based storytelling
4. Build curiosity and tension through questions and escalating stakes
5. End with a satisfying resolution that reveals something surprising
6. EVERY paragraph must contain concrete details (names, dates, objects, numbers)
7. Replace all abstract language with specific, visual descriptions

BANNED PHRASES: "testament to", "turning point", "secrets of", "reminds us of", "it serves as a reminder", "one of the most"

If you cannot verify something, mark it as "historians believe" or "records suggest" rather than stating as fact.

Target: 140-150 words per minute for natural pacing.`

	reqBody := map[string]interface{}{
		"model":  c.model,
		"system": systemPrompt,
		"prompt": prompt,
		"stream": false,
		"options": map[string]interface{}{
			"temperature":  0.4,
			"num_ctx":      8192,
			"num_predict":  2500,
		},
	}

	start := time.Now()
	resp, err := c.doRequest("/api/generate", reqBody)
	if err != nil {
		return nil, err
	}
	elapsed := time.Since(start)

	var result struct {
		Response  string `json:"response"`
		EvalCount int    `json:"eval_count"`
	}
	if err := json.Unmarshal(resp, &result); err != nil {
		return nil, err
	}

	// Parse the response
	markers := parseVisualMarkers(result.Response)
	sections := parseSections(result.Response)

	// Calculate actual duration
	wordCount := len(strings.Fields(result.Response))
	estimatedDuration := float64(wordCount) / 140.0

	return &models.Script{
		ID:                fmt.Sprintf("script_%s_%d", topic.ID, time.Now().Unix()),
		TopicID:           topic.ID,
		Title:             title,
		WordCount:         wordCount,
		EstimatedDuration: estimatedDuration,
		Sections:          sections,
		VisualMarkers:     markers,
		Draft:             result.Response,
		Model:             c.model,
		GenerationTime:    elapsed.Seconds(),
		Timestamp:         time.Now(),
		Status:            "draft",
	}, nil
}

func (c *OllamaClient) doRequest(endpoint string, body interface{}) ([]byte, error) {
	jsonBody, _ := json.Marshal(body)
	req, _ := http.NewRequest("POST", c.baseURL+endpoint, bytes.NewReader(jsonBody))
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))
	}
	return io.ReadAll(resp.Body)
}

func parseVisualMarkers(script string) []models.VisualMarker {
	var markers []models.VisualMarker
	for i, line := range strings.Split(script, "\n") {
		if idx := strings.Index(line, "[VISUAL:"); idx != -1 {
			start := idx + len("[VISUAL:")
			end := strings.Index(line[start:], "]")
			if end > 0 {
				desc := strings.TrimSpace(line[start : start+end])
				style := "documentary"
				d := strings.ToLower(desc)
				if strings.Contains(d, "aerial") || strings.Contains(d, "drone") {
					style = "aerial"
				}
				if strings.Contains(d, "interior") || strings.Contains(d, "inside") {
					style = "interior"
				}
				if strings.Contains(d, "fog") || strings.Contains(d, "dark") {
					style = "atmospheric"
				}
				markers = append(markers, models.VisualMarker{Index: i, Description: desc, Style: style})
			}
		}
	}
	return markers
}

func parseSections(script string) map[string]string {
	sections := make(map[string]string)
	current := "uncategorized"
	var content []string

	for _, line := range strings.Split(script, "\n") {
		upper := strings.ToUpper(line)
		switch {
		case strings.Contains(upper, "HOOK") || strings.Contains(upper, "0:00"):
			if current != "uncategorized" && len(content) > 0 {
				sections[current] = strings.Join(content, "\n")
			}
			current = "hook"
			content = nil
		case strings.Contains(upper, "SETUP") || strings.Contains(upper, "0:15"):
			if current != "uncategorized" && len(content) > 0 {
				sections[current] = strings.Join(content, "\n")
			}
			current = "setup"
			content = nil
		case strings.Contains(upper, "CONFLICT"):
			if current != "uncategorized" && len(content) > 0 {
				sections[current] = strings.Join(content, "\n")
			}
			current = "conflict"
			content = nil
		case strings.Contains(upper, "DISCOVERY") || strings.Contains(upper, "1:30"):
			if current != "uncategorized" && len(content) > 0 {
				sections[current] = strings.Join(content, "\n")
			}
			current = "discovery"
			content = nil
		case strings.Contains(upper, "ESCALATION") || strings.Contains(upper, "2:00"):
			if current != "uncategorized" && len(content) > 0 {
				sections[current] = strings.Join(content, "\n")
			}
			current = "escalation"
			content = nil
		case strings.Contains(upper, "REVEAL") || strings.Contains(upper, "4:00"):
			if current != "uncategorized" && len(content) > 0 {
				sections[current] = strings.Join(content, "\n")
			}
			current = "reveal"
			content = nil
		case strings.Contains(upper, "CONCLUSION") || strings.Contains(upper, "6:30"):
			if current != "uncategorized" && len(content) > 0 {
				sections[current] = strings.Join(content, "\n")
			}
			current = "conclusion"
			content = nil
		case strings.Contains(upper, "CTA") || strings.Contains(upper, "7:30"):
			if current != "uncategorized" && len(content) > 0 {
				sections[current] = strings.Join(content, "\n")
			}
			current = "cta"
			content = nil
		}
		content = append(content, line)
	}
	if current != "uncategorized" && len(content) > 0 {
		sections[current] = strings.Join(content, "\n")
	}
	return sections
}