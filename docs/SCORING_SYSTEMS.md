# Scoring Systems Documentation

## Overview
This application uses **TWO SEPARATE** scoring systems that serve different purposes. Understanding the difference is crucial to avoid confusion.

---

## 1. ATS Score (Resume Quality Score)

### Purpose
Measures the **quality and completeness** of a resume document itself, regardless of any job position.

### When It's Calculated
- **Automatically** when a resume is uploaded and parsed
- **No job comparison needed**
- Happens during `parseResumeAsync()` in `resumeService.js`

### What It Measures (0-100%)
| Component | Weight | What It Checks |
|-----------|--------|----------------|
| **Format Score** | 20% | Contact info completeness (email, phone, name), document sections |
| **Keyword/Skills Score** | 30% | Number of skills listed (technical, soft, tools) |
| **Experience Score** | 25% | Years of experience, number of jobs listed |
| **Education Score** | 15% | Educational qualifications present |
| **Skills Diversity** | 10% | Variety of skill types (technical, soft, tools, certifications) |

### Use Cases
- ✅ **Resume ranking** - Sort all resumes by quality
- ✅ **Quality filtering** - Show only well-formatted resumes
- ✅ **Initial screening** - Identify incomplete/poor resumes
- ✅ **Resume database** - General talent pool assessment

### Where It's Stored
- `Resume.atsScore` - Overall score (0-100)
- `Resume.atsDetails` - Breakdown by component

### Where It's Calculated
- **File**: `backend/services/resumeService.js`
- **Method**: `calculateATSScore()`
- **Trigger**: After resume parsing completes

---

## 2. Match Score (Job Fit Score)

### Purpose
Measures how well a **specific resume matches a specific job's requirements**.

### When It's Calculated
- **On demand** when comparing a resume to a job
- **Requires both**: resume + job description
- Happens through AI Service API call to `/api/score/match`

### What It Measures (0-100%)
| Component | What It Checks |
|-----------|----------------|
| **Skills Match** | Resume skills vs. required job skills |
| **Experience Match** | Work experience relevance to job requirements |
| **Education Match** | Educational requirements vs. candidate qualifications |
| **Overall Fit** | Holistic candidate-to-job compatibility |

### Scoring Modes (AI Service Configuration)

#### Rule-Based (Fast, Free)
- Uses deterministic algorithms
- Keyword matching, skill overlap calculation
- No API costs
- Best for: High-volume screening

#### Hybrid (Balanced)
- Rule-based for scores < 70%
- LLM enhancement for scores ≥ 70%
- Moderate API usage
- Best for: Most use cases

#### LLM-Only (Accurate, Slow)
- Full AI analysis using Gemini/OpenAI
- Contextual understanding
- Higher API costs
- Best for: Final candidate assessment

### Use Cases
- ✅ **Job-specific ranking** - Best candidates for a position
- ✅ **Candidate shortlisting** - Top matches for interviews
- ✅ **Job matching** - Which jobs fit a candidate
- ✅ **Hiring decisions** - Detailed compatibility analysis

### Where It's Stored
- `Resume.matchScore` - Overall match score (0-100)
- `Resume.matchDetails` - Breakdown (skills, experience, education)
- `Match` collection - Detailed match records with explanations

### Where It's Calculated
- **Frontend**: Match calculation triggered by user action
- **Backend**: `backend/services/aiServiceClient.js` → `calculateMatchScore()`
- **AI Service**: `ai-service/app/services/hybrid_scoring.py` (rule-based/hybrid/LLM)

---

## Key Differences

| Aspect | ATS Score | Match Score |
|--------|-----------|-------------|
| **What** | Resume quality | Job fit |
| **When** | On upload (automatic) | On comparison (on-demand) |
| **Input** | Resume only | Resume + Job |
| **Speed** | Instant | Varies by mode |
| **Cost** | Free | Depends on mode |
| **Changes** | Only if resume re-parsed | Recalculated per job |
| **Use** | General screening | Specific position |

---

## Visual Flow

```
UPLOAD RESUME
    ↓
Parse Resume (AI Service)
    ↓
Calculate ATS Score (Backend) ← AUTOMATIC
    ↓
Store in Database
    ↓
Resume ready for viewing/searching


USER SELECTS JOB + RESUME
    ↓
Calculate Match Score (AI Service) ← ON DEMAND
    ↓
Apply Scoring Mode:
    - Rule-based: Quick keyword analysis
    - Hybrid: Rule-based + LLM enhancement
    - LLM-only: Full AI analysis
    ↓
Store Match Result
    ↓
Show compatibility & recommendations
```

---

## Configuration

### ATS Score
- **Location**: `backend/services/resumeService.js`
- **Configuration**: Hard-coded weights (can be customized)
- **No API calls required**

### Match Score
- **Location**: `ai-service/.env`
- **Configuration**:
  ```env
  SCORING_MODE=hybrid              # rule_based | hybrid | llm_only
  HYBRID_LLM_THRESHOLD=70.0        # When to use LLM in hybrid mode
  LLM_PROVIDER=gemini              # gemini | openai
  ```

---

## Best Practices

### Use ATS Score When:
- Building a resume database
- Filtering out low-quality submissions
- Ranking resumes without a specific job
- Showing "resume health" to candidates

### Use Match Score When:
- Comparing candidates for a specific role
- Creating shortlists for interviews
- Generating personalized recommendations
- Making hiring decisions

### Don't Mix Them:
- ❌ Don't use ATS score to rank candidates for a job
- ❌ Don't recalculate match score on every resume upload
- ❌ Don't compare ATS and Match scores directly
- ✅ Use both together: Filter by ATS (quality), then rank by Match (fit)

---

## Future Enhancements

### ATS Score
- [ ] Customizable weights per tenant
- [ ] Industry-specific scoring profiles
- [ ] Resume improvement suggestions
- [ ] Historical score tracking

### Match Score
- [ ] Multi-job batch matching
- [ ] Custom scoring criteria per job
- [ ] Explainability dashboard
- [ ] A/B testing different scoring modes

---

## Troubleshooting

### "My resume has high ATS score but low match score"
- **Normal!** Resume is well-formatted but doesn't match the job requirements
- **Action**: Check skill alignment and experience relevance

### "My resume has low ATS score but high match score"
- **Rare but possible**: Resume is poorly formatted but has perfect skills
- **Action**: Improve resume formatting and completeness

### "Both scores are low"
- **Problem**: Resume is both poor quality and bad fit
- **Action**: Candidate likely not suitable for this role

### "Both scores are high"
- **Perfect!**: Well-formatted resume that matches job perfectly
- **Action**: Move to interview stage

---

## API Endpoints

### ATS Score (Automatic)
- No direct endpoint - calculated during resume parsing
- Access via: `GET /api/resumes/:id` → `resume.atsScore`

### Match Score (On-Demand)
- Direct: `POST /api/matches/score`
- Via AI Service: `POST http://localhost:8000/api/score/match`
- Batch: `POST /api/jobs/:jobId/match-resumes`
