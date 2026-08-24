package script

import (
	"regexp"
	"strings"
)

// ParseVisualMarkers extracts visual markers from script text
func ParseVisualMarkers(text string) []map[string]string {
	var markers []map[string]string
	visRegex := regexp.MustCompile(`\[VISUAL:\s*([^\]]+)\]`)

	matches := visRegex.FindAllStringSubmatchIndex(text, -1)
	for i, match := range matches {
		if len(match) >= 4 {
			desc := strings.TrimSpace(text[match[2]:match[3]])
			markers = append(markers, map[string]string{
				"index":       string(rune('0' + i)),
				"description": desc,
				"style":       detectStyle(desc),
			})
		}
	}
	return markers
}

// detectStyle determines the visual style from description keywords
func detectStyle(desc string) string {
	d := strings.ToLower(desc)

	// Check for specific styles
	if strings.Contains(d, "aerial") || strings.Contains(d, "drone") || strings.Contains(d, "bird's eye") {
		return "aerial"
	}
	if strings.Contains(d, "interior") || strings.Contains(d, "inside") || strings.Contains(d, "room") {
		return "interior"
	}
	if strings.Contains(d, "fog") || strings.Contains(d, "dark") || strings.Contains(d, "atmospheric") {
		return "atmospheric"
	}
	if strings.Contains(d, "night") || strings.Contains(d, "lunar") || strings.Contains(d, "noir") {
		return "night"
	}

	return "documentary"
}

// ExtractSections parses script into named sections
func ExtractSections(text string) map[string]string {
	sections := make(map[string]string)
	currentSection := ""
	var currentContent []string

	lines := strings.Split(text, "\n")
	for _, line := range lines {
		upperLine := strings.ToUpper(strings.TrimSpace(line))

		// Check for section headers
		if strings.HasPrefix(upperLine, "HOOK") || strings.Contains(upperLine, "0:00") {
			if currentSection != "" && len(currentContent) > 0 {
				sections[currentSection] = strings.Join(currentContent, "\n")
			}
			currentSection = "hook"
			currentContent = nil
		} else if strings.HasPrefix(upperLine, "SETUP") || strings.Contains(upperLine, "0:15") {
			if currentSection != "" && len(currentContent) > 0 {
				sections[currentSection] = strings.Join(currentContent, "\n")
			}
			currentSection = "setup"
			currentContent = nil
		} else if strings.HasPrefix(upperLine, "DISCOVERY") || strings.Contains(upperLine, "1:30") {
			if currentSection != "" && len(currentContent) > 0 {
				sections[currentSection] = strings.Join(currentContent, "\n")
			}
			currentSection = "discovery"
			currentContent = nil
		} else if strings.HasPrefix(upperLine, "REVELATION") || strings.Contains(upperLine, "4:00") {
			if currentSection != "" && len(currentContent) > 0 {
				sections[currentSection] = strings.Join(currentContent, "\n")
			}
			currentSection = "revelation"
			currentContent = nil
		} else if strings.HasPrefix(upperLine, "IMPLICATION") || strings.Contains(upperLine, "6:30") {
			if currentSection != "" && len(currentContent) > 0 {
				sections[currentSection] = strings.Join(currentContent, "\n")
			}
			currentSection = "implication"
			currentContent = nil
		} else if strings.HasPrefix(upperLine, "OUTRO") || strings.Contains(upperLine, "7:30") {
			if currentSection != "" && len(currentContent) > 0 {
				sections[currentSection] = strings.Join(currentContent, "\n")
			}
			currentSection = "outro"
			currentContent = nil
		}

		currentContent = append(currentContent, line)
	}

	// Save last section
	if currentSection != "" && len(currentContent) > 0 {
		sections[currentSection] = strings.Join(currentContent, "\n")
	}

	return sections
}

// CalculateWordCount returns word count of text
func CalculateWordCount(text string) int {
	words := strings.Fields(text)
	return len(words)
}

// EstimateDuration returns estimated duration in minutes based on word count
func EstimateDuration(wordCount int) float64 {
	return float64(wordCount) / 150.0
}