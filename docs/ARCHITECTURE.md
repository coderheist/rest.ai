# System Architecture Documentation
# AI Resume Screening & Interview Assistant

## 1. Architecture Overview

### 1.1 High-Level Architecture
```
┌────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                      │
│                                                             │
│   React Frontend (Vite) - Port 5173                        │
│   - Recruiter Dashboards                                   │
│   - Job & Resume Management                                │
│   - Analytics & Reporting                                  │
└─────────────────────────┬──────────────────────────────────┘
                          │ HTTPS/REST
                          ↓
┌────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                     │
│                                                             │
│   Node.js API Gateway (Express) - Port 5000                │
│   - Authentication & Authorization (JWT)                   │
│   - Multi-tenant Management                                │
│   - Business Rules & Validation                            │
│   - Usage Tracking & Limits                                │
│   - Orchestration                                          │
└─────────────────────────┬──────────────────────────────────┘
                          │ HTTP/REST
                          ↓
┌────────────────────────────────────────────────────────────┐
│                      AI/ML SERVICE LAYER                    │
│                                                             │
│   Python FastAPI Service - Port 8000                       │
│   - Resume Parsing (PDF/DOCX)                              │
│   - Embedding Generation (Sentence Transformers)           │
│   - Semantic Search (FAISS/ChromaDB)                       │
│   - AI Scoring & Explainability                            │
│   - Interview Generation (LLM)                             │
└─────────────────────────┬──────────────────────────────────┘
                          │
                          ↓
┌────────────────────────────────────────────────────────────┐
│                       DATA LAYER                            │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │   MongoDB        │  │  Vector Store    │               │
│  │   (Atlas)        │  │  (FAISS/Chroma)  │               │
│  │                  │  │                  │               │
│  │  - Users         │  │  - Embeddings    │               │
│  │  - Tenants       │  │  - Similarity    │               │
│  │  - Jobs          │  │    Search        │               │
│  │  - Resumes       │  │                  │               │
│  │  - Scores        │  │                  │               │
│  └──────────────────┘  └──────────────────┘               │
└────────────────────────────────────────────────────────────┘
```

## 2. Design Principles

### 2.1 Separation of Concerns
- **Frontend**: Pure presentation, no business logic
- **Backend**: Business rules, orchestration, no AI logic
- **AI Service**: Pure AI/ML operations, no business rules
- **Data**: Persistent storage, no computation

### 2.2 Loose Coupling
- Services communicate via REST APIs
- No direct database access between services
- Event-driven where needed (future: message queue)

### 2.3 Multi-Tenancy
- Every request scoped by `tenantId`
- Database-level isolation
- Shared infrastructure, isolated data

### 2.4 Cost-Aware AI
- LLM calls isolated and tracked
- Caching at multiple levels
- Rate limiting enforced
- Free models prioritized (Gemini)

## 3. Component Details

### 3.1 Frontend (React + Vite)

**Responsibilities:**
- User interface rendering
- Client-side routing
- Form validation
- State management (Context API)
- API client calls

**Technology:**
- React 18 (hooks, functional components)
- Vite (fast build tool)
- Tailwind CSS (styling)
- React Router v6 (routing)
- Axios (HTTP client)
- Recharts (analytics charts)

**Key Features:**
- Responsive design (mobile-first)
- Protected routes
- Token management
- Error boundaries
- Loading states

### 3.2 Backend API Gateway (Node.js + Express)

**Responsibilities:**
- RESTful API endpoints
- JWT authentication
- Multi-tenant context injection
- Request validation (Zod)
- Rate limiting
- Business logic execution
- AI service orchestration
- Usage tracking

**Technology:**
- Node.js 18+ (ESM modules)
- Express.js (REST framework)
- Mongoose (MongoDB ODM)
- JWT + bcrypt (auth)
- Winston (logging)
- Helmet (security)

**Middleware Stack:**
```
Request
  ↓
CORS
  ↓
Helmet (Security Headers)
  ↓
Rate Limiter
  ↓
Body Parser
  ↓
JWT Validation
  ↓
Tenant Context Injection
  ↓
Plan Limit Check
  ↓
Request Handler
  ↓
Error Handler
  ↓
Response
```

### 3.3 AI Service (Python + FastAPI)

**Responsibilities:**
- Resume text extraction
- NLP processing
- Embedding generation
- Vector storage & search
- Similarity calculation
- LLM integration
- Interview question generation

**Technology:**
- FastAPI (async REST framework)
- Sentence Transformers (embeddings)
- FAISS/ChromaDB (vector DB)
- pdfplumber/PyMuPDF (PDF parsing)
- python-docx (DOCX parsing)
- spaCy (NLP)
- Gemini/OpenAI (LLM)

**AI Pipeline:**
```
Resume Upload
  ↓
Text Extraction (PDF/DOCX)
  ↓
Text Cleaning & Normalization
  ↓
Skill Extraction (spaCy/regex)
  ↓
Embedding Generation (384-dim vector)
  ↓
Vector Storage (FAISS)
  ↓
Similarity Search (cosine similarity)
  ↓
Scoring & Ranking
  ↓
Explainability Generation
```

### 3.4 Data Layer

**MongoDB Schema:**
```
tenants
├── _id
├── name
├── plan (FREE, PRO, BUSINESS, ENTERPRISE)
└── limits

users
├── _id
├── tenantId (indexed)
├── email (unique)
├── passwordHash
└── role

jobs
├── _id
├── tenantId (indexed)
├── title
├── requiredSkills[]
├── embeddingId
└── status

resumes
├── _id
├── tenantId (indexed)
├── jobId (indexed)
├── candidateName
├── filePath
├── embeddingId
└── metadata

match_scores
├── _id
├── tenantId (indexed)
├── jobId (indexed)
├── resumeId (indexed)
├── score
└── explanation

interview_kits
├── _id
├── tenantId (indexed)
├── jobId
├── resumeId
└── questions[]
```

**Indexes:**
- Compound: `{ tenantId: 1, createdAt: -1 }`
- Single: `tenantId`, `jobId`, `resumeId`
- Unique: `email` in users

**Vector Store (FAISS):**
- Index type: HNSW (Hierarchical Navigable Small World)
- Metric: Cosine similarity
- Dimensions: 384 (all-MiniLM-L6-v2)
- Persistence: Local files (Phase-1), S3 (Phase-3)

## 4. Data Flow Examples

### 4.1 Resume Upload & Matching Flow
```
1. User uploads resume (Frontend)
   ↓
2. POST /api/resumes/upload (Backend)
   ↓
3. Validate file & save temporarily (Backend)
   ↓
4. POST /ai-service/parse/pdf (AI Service)
   ↓
5. Extract text & metadata (AI Service)
   ↓
6. POST /ai-service/embeddings/generate (AI Service)
   ↓
7. Store vector in FAISS (AI Service)
   ↓
8. Return parsed data (AI Service → Backend)
   ↓
9. Save resume metadata in MongoDB (Backend)
   ↓
10. POST /ai-service/match (AI Service)
    ↓
11. Calculate similarity with job (AI Service)
    ↓
12. Return match score (AI Service → Backend)
    ↓
13. Save score in MongoDB (Backend)
    ↓
14. Increment usage counter (Backend)
    ↓
15. Return success to Frontend
```

### 4.2 Interview Kit Generation Flow
```
1. User clicks "Generate Interview Kit" (Frontend)
   ↓
2. POST /api/interviews/generate (Backend)
   ↓
3. Check usage limits (Backend)
   ↓
4. POST /ai-service/interviews/generate (AI Service)
   ↓
5. Fetch job & resume details (AI Service → Backend)
   ↓
6. Construct LLM prompt (AI Service)
   ↓
7. Call Gemini API (AI Service → Gemini)
   ↓
8. Parse LLM response (AI Service)
   ↓
9. Return questions (AI Service → Backend)
   ↓
10. Save kit in MongoDB (Backend)
    ↓
11. Increment LLM usage (Backend)
    ↓
12. Return kit to Frontend
```

## 5. Security Architecture

### 5.1 Authentication Flow
```
1. User submits credentials
   ↓
2. Backend validates credentials
   ↓
3. Generate JWT with payload:
   {
     userId: "...",
     tenantId: "...",
     role: "RECRUITER",
     iat: timestamp,
     exp: timestamp + 7d
   }
   ↓
4. Return JWT to client
   ↓
5. Client stores in localStorage
   ↓
6. All subsequent requests include:
   Authorization: Bearer {jwt}
   ↓
7. Backend validates & decodes JWT
   ↓
8. Inject tenantId into request context
```

### 5.2 Multi-Tenant Isolation
```
Every MongoDB query MUST include tenantId:

❌ BAD:
Job.find({ status: 'OPEN' })

✅ GOOD:
Job.find({ tenantId: req.user.tenantId, status: 'OPEN' })
```

### 5.3 Security Layers
1. **Transport**: HTTPS only in production
2. **Headers**: Helmet.js (CSP, HSTS, etc.)
3. **Auth**: JWT with strong secret (32+ chars)
4. **Passwords**: bcrypt with 12 rounds
5. **Rate Limiting**: 100 req/15min per IP
6. **Input Validation**: Zod schemas
7. **File Upload**: Type & size validation
8. **CORS**: Whitelist frontend domain

## 6. Scalability Strategy

### 6.1 Horizontal Scaling
- **Stateless APIs**: No session state in servers
- **Load Balancing**: Round-robin distribution
- **Database**: MongoDB replica sets
- **Caching**: Redis (future)

### 6.2 Performance Optimization
- **Database Indexes**: All tenant queries indexed
- **Connection Pooling**: Max 10 connections
- **Batch Processing**: Bulk embedding generation
- **Caching**: Vector embeddings, LLM responses
- **Async Operations**: FastAPI async handlers

### 6.3 Cost Optimization
- **Free Tier LLM**: Gemini preferred
- **Caching**: Reduce duplicate AI calls
- **Rate Limiting**: Prevent abuse
- **Usage Tracking**: Monitor & alert

## 7. Deployment Architecture

### Phase-1 (Free Tier)
```
Frontend → Vercel (CDN + SSR)
Backend → Render/Railway (container)
AI Service → Render (container)
Database → MongoDB Atlas (free tier)
Vector Store → Local files (persistent volume)
```

### Phase-3 (AWS Enterprise)
```
Frontend → CloudFront + S3
Backend → ECS/Fargate + ALB
AI Service → ECS/Fargate (GPU optional)
Database → Aurora Serverless
Vector Store → S3 + EFS
Auth → Cognito
Security → WAF + Shield
Monitoring → CloudWatch + X-Ray
```

## 8. Monitoring & Observability

### 8.1 Logging
- **Backend**: Winston (JSON format)
- **AI Service**: Python logging
- **Levels**: ERROR, WARN, INFO, DEBUG

### 8.2 Metrics (Future)
- API response times
- AI processing times
- LLM usage & cost
- Error rates
- Active users

### 8.3 Health Checks
- `GET /health` on all services
- Database connectivity
- AI model loaded status

## 9. Future Enhancements

### 9.1 Phase-2 Additions
- Redis caching layer
- Message queue (RabbitMQ/SQS)
- Webhook system
- Email notifications

### 9.2 Phase-3 Additions
- Kubernetes orchestration
- Auto-scaling policies
- Multi-region deployment
- CDN for file delivery
- Real-time collaboration (WebSocket)

## 10. Technology Decisions Rationale

| Decision | Rationale |
|----------|-----------|
| React | Industry standard, large ecosystem |
| Node.js | JavaScript everywhere, async I/O |
| Python/FastAPI | Best AI/ML ecosystem, async |
| MongoDB | Flexible schema, multi-tenant ready |
| FAISS | Fast, lightweight, no server needed |
| JWT | Stateless, scalable |
| Vite | 10x faster than CRA |
| Gemini | Free tier, good quality |
| Vercel | Zero-config React deployment |

---

**Architecture Status**: Stable ✅  
**Last Updated**: December 19, 2025  
**Version**: 1.0.0
