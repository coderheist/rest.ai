# AI Resume Screening & Interview Assistant

## 🎯 Project Overview
A production-grade SaaS platform that automates resume screening and interview preparation using AI/ML technologies.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│           Frontend (React + Vite)               │
│     ↓                                           │
│  Recruiter UI, Dashboards, Analytics            │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│      Backend API Gateway (Node.js + Express)    │
│     ↓                                           │
│  Auth, Multi-tenancy, Business Logic            │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│        AI Service (Python + FastAPI)            │
│     ↓                                           │
│  Resume Parsing, Embeddings, LLM, Scoring       │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│         Data Layer                              │
│  MongoDB + FAISS/ChromaDB                       │
└─────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
AI-RESUME SCREENER/
├── backend/              # Node.js API Gateway
│   ├── config/          # Database, logger config
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth, validation
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
│
├── frontend/            # React Web App
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route pages
│   │   ├── contexts/    # React Context
│   │   ├── services/    # API clients
│   │   ├── hooks/       # Custom hooks
│   │   └── utils/       # Helpers
│   └── index.html
│
├── ai-service/          # Python AI/ML Service
│   ├── app/
│   │   ├── api/         # FastAPI routers
│   │   ├── services/    # AI logic
│   │   ├── models/      # Pydantic models
│   │   ├── utils/       # Helpers
│   │   └── main.py      # Entry point
│   └── requirements.txt
│
└── docs/                # Documentation
    ├── API_CONTRACT.md
    ├── ARCHITECTURE.md
    └── DEPLOYMENT.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB 6.0+
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd "AI-RESUME SCREENER"
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 4. AI Service Setup
```bash
cd ai-service
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env
# Add your Gemini/OpenAI API key
uvicorn app.main:app --reload --port 8000
```

### 5. Database Setup
- Install MongoDB locally or use MongoDB Atlas
- Update `MONGODB_URI` in backend/.env

## 🎯 Core Features

### Phase-1 (Free Platform)
- ✅ Multi-tenant authentication
- ✅ Job description management
- ✅ Resume upload & parsing
- ✅ Semantic AI matching
- ✅ Candidate ranking
- ✅ AI-powered scoring
- ✅ Interview kit generation
- ✅ Recruiter dashboards
- ✅ Usage tracking

### Phase-2 (Premium)
- 🔄 Stripe billing integration
- 🔄 Advanced AI features
- 🔄 Unlimited usage
- 🔄 Team collaboration
- 🔄 Priority support

### Phase-3 (Enterprise)
- 🔄 AWS cloud deployment
- 🔄 SSO integration
- 🔄 Audit logging
- 🔄 Custom AI training
- 🔄 Dedicated infrastructure

## 🛠️ Technology Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Recharts (analytics)
- Axios

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Winston (logging)
- Helmet (security)

### AI Service
- Python FastAPI
- Sentence Transformers
- FAISS (vector search)
- Gemini/OpenAI API
- pdfplumber (parsing)
- spaCy (NLP)

## 📊 Development Phases

### Module 0: Foundation ✅ (COMPLETED)
- Project structure
- Configuration files
- Documentation

### Module 1: Authentication (2 weeks)
- User registration/login
- JWT implementation
- Multi-tenancy

### Module 2: Usage Tracking (1 week)
- Plan limits
- Usage counters
- Billing readiness

### Module 3: Job Management (1 week)
- CRUD operations
- Job dashboards

### Module 4: Resume Parsing (2 weeks)
- File upload
- PDF/DOCX extraction
- Metadata normalization

### Module 5: AI Matching (2 weeks)
- Embeddings generation
- Semantic search
- Candidate ranking

### Module 6: Scoring (1 week)
- Match calculation
- Explainability

### Module 7: Interview Generation (1 week)
- LLM integration
- Question generation

### Module 8: Dashboard UI (2 weeks)
- Recruiter interface
- Analytics charts

### Module 9-12: Polish & Deploy (2 weeks)
- Testing
- Security hardening
- Deployment

**Total Phase-1: ~12 weeks**

## 🔒 Security Features
- JWT-based authentication
- Password hashing (bcrypt)
- Rate limiting
- CORS protection
- Input validation
- Multi-tenant isolation
- Helmet.js security headers

## 📈 Scalability Design
- Stateless APIs
- Horizontal scaling ready
- Database indexing
- Caching strategy
- Async operations
- Microservices architecture

## 🌐 Deployment

### Phase-1 (Free)
- Frontend: Vercel
- Backend: Render/Railway
- AI Service: Render
- Database: MongoDB Atlas

### Phase-3 (Enterprise)
- Frontend: AWS CloudFront + S3
- Backend: AWS ECS/Fargate
- AI Service: AWS ECS (GPU)
- Database: AWS Aurora Serverless
- Storage: AWS S3

## 📝 License
MIT

## 👥 Contributing
This is a portfolio/commercial project. Contributions welcome after initial release.

## 📧 Contact
[Your contact information]

---

**Status**: Module 0 Complete ✅ | Ready for Module 1 Development
