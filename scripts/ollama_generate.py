#!/usr/bin/env python3
"""
Alternative: Direct Ollama API client for script generation.
Can be used as a standalone tool or imported as a module.
"""

import argparse
import json
import re
import requests
import sys
import time
from typing import Optional, List, Dict

DEFAULT_BASE_URL = "http://localhost:11434"
DEFAULT_MODEL = "mistral"
DEFAULT_TEMPERATURE = 0.7
DEFAULT_MAX_TOKENS = 2500

# Banned phrases that must not appear in scripts
BANNED_PHRASES = [
    "testament to",
    "turning point",
    "secrets of",
    "reminds us of",
    "it serves as a reminder",
    "one of the most",
    "remains remarkably preserved",
    "rum bottle with original label",
    "200 graves",
]


class ScriptValidator:
    """Validates scripts against rules 24-28 and fact checking."""

    def __init__(self):
        self.banned_phrases = BANNED_PHRASES

    def validate(self, draft: str) -> Dict:
        """Perform comprehensive validation of a script."""
        result = {
            "is_valid": True,
            "errors": [],
            "warnings": [],
            "banned_phrases": [],
            "missing_details": [],
            "fact_check_issues": [],
            "engagement_score": 5,
        }

        # Check for banned phrases
        for phrase in self.banned_phrases:
            if phrase in draft.lower():
                result["banned_phrases"].append(phrase)
                result["errors"].append(f"Banned phrase found: '{phrase}'")

        # Check for concrete details in each paragraph
        paragraphs = [p.strip() for p in draft.split("\n\n") if p.strip()]
        for i, para in enumerate(paragraphs):
            if not self._has_concrete_detail(para):
                result["missing_details"].append(
                    f"Paragraph {i+1}: missing concrete detail"
                )

        # Fact checking
        result["fact_check_issues"] = self._check_facts(draft)

        # Calculate engagement score
        result["engagement_score"] = self._calculate_engagement_score(draft)

        # Determine overall validity
        result["is_valid"] = (
            len(result["errors"]) == 0 and
            len(result["fact_check_issues"]) == 0
        )

        return result

    def _has_concrete_detail(self, paragraph: str) -> bool:
        """Check if paragraph contains at least one concrete detail."""
        patterns = [
            r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',  # Dates
            r'\b\d{4}\b',  # Years
            r'[A-Z][a-z]+ Morgan',  # Names
            r'\b\d+ (ships?|buildings?|graves?|people?)\b',  # Numbers with nouns
            r'(church|theater|tavern|wharf|dock)\b',  # Specific buildings
            r'(rum|bottle|coin|pottery|weapon)\b',  # Artifacts
            r'(earthquake|tsunami|liquefaction)\b',  # Specific phenomena
            r'(captain|governor|mayor|colonel)\b',  # Titles
        ]

        for pattern in patterns:
            if re.search(pattern, paragraph, re.IGNORECASE):
                return True

        # Check for scene markers or visual descriptions
        if any(x in paragraph.lower() for x in ["[visual:", "on", "at", "divers", "archaeologists"]):
            return True

        return False

    def _check_facts(self, draft: str) -> List[str]:
        """Validate historical facts."""
        issues = []

        # Check for wrong dates
        if "September 7, 1692" in draft:
            issues.append("Wrong earthquake date: should be June 7, 1692")

        # Check for Henry Morgan death date issue
        if "Henry Morgan" in draft and "earthquake" in draft:
            if "died 1688" not in draft:
                issues.append("Henry Morgan connection to 1692 earthquake may be misleading (he died in 1688)")

        return issues

    def _calculate_engagement_score(self, draft: str) -> int:
        """Calculate engagement score 1-10."""
        score = 5

        # Bonus for curiosity hooks
        if any(x in draft.lower() for x in ["disaster", "vanished", "mystery"]):
            score += 2

        # Bonus for specific scenes
        if draft.count("[visual:") >= 3:
            score += 1

        # Bonus for active voice
        if any(x in draft for x in ["sank", "vanished", "exploded", "dramatically", "suddenly"]):
            score += 1

        # Penalty for generic openings
        if draft.lower().startswith("welcome to") or draft.lower().startswith("located in"):
            score -= 2

        # Penalty for textbook style
        if "this documentary explores" in draft.lower() or "in this episode" in draft.lower():
            score -= 2

        return max(1, min(10, score))


class OllamaClient:
    def __init__(self, base_url: str = DEFAULT_BASE_URL, model: str = DEFAULT_MODEL):
        self.base_url = base_url.rstrip('/')
        self.model = model
        self.validator = ScriptValidator()

    def generate(self, prompt: str, system: Optional[str] = None,
                 temperature: float = DEFAULT_TEMPERATURE,
                 max_tokens: int = DEFAULT_MAX_TOKENS,
                 stream: bool = False) -> dict:
        """Generate text from Ollama."""
        payload = {
            "model": self.model,
            "prompt": prompt,
            "temperature": temperature,
            "num_predict": max_tokens,
            "stream": stream,
        }

        if system:
            payload["system"] = system

        response = requests.post(
            f"{self.base_url}/api/generate",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=300
        )
        response.raise_for_status()
        return response.json()

    def generate_script(self, topic: dict, title: str, duration: int = 10) -> dict:
        """Generate a documentary script for a topic with enhanced storytelling criteria."""
        word_target = duration * 150

        prompt = f"""Write a {duration}-minute documentary script for: "{title}"

TOPIC: {topic['title']} in {topic['location']}
Description: {topic['description']}

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

Target: {word_target} words.
Include [VISUAL: description] markers after each section.
Tone: Conversational, authoritative, cinematic."""

        system_prompt = """You are an expert historical documentary writer for YouTube. Your job is to craft engaging narratives from VERIFIED facts ONLY.

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
2. Create compelling narrative flow with scene-based storytelling
3. Build curiosity and tension through questions and escalating stakes
4. End with a satisfying resolution that reveals something surprising
5. EVERY paragraph must contain concrete details (names, dates, objects, numbers)
6. Replace all abstract language with specific, visual descriptions

BANNED PHRASES: "testament to", "turning point", "secrets of", "reminds us of", "it serves as a reminder", "one of the most"

If you cannot verify something, mark it as "historians believe" or "records suggest" rather than stating as fact.

Target: 140-150 words per minute for natural pacing."""

        start = time.time()
        result = self.generate(prompt, system=system_prompt)
        elapsed = time.time() - start

        draft = result.get("response", "")

        # Validate the generated script
        validation = self.validator.validate(draft)
        if validation["errors"] or validation["fact_check_issues"]:
            print(f"Validation warnings: {validation['errors'] + validation['fact_check_issues']}",
                  file=sys.stderr)

        return {
            "title": title,
            "topic_id": topic.get("id", ""),
            "draft": draft,
            "word_count": len(draft.split()),
            "estimated_duration": len(draft.split()) / 150.0,
            "model": self.model,
            "generation_time_seconds": elapsed,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "validation": validation,
        }


def main():
    parser = argparse.ArgumentParser(description="Generate script via Ollama")
    parser.add_argument("--topic", required=True, help="Topic JSON file path")
    parser.add_argument("--title", required=True, help="Video title")
    parser.add_argument("--duration", type=int, default=10, help="Target duration in minutes")
    parser.add_argument("--model", default=DEFAULT_MODEL, help="Ollama model to use")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL, help="Ollama base URL")
    parser.add_argument("--output", help="Output JSON file path")
    args = parser.parse_args()

    # Load topic
    with open(args.topic, 'r') as f:
        topic = json.load(f)

    # Generate script
    client = OllamaClient(base_url=args.base_url, model=args.model)
    result = client.generate_script(topic, args.title, args.duration)

    # Output
    output_json = json.dumps(result, indent=2)
    print(output_json)

    if args.output:
        with open(args.output, 'w') as f:
            f.write(output_json)
        print(f"\nSaved to: {args.output}", file=sys.stderr)


if __name__ == "__main__":
    main()