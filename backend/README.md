# AI Resume Screener - Backend API Gateway

## Overview
Node.js/Express API Gateway handling authentication, business logic, and orchestration between frontend and AI services.

## Tech Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Logging**: Winston

## Architecture Role
This service acts as the **Business Logic Layer** and **API Gateway**:
- Handles all authentication & authorization
- Manages multi-tenant data isolation
- Enforces plan limits & usage tracking
- Orchestrates AI service calls
- Implements rate limiting & security

## Project Structure
```
backend/
├── config/          # Database, logger, environment config
├── models/          # MongoDB/Mongoose schemas
├── routes/          # API endpoint definitions
├── controllers/     # Request handlers
├── middleware/      # Auth, validation, error handling
├── services/        # Business logic layer
├── utils/           # Helper functions
├── uploads/         # Temporary file storage
└── server.js        # Application entry point
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start MongoDB
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (update MONGODB_URI in .env)
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Run Production Server
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user/tenant
- `POST /api/auth/login` - Login and get JWT
- `GET /api/auth/me` - Get current user

### Jobs
- `POST /api/jobs` - Create job description
- `GET /api/jobs` - List all jobs for tenant
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Resumes
- `POST /api/resumes/upload` - Upload resume for job
- `GET /api/resumes` - List resumes for job
- `GET /api/resumes/:id` - Get resume details
- `DELETE /api/resumes/:id` - Delete resume

### Matching & Scoring
- `GET /api/match/:jobId` - Get ranked candidates for job
- `GET /api/scores/:resumeId` - Get detailed match score

### Interview Kits
- `POST /api/interviews/generate` - Generate interview kit
- `GET /api/interviews/:id` - Get interview kit

### Usage & Analytics
- `GET /api/usage` - Get current usage stats
- `GET /api/analytics/dashboard` - Get dashboard data

## Environment Variables
See `.env.example` for all configuration options.

## Security Features
- JWT-based authentication
- Password hashing with bcrypt (12 rounds)
- Helmet.js security headers
- Rate limiting per IP
- Input validation with Zod
- Multi-tenant data isolation
- CORS protection

## Error Handling
All errors follow standard format:
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

## Deployment
- **Phase-1**: Render/Railway
- **Phase-3**: AWS ECS/Fargate

## License
MIT
