# AI Service - Complete Setup and Usage Guide

## 🎯 Overview
The AI Service is a FastAPI-based microservice that handles all AI/ML operations for the Resume Screener platform, including:
- Resume parsing (PDF/DOCX)
- Text embedding generation
- Semantic search
- Candidate-job matching
- Interview question generation

## 📋 Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Gemini API key or OpenAI API key

## 🚀 Quick Start

### 1. Setup Virtual Environment
```bash
cd ai-service

# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt

# Download spaCy language model
python -m spacy download en_core_web_sm
```

### 3. Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your API key
# For Gemini (Free tier available):
GEMINI_API_KEY=your_actual_gemini_api_key

# OR for OpenAI:
OPENAI_API_KEY=your_actual_openai_api_key
LLM_PROVIDER=openai
```

### 4. Run the Service
```bash
# Development mode (with auto-reload)
uvicorn app.main:app --reload --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 5. Verify Installation
```bash
# Check health endpoint
curl http://localhost:8000/health

# View API documentation
# Open browser: http://localhost:8000/docs
```

## 📚 API Documentation

### Base URL
```
http://localhost:8000
```

### Available Endpoints

#### 1. Resume Parsing

**Parse PDF Resume**
```bash
POST /api/parse/pdf
Content-Type: multipart/form-data

curl -X POST "http://localhost:8000/api/parse/pdf" \
  -F "file=@resume.pdf"
```

**Parse DOCX Resume**
```bash
POST /api/parse/docx
Content-Type: multipart/form-data

curl -X POST "http://localhost:8000/api/parse/docx" \
  -F "file=@resume.docx"
```

**Extract Skills from Text**
```bash
POST /api/parse/extract-skills
Content-Type: application/json

{
  "text": "Experienced Python developer with React and AWS skills..."
}
```

#### 2. Embeddings

**Generate Single Embedding**
```bash
POST /api/embeddings/generate
Content-Type: application/json

{
  "text": "Software engineer with 5 years experience in Python"
}
```

**Generate Batch Embeddings**
```bash
POST /api/embeddings/batch
Content-Type: application/json

{
  "texts": [
    "Resume text 1...",
    "Resume text 2...",
    "Resume text 3..."
  ]
}
```

#### 3. Search & Ranking

**Rank Candidates**
```bash
POST /api/search/rank-candidates
Content-Type: application/json

{
  "job_description": "Looking for senior Python developer...",
  "job_id": "job_123",
  "resumes": [
    {"id": "resume_1", "text": "Resume text 1..."},
    {"id": "resume_2", "text": "Resume text 2..."}
  ],
  "top_n": 10
}
```

**Add Resume to Search Index**
```bash
POST /api/search/add-resume
Content-Type: application/json

{
  "resume_id": "resume_123",
  "resume_text": "Complete resume text..."
}
```

#### 4. Scoring

**Calculate Match Score**
```bash
POST /api/score/match
Content-Type: application/json

{
  "resume_text": "Software engineer with Python...",
  "job_description": "Looking for Python developer...",
  "resume_id": "resume_123",
  "job_id": "job_456",
  "include_explanation": true
}
```

**Analyze Skill Overlap**
```bash
POST /api/score/skill-overlap
Content-Type: application/json

{
  "resume_skills": ["Python", "JavaScript", "React"],
  "job_skills": ["Python", "Django", "PostgreSQL"]
}
```

#### 5. Interview Generation

**Generate Interview Kit**
```bash
POST /api/interview/generate
Content-Type: application/json

{
  "job_description": "Senior Python Developer...",
  "resume_text": "Candidate resume text...",
  "job_title": "Senior Python Developer",
  "candidate_name": "John Doe",
  "num_questions": 10,
  "focus_areas": ["technical", "leadership"]
}
```

## 🔧 Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ENVIRONMENT` | development | Environment (development/production) |
| `DEBUG` | true | Enable debug mode |
| `HOST` | 0.0.0.0 | Server host |
| `PORT` | 8000 | Server port |
| `GEMINI_API_KEY` | - | Gemini API key (required if using Gemini) |
| `OPENAI_API_KEY` | - | OpenAI API key (required if using OpenAI) |
| `LLM_PROVIDER` | gemini | LLM provider (gemini/openai) |
| `EMBEDDING_MODEL` | all-MiniLM-L6-v2 | Sentence transformer model |
| `MAX_FILE_SIZE` | 10485760 | Max file size (10MB) |
| `MAX_TEXT_LENGTH` | 50000 | Max text length for processing |
| `LOG_LEVEL` | INFO | Logging level |

## 🏗️ Architecture

```
ai-service/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration management
│   ├── api/                 # API route handlers
│   │   ├── parsing.py       # Resume parsing endpoints
│   │   ├── embeddings.py    # Embedding generation endpoints
│   │   ├── search.py        # Search and ranking endpoints
│   │   ├── scoring.py       # Match scoring endpoints
│   │   └── interview.py     # Interview kit endpoints
│   ├── services/            # Business logic
│   │   ├── parsing_service.py
│   │   ├── embedding_service.py
│   │   ├── search_service.py
│   │   ├── scoring_service.py
│   │   └── interview_service.py
│   ├── models/              # Pydantic models
│   │   ├── common.py
│   │   ├── resume.py
│   │   ├── job.py
│   │   ├── match.py
│   │   └── interview.py
│   └── utils/               # Utility functions
│       ├── file_utils.py
│       ├── text_utils.py
│       └── logger.py
├── temp/                    # Temporary file storage
├── vector_store/            # FAISS index storage
├── requirements.txt
└── .env
```

## 🧪 Testing

### Manual Testing with cURL

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test skill extraction
curl -X POST "http://localhost:8000/api/parse/extract-skills" \
  -H "Content-Type: application/json" \
  -d '{"text": "Python developer with React and AWS experience"}'

# Test embedding generation
curl -X POST "http://localhost:8000/api/embeddings/generate" \
  -H "Content-Type: application/json" \
  -d '{"text": "Software engineer"}'
```

### Interactive API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🔐 API Key Setup

### Getting a Gemini API Key (FREE)
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key to your `.env` file

### Getting an OpenAI API Key
1. Visit: https://platform.openai.com/api-keys
2. Sign in or create account
3. Click "Create new secret key"
4. Copy the key to your `.env` file

## 🚨 Troubleshooting

### Common Issues

**1. spaCy model not found**
```bash
python -m spacy download en_core_web_sm
```

**2. FAISS installation issues on Windows**
```bash
pip install faiss-cpu --no-cache-dir
```

**3. Sentence Transformers model download**
- First run will download model (~90MB)
- Subsequent runs will use cached model

**4. LLM API errors**
- Verify API key is correct in `.env`
- Check API key has sufficient quota
- Ensure `LLM_PROVIDER` matches your API key

## 📊 Performance

### Expected Response Times
- Resume parsing (PDF): 1-3 seconds
- Embedding generation: 0.1-0.5 seconds
- Candidate ranking (10 candidates): 2-5 seconds
- Interview kit generation: 10-20 seconds

### Resource Usage
- Memory: ~500MB-1GB (with models loaded)
- CPU: Moderate during embedding generation
- Disk: ~500MB for models and dependencies

## 🔄 Integration with Backend

The backend service should call AI service endpoints:

```javascript
// Example: Parse resume in backend
const response = await axios.post(
  'http://localhost:8000/api/parse/pdf',
  formData,
  { headers: { 'Content-Type': 'multipart/form-data' }}
);
```

## 📝 Next Steps

1. ✅ Install dependencies
2. ✅ Configure API keys
3. ✅ Start the service
4. ✅ Test endpoints
5. ✅ Integrate with backend
6. 🔄 Deploy to production

## 🎉 Success!

If you see this response, everything is working:
```json
{
  "status": "healthy",
  "service": "AI Resume Screener - AI Service",
  "version": "1.0.0"
}
```

Your AI Service is now ready to power the Resume Screener platform! 🚀
