package script

import (
	"regexp"
	"strings"
)

// ValidationResult contains the results of script validation
type ValidationResult struct {
	IsValid          bool     `json:"is_valid"`
	Errors           []string `json:"errors"`
	Warnings         []string `json:"warnings"`
	BannedPhrases    []string `json:"banned_phrases"`
	MissingDetails   []string `json:"missing_details"`
	FactCheckIssues  []string `json:"fact_check_issues"`
	EngagementScore  int      `json:"engagement_score"` // 1-10
}

// Validator performs post-generation validation of scripts
type Validator struct {
	bannedPhrases []string
	factChecker   *FactChecker
}

func NewValidator() *Validator {
	return &Validator{
		bannedPhrases: []string{
			"testament to",
			"turning point",
			"secrets of",
			"reminds us of",
			"it serves as",
			"one of the most",
			"remains remarkably preserved",
			"rum bottle with original label",
			"200 graves",
		},
		factChecker: NewFactChecker(),
	}
}

// Validate performs comprehensive validation of a script
func (v *Validator) Validate(draft string) ValidationResult {
	result := ValidationResult{
		Errors:        []string{},
		Warnings:      []string{},
		BannedPhrases: []string{},
		MissingDetails: []string{},
		FactCheckIssues: []string{},
	}

	// Check for banned phrases
	for _, phrase := range v.bannedPhrases {
		if strings.Contains(strings.ToLower(draft), phrase) {
			result.BannedPhrases = append(result.BannedPhrases, phrase)
			result.Errors = append(result.Errors, "Banned phrase found: '"+phrase+"'")
		}
	}

	// Check for concrete details in each paragraph
	paragraphs := strings.Split(draft, "\n\n")
	for i, para := range paragraphs {
		if strings.TrimSpace(para) == "" {
			continue
		}
		if !v.hasConcreteDetail(para) {
			result.MissingDetails = append(result.MissingDetails,
				"Paragraph "+string(rune('1'+i))+": missing concrete detail")
		}
	}

	// Fact checking
	result.FactCheckIssues = v.factChecker.Check(draft)

	// Calculate engagement score
	result.EngagementScore = v.calculateEngagementScore(draft)

	// Determine overall validity
	result.IsValid = len(result.Errors) == 0 && len(result.FactCheckIssues) == 0

	return result
}

// hasConcreteDetail checks if a paragraph contains at least one concrete detail
func (v *Validator) hasConcreteDetail(paragraph string) bool {
	// Look for dates, numbers, names, specific objects, historical events
	concretePatterns := []*regexp.Regexp{
		regexp.MustCompile(`\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b`), // Dates
		regexp.MustCompile(`\b\d{4}\b`),                        // Years
		regexp.MustCompile(`[A-Z][a-z]+ Morgan`),               // Names
		regexp.MustCompile(`\b\d+ (ships?|buildings?|graves?|people?)\b`), // Numbers with nouns
		regexp.MustCompile(`(church|theater|tavern|wharf|dock)\b`), // Specific buildings
		regexp.MustCompile(`(rum|bottle|coin|pottery|weapon)\b`), // Artifacts
		regexp.MustCompile(`(earthquake|tsunami|liquefaction)\b`), // Specific phenomena
		regexp.MustCompile(`(captain|governor|mayor|colonel)\b`), // Titles
	}

	for _, pattern := range concretePatterns {
		if pattern.MatchString(paragraph) {
			return true
		}
	}

	// Check for scene markers or visual descriptions
	if strings.Contains(paragraph, "[VISUAL:") ||
	   strings.Contains(paragraph, "On") ||
	   strings.Contains(paragraph, "At") ||
	   strings.Contains(paragraph, "Divers") ||
	   strings.Contains(paragraph, "Archaeologists") {
		return true
	}

	return false
}

// calculateEngagementScore rates the script on engagement factors
func (v *Validator) calculateEngagementScore(draft string) int {
	score := 5 // Start at neutral

	// Bonus for curiosity hooks
	if strings.Contains(draft, "disaster") || strings.Contains(draft, "disappeared") ||
	   strings.Contains(draft, "vanished") || strings.Contains(draft, "mystery") {
		score += 2
	}

	// Bonus for specific scenes
	if strings.Count(draft, "[VISUAL:") >= 3 {
		score += 1
	}

	// Bonus for active voice
	activeVerbs := []string{"sank", "vanished", "exploded", "dramatically", "suddenly"}
	for _, verb := range activeVerbs {
		if strings.Contains(draft, verb) {
			score += 1
			break
		}
	}

	// Penalty for generic openings
	if strings.HasPrefix(strings.ToLower(draft), "welcome to") ||
	   strings.HasPrefix(strings.ToLower(draft), "located in") {
		score -= 2
	}

	// Penalty for textbook style
	if strings.Contains(draft, "this documentary explores") ||
	   strings.Contains(draft, "in this episode") {
		score -= 2
	}

	// Ensure score is in valid range
	if score < 1 {
		score = 1
	}
	if score > 10 {
		score = 10
	}

	return score
}

// FactChecker validates historical claims
type FactChecker struct{}

func NewFactChecker() *FactChecker {
	return &FactChecker{}
}

func (fc *FactChecker) Check(draft string) []string {
	var issues []string

	// Check for wrong dates
	if strings.Contains(draft, "September 7, 1692") {
		issues = append(issues, "Wrong earthquake date: should be June 7, 1692")
	}

	// Check for Henry Morgan death date issue
	if strings.Contains(draft, "Henry Morgan") &&
	   strings.Contains(draft, "earthquake") &&
	   !strings.Contains(draft, "died 1688") {
		// Henry Morgan died 4 years before the earthquake - check context
		issues = append(issues, "Henry Morgan connection to 1692 earthquake may be misleading (he died in 1688)")
	}

	// Check for unsubstantiated claims
	if strings.Contains(draft, "rum bottle with original label") {
		issues = append(issues, "Unsubstantiated claim: 'rum bottle with original label' needs citation")
	}

	if strings.Contains(draft, "200 graves") {
		issues = append(issues, "Unsubstantiated claim: '200 graves' needs citation")
	}

	return issues
}