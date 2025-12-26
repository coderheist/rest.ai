# START AI SERVICE - Quick Guide

## The Problem
Your backend is trying to connect to the AI service at `http://localhost:8000`, but the AI service is not running.

## Quick Fix (2 steps)

### Step 1: Open a NEW PowerShell Terminal
```powershell
# Navigate to AI service directory
cd "C:\Users\DELL\OneDrive\Desktop\AI-RESUME SCREENER\ai-service"
```

### Step 2: Run the Start Script
```powershell
# Windows - Use the batch file
.\start.bat

# This will:
# 1. Create virtual environment (if needed)
# 2. Install dependencies
# 3. Start the AI service on port 8000
```

## OR Manual Start (if start.bat doesn't work)

```powershell
# 1. Create virtual environment
python -m venv venv

# 2. Activate it
.\venv\Scripts\Activate

# 3. Install dependencies
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# 4. Start the service
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Verify It's Running

Open browser: `http://localhost:8000/docs`

You should see the FastAPI Swagger documentation.

## Once Running

Go back to your backend terminal and try uploading a resume again. It should work now!

---

## Current Configuration

Your AI service is configured with:
- **Mode:** `hybrid` (rule-based + LLM for top candidates)
- **Threshold:** 70% (candidates scoring >=70% get LLM enhancement)
- **Cost:** ~$0.75-1.50 per 1000 candidates

To use FREE mode (no API key needed):
```bash
# Edit ai-service/.env
SCORING_MODE=rule_based
```

Then restart the AI service.
