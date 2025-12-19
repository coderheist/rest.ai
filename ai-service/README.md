# AI Resume Screener - AI Service

## Overview
Python FastAPI service handling all AI/ML operations including resume parsing, embeddings, semantic search, and interview question generation.

## Tech Stack
- **Framework**: FastAPI
- **NLP**: Sentence Transformers, spaCy
- **LLM**: Gemini API / OpenAI
- **Vector DB**: FAISS / ChromaDB
- **PDF Parsing**: pdfplumber, PyMuPDF
- **DOCX Parsing**: python-docx

## Architecture Role
This is the **AI/ML Service Layer**:
- Isolated AI operations (cost control)
- Resume text extraction & parsing
- Embedding generation
- Semantic similarity search
- AI-powered scoring
- Interview question generation
- Skill extraction

## Project Structure
```
ai-service/
├── app/
│   ├── api/          # FastAPI routers/endpoints
│   ├── services/     # Core AI logic
│   ├── models/       # Pydantic models
│   ├── utils/        # Helper functions
│   ├── config.py     # Configuration
│   └── main.py       # FastAPI application
├── temp/             # Temporary file storage
├── vector_store/     # FAISS/Chroma data
├── requirements.txt
└── README.md
```

## Setup Instructions

### 1. Create Virtual Environment
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm
```

### 3. Configure Environment
```bash
cp .env.example .env
# Add your API keys (Gemini/OpenAI)
```

### 4. Run Development Server
```bash
uvicorn app.main:app --reload --port 8000
```

### 5. View API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Resume Parsing
- `POST /api/parse/pdf` - Extract text from PDF resume
- `POST /api/parse/docx` - Extract text from DOCX resume
- `POST /api/parse/extract-skills` - Extract skills from text
- `POST /api/parse/extract-experience` - Extract experience details

### Embeddings
- `POST /api/embeddings/generate` - Generate embedding for text
- `POST /api/embeddings/batch` - Generate embeddings for multiple texts
- `GET /api/embeddings/models` - List available embedding models

### Semantic Search
- `POST /api/search/similarity` - Find similar resumes to job
- `POST /api/search/rank-candidates` - Rank candidates by match
- `GET /api/search/vector-stats` - Get vector store statistics

### Scoring
- `POST /api/score/match` - Calculate match score
- `POST /api/score/explain` - Generate match explanation
- `POST /api/score/skill-overlap` - Analyze skill overlap

### Interview Generation
- `POST /api/interview/generate` - Generate interview kit
- `POST /api/interview/technical` - Generate technical questions
- `POST /api/interview/behavioral` - Generate behavioral questions

### Health & Monitoring
- `GET /health` - Health check
- `GET /metrics` - Service metrics

## AI Models Used

### Embedding Model
- **Default**: sentence-transformers/all-MiniLM-L6-v2
- **Size**: 80MB
- **Dimensions**: 384
- **Speed**: Fast
- **Quality**: Good for semantic search

### LLM Options
1. **Gemini 1.5 Pro** (Recommended for free tier)
   - Free quota: Generous
   - Quality: Excellent
   - Cost: $0/month for moderate usage

2. **OpenAI GPT-4 Turbo**
   - Quality: Premium
   - Cost: Pay-per-token

## Environment Variables
See `.env.example` for all configuration options.

## Caching Strategy
- Embeddings cached (reuse for same text)
- LLM responses cached (reduce cost)
- Vector indexes persisted to disk

## Performance Optimization
- Batch embedding generation
- Async file processing
- Vector index caching
- Rate limiting on LLM calls

## Deployment
- **Phase-1**: Render/Railway
- **Phase-3**: AWS ECS with GPU (optional)

## Cost Control
- LLM calls tracked per tenant
- Rate limiting enforced
- Caching reduces API calls
- Free tier prioritized

## License
MIT
