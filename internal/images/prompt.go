package images

import (
	"fmt"
	"strings"

	"youtube-pipeline/internal/models"
)

// EnhancePrompt adds style modifiers to a visual marker description
func EnhancePrompt(marker models.VisualMarker) string {
	modifiers := map[string]string{
		"documentary": "cinematic documentary photography, National Geographic quality, dramatic lighting, photorealistic, 8k resolution",
		"atmospheric": "moody atmospheric shot, fog, dramatic shadows, cinematic composition, film grain, documentary style",
		"aerial":      "drone aerial photography, bird's eye view, sweeping landscape, cinematic color grading, 8k resolution",
		"interior":    "dramatic interior lighting, dust particles in light beams, archaeological documentation style, photorealistic",
		"night":       "nighttime photography, moonlit scene, cinematic noir lighting, long exposure, moody atmosphere",
	}

	mod := modifiers[marker.Style]
	if mod == "" {
		mod = modifiers["documentary"]
	}

	return fmt.Sprintf("%s, %s", marker.Description, mod)
}

// ExtractKeyElements extracts key visual elements from a script section
func ExtractKeyElements(sectionText string) []string {
	var elements []string

	// Look for common visual keywords
	keywords := []string{"ruins", "ruins", "archaeology", "excavation", "discovery", "artifact",
		"underground", "tunnel", "cavern", "chamber", "statue", "building", "structure",
		"map", "document", "photograph", "skull", "skeleton", "bones", "tablet", "inscription"}

	lowerText := strings.ToLower(sectionText)
	for _, kw := range keywords {
		if strings.Contains(lowerText, kw) {
			elements = append(elements, kw)
		}
	}

	return uniqueElements(elements)
}

// UniqueElements removes duplicates while preserving order
func uniqueElements(items []string) []string {
	seen := make(map[string]bool)
	var result []string
	for _, item := range items {
		if !seen[item] {
			seen[item] = true
			result = append(result, item)
		}
	}
	return result
}

// GenerateImagePrompt creates a detailed prompt for image generation
func GenerateImagePrompt(topic models.Topic, visualMarker models.VisualMarker) string {
	basePrompt := fmt.Sprintf("%s in %s", topic.Title, topic.Location)

	// Add location-specific modifiers
	locationMods := map[string]string{
		"japan":     "traditional Japanese architecture, torii gates, cherry blossoms, zen garden",
		"egypt":     "ancient Egyptian architecture, sandstone, hieroglyphs, pyramid shadows",
		"peru":      "Andean architecture, stone ruins, mountain backdrop, Inca stonework",
		"russia":    "Soviet-era abandoned building, concrete, frost, melancholy atmosphere",
		"ukraine":   "Soviet architecture, concrete, overgrown, post-industrial decay",
	}

	mod := locationMods[strings.ToLower(topic.Location)]
	if mod != "" {
		basePrompt = fmt.Sprintf("%s, %s", basePrompt, mod)
	}

	enhanced := EnhancePrompt(visualMarker)
	return fmt.Sprintf("%s, %s", basePrompt, enhanced)
}