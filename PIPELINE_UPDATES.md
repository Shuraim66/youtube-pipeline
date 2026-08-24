# Pipeline Updates - Rule 24-28 Implementation

## Summary of Changes

This update implements the critical feedback from the Herodotus model evaluation, adding a comprehensive validation layer and new storytelling rules to the pipeline.

## Files Modified

### 1. `internal/script/validator.go` (NEW)
- Created `Validator` type with comprehensive script validation
- Implemented `ScriptValidator` class for checking:
  - Banned phrases detection
  - Concrete detail requirements
  - Fact checking (dates, Henry Morgan timeline, unsubstantiated claims)
  - Engagement scoring (1-10 scale)
- Integrated with `FactChecker` for historical accuracy verification

### 2. `internal/script/ollama.go` (UPDATED)
- Added `validator` field to `OllamaClient`
- Integrated validation after script generation
- Updated prompt with rules 24-28 and banned phrases list
- Added story beats structure to prompt

### 3. `internal/script/narrative.go` (UPDATED)
- Enhanced `generateHook()` to start with specific moments
- Improved `generateSetup()` to use concrete details
- Added engagement-focused curiosity loops
- Better integration with validation requirements

### 4. `internal/script/researcher.go` (UPDATED)
- Added focus on liquefaction and preservation facts
- Better extraction of specific archaeological details
- Improved date handling for historical accuracy

### 5. `scripts/ollama_generate.py` (UPDATED)
- Added `ScriptValidator` class with same validation logic
- Integrated validation into `generate_script()` method
- Updated prompt with rules 24-28
- Added validation results to output JSON

### 6. `configs/config.yaml` (UPDATED)
- Changed default model to `qwen2.5-coder:14b` (best performer)
- Added `validation` section with configurable settings
- Added `reject_on_errors` option for auto-regeneration

### 7. `README.md` (UPDATED)
- Added "Script Generation Rules" section documenting all 28 rules
- Added "Banned Phrases" section
- Added "Story Beats Structure" section

## New Rules Implemented

### Rule 24 - Never Trust Model Self-Assessment
The model often claims "I have used only verified facts" even when it hasn't. The pipeline now performs independent validation regardless of the model's statements.

### Rule 25 - Viewer-First Storytelling
Shifted priority from historical completeness to viewer retention. Every paragraph must make viewers want to continue.

### Rule 26 - Reject Textbook Narration
Eliminates generic openings like "Welcome to..." or "Located in...". Scripts now begin inside the story with active moments.

### Rule 27 - Scene Test
Every paragraph must describe something the viewer can imagine seeing. Abstract or purely informational paragraphs are flagged.

### Rule 28 - Retention Scoring
Before accepting a script, the pipeline computes scores for:
- Curiosity (8/10 minimum)
- Visual imagery (8/10 minimum)
- Story progression (8/10 minimum)
- Emotional tension (8/10 minimum)
- Historical accuracy (9/10 minimum)

## Validation Results

The validator now catches:
- Wrong earthquake dates (September 7 → June 7, 1692)
- Henry Morgan death timeline issues (died 1688, 4 years before earthquake)
- Unsubstantiated claims (rum bottle with label, 200 graves)
- Banned phrases
- Missing concrete details
- Low engagement scores

## Testing

Run the validation test:
```bash
go run test_validation.go
```

Or test the Python version:
```bash
python scripts/ollama_generate.py --topic data/topics/topic_001.json --title "Test"
```

## Next Steps

1. Test with multiple models to find the best performer
2. Add auto-regeneration on validation failure
3. Integrate with CI/CD for automated quality gates
4. Add citation requirements for all specific claims