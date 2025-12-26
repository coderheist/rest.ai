# Quick Start: Hybrid Scoring System

## Setup (2 minutes)

### 1. Update Environment File
```bash
cd ai-service
cp .env.example .env
```

Edit `.env`:
```bash
# Start with FREE rule-based mode
SCORING_MODE=rule_based

# Or use hybrid mode (recommended)
# SCORING_MODE=hybrid
# HYBRID_LLM_THRESHOLD=70.0

# Only add API key if using hybrid/llm modes
# GEMINI_API_KEY=your-key-here
```

### 2. Install Dependencies (if not already done)
```bash
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### 3. Start Server
```bash
# Windows
python -m uvicorn app.main:app --reload --port 8000

# Or use the start script
start.bat
```

Server will run at: `http://localhost:8000`

---

## Test the System

### Test 1: Rule-Based Scoring (FREE, FAST)

```bash
curl -X POST "http://localhost:8000/api/score/match?scoring_mode=rule_based" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_text": "Senior Python Developer with 5 years experience. Expert in Django, Flask, PostgreSQL, AWS. Bachelor in Computer Science.",
    "job_description": "Looking for Python Developer with 3+ years, Django, REST APIs, cloud experience.",
    "required_skills": ["python", "django", "rest api"],
    "required_experience_years": 3,
    "required_education": "bachelors"
  }'
```

**Expected Result:**
- Score: ~85-90%
- Speed: <100ms
- Cost: $0

---

### Test 2: Hybrid Scoring (BALANCED)

```bash
curl -X POST "http://localhost:8000/api/score/match?scoring_mode=hybrid" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_text": "Senior Full-Stack Developer with 5 years experience. Expert in React, Node.js, MongoDB, AWS. Led team of 3 developers.",
    "job_description": "Senior Full-Stack role. React, Node.js, team leadership required. 4+ years experience.",
    "required_skills": ["react", "nodejs", "leadership"],
    "required_experience_years": 4,
    "include_explanation": true
  }'
```

**Expected Result:**
- Score: ~88-92%
- Speed: ~2s (if above threshold, LLM kicks in)
- Cost: ~$0.0075 (only if LLM used)
- Explanation: Detailed strengths/gaps

---

### Test 3: Batch Processing (1000 candidates simulation)

```bash
curl -X POST "http://localhost:8000/api/score/batch?scoring_mode=rule_based" \
  -H "Content-Type: application/json" \
  -d '{
    "resumes": [
      {"id": "1", "text": "Python developer, 5 years, Django expert"},
      {"id": "2", "text": "Java developer, 2 years, Spring Boot"},
      {"id": "3", "text": "React developer, 4 years, TypeScript, Node.js"}
    ],
    "job_description": "Python developer needed, 3+ years, Django, REST APIs",
    "required_skills": ["python", "django"]
  }'
```

**Expected Result:**
- Scored: 3/3 candidates
- Speed: <500ms for 3 candidates
- Cost: $0
- Results: Sorted by score

---

### Test 4: Check System Status

```bash
curl http://localhost:8000/api/score/stats
```

**Expected Response:**
```json
{
  "scoring_mode": "hybrid",
  "hybrid_threshold": 70.0,
  "llm_provider": "gemini",
  "llm_model": "gemini-1.5-flash",
  "skill_synonyms_count": 120
}
```

---

## View API Documentation

Open browser: `http://localhost:8000/docs`

You'll see:
- Interactive Swagger UI
- All endpoints documented
- Test requests directly from browser

---

## Performance Testing

### Test Rule-Based Speed (100 candidates)
```python
import requests
import time

start = time.time()
for i in range(100):
    response = requests.post(
        "http://localhost:8000/api/score/match?scoring_mode=rule_based",
        json={
            "resume_text": f"Developer {i} with Python, Django, 5 years",
            "job_description": "Python developer needed",
            "required_skills": ["python"]
        }
    )

elapsed = time.time() - start
print(f"100 candidates: {elapsed:.2f}s ({100/elapsed:.0f} candidates/sec)")
# Expected: ~5 seconds (20 candidates/sec)
```

### Test Cost Estimation
```python
response = requests.post(
    "http://localhost:8000/api/score/match?scoring_mode=hybrid",
    json={
        "resume_text": "High-scoring candidate...",
        "job_description": "...",
        "required_skills": ["python", "django"]
    }
)

cost = response.json()['metadata']['api_cost']
print(f"Cost for this candidate: ${cost:.6f}")
# For 1000 candidates: ${cost * 1000:.2f}
```

---

## Switching Modes

### Switch to Hybrid Mode

Edit `.env`:
```bash
SCORING_MODE=hybrid
HYBRID_LLM_THRESHOLD=70.0
GEMINI_API_KEY=your-actual-key-here
```

Restart server:
```bash
# Ctrl+C to stop
python -m uvicorn app.main:app --reload --port 8000
```

Test hybrid:
```bash
curl -X POST "http://localhost:8000/api/score/match" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_text": "Excellent candidate with all required skills...",
    "job_description": "...",
    "required_skills": ["python", "django"]
  }'
```

Check metadata:
```json
{
  "metadata": {
    "scoring_method": "hybrid",
    "llm_enhanced": true,
    "api_cost": 0.000075
  }
}
```

---

## Common Issues

### Issue: Slow LLM responses
**Solution:** Use rule-based mode or increase threshold
```bash
SCORING_MODE=hybrid
HYBRID_LLM_THRESHOLD=80.0  # Only top 15% get LLM
```

### Issue: High API costs
**Solution:** Switch to rule-based or higher threshold
```bash
SCORING_MODE=rule_based  # $0 forever
```

### Issue: Skills not matching
**Solution:** Add synonyms to `rule_based_scoring.py`
```python
"newskill": {"newskill", "new skill", "new-skill", "ns"}
```

---

## Next Steps

1. **Integrate with Backend:**
   - Update backend to call `http://localhost:8000/api/score/match`
   - Pass job requirements from database
   - Store scores and explanations

2. **Tune for Your Needs:**
   - Start with `rule_based` for testing
   - Move to `hybrid` at 70% for production
   - Adjust threshold based on API budget

3. **Monitor Costs:**
   - Track `api_cost` in responses
   - Calculate monthly estimates
   - Adjust threshold to optimize

4. **Add Custom Skills:**
   - Edit skill synonyms dictionary
   - Add industry-specific terms
   - Test with real resumes

---

## Example: Full Integration

```javascript
// Backend (Node.js)
async function scoreCandidate(resumeText, jobData) {
  const response = await fetch('http://localhost:8000/api/score/match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resume_text: resumeText,
      job_description: jobData.description,
      required_skills: jobData.required_skills,
      required_experience_years: jobData.min_experience,
      required_education: jobData.education_level,
      include_explanation: true
    })
  });
  
  const result = await response.json();
  
  return {
    score: result.match.score.overall_score,
    breakdown: result.match.score,
    explanation: result.match.explanation,
    cost: result.metadata.api_cost,
    method: result.metadata.scoring_method
  };
}
```

---

## Success! 🎉

Your hybrid scoring system is now running:
- ✅ Rule-based scoring (free, fast)
- ✅ Optional LLM enhancement (accurate)
- ✅ Batch processing support
- ✅ Cost tracking built-in

**Questions?** Check `HYBRID_SCORING.md` for detailed documentation.
