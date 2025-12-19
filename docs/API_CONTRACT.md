# API Contract Specification
# AI Resume Screening & Interview Assistant

Base URL: `http://localhost:5000/api`

## Authentication Endpoints

### Register New User/Tenant
```
POST /api/auth/register
Content-Type: application/json

Request:
{
  "tenantName": "Acme Corp",
  "name": "John Doe",
  "email": "john@acme.com",
  "password": "SecurePass123"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "token": "jwt.token.here",
    "user": {
      "_id": "userId",
      "name": "John Doe",
      "email": "john@acme.com",
      "role": "ADMIN",
      "tenantId": "tenantId"
    },
    "tenant": {
      "_id": "tenantId",
      "name": "Acme Corp",
      "plan": "FREE"
    }
  }
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

Request:
{
  "email": "john@acme.com",
  "password": "SecurePass123"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "token": "jwt.token.here",
    "user": { ... }
  }
}
```

### Get Current User
```
GET /api/auth/me
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": { ... },
    "tenant": { ... }
  }
}
```

## Job Endpoints

### Create Job
```
POST /api/jobs
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "title": "Senior Full Stack Developer",
  "experienceMin": 3,
  "experienceMax": 7,
  "requiredSkills": ["React", "Node.js", "MongoDB", "AWS"],
  "description": "We are looking for..."
}

Response: 201 Created
{
  "success": true,
  "data": {
    "_id": "jobId",
    "title": "Senior Full Stack Developer",
    "status": "OPEN",
    "embeddingId": "embeddingId"
  }
}
```

### List Jobs
```
GET /api/jobs?page=1&limit=10&status=OPEN
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "jobs": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25
    }
  }
}
```

### Get Job Details
```
GET /api/jobs/:jobId
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "_id": "jobId",
    "title": "...",
    "candidateCount": 15,
    "topCandidates": [ ... ]
  }
}
```

### Update Job
```
PUT /api/jobs/:jobId
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "status": "CLOSED"
}

Response: 200 OK
{
  "success": true,
  "data": { ... }
}
```

## Resume Endpoints

### Upload Resume
```
POST /api/resumes/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

Request:
- file: (binary)
- jobId: "jobId"

Response: 201 Created
{
  "success": true,
  "data": {
    "_id": "resumeId",
    "candidateName": "Jane Smith",
    "email": "jane@example.com",
    "skills": ["Python", "Machine Learning"],
    "totalExperience": 5,
    "matchScore": 87.5
  }
}
```

### List Resumes for Job
```
GET /api/resumes?jobId=jobId&sortBy=matchScore&order=desc
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "resumes": [
      {
        "_id": "resumeId",
        "candidateName": "...",
        "matchScore": 92.5,
        "status": "NEW"
      }
    ]
  }
}
```

### Get Resume Details
```
GET /api/resumes/:resumeId
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "_id": "resumeId",
    "candidateName": "...",
    "parsedText": "...",
    "matchScore": { ... },
    "interviewKit": { ... }
  }
}
```

## Matching & Scoring Endpoints

### Get Ranked Candidates
```
GET /api/match/:jobId
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "candidates": [
      {
        "resumeId": "...",
        "candidateName": "...",
        "score": 92.5,
        "skillMatchPercent": 85,
        "experienceFit": 95,
        "explanation": "Strong match because..."
      }
    ]
  }
}
```

### Get Match Score Details
```
GET /api/scores/:resumeId
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "score": 87.5,
    "breakdown": {
      "skillMatch": 85,
      "experienceFit": 90,
      "educationMatch": 88
    },
    "skillOverlap": {
      "matched": ["React", "Node.js"],
      "missing": ["AWS", "Docker"]
    },
    "explanation": "..."
  }
}
```

## Interview Kit Endpoints

### Generate Interview Kit
```
POST /api/interviews/generate
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "jobId": "jobId",
  "resumeId": "resumeId"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "_id": "kitId",
    "questions": [
      {
        "type": "TECH",
        "question": "Explain React hooks lifecycle",
        "expectedAnswer": "...",
        "evaluationCriteria": "..."
      },
      {
        "type": "BEHAVIORAL",
        "question": "Tell me about a time...",
        "expectedAnswer": "...",
        "evaluationCriteria": "..."
      }
    ],
    "generatedAt": "2025-12-19T..."
  }
}
```

### Get Interview Kit
```
GET /api/interviews/:kitId
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": { ... }
}
```

## Usage & Analytics Endpoints

### Get Current Usage
```
GET /api/usage
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "resumesProcessed": 45,
    "resumeLimit": 50,
    "jobsCreated": 3,
    "jdLimit": 5,
    "aiUsage": 75,
    "aiUsageLimit": 100,
    "periodEnd": "2025-12-31T..."
  }
}
```

### Get Dashboard Analytics
```
GET /api/analytics/dashboard
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "totalJobs": 12,
    "totalCandidates": 145,
    "avgMatchScore": 72.5,
    "topSkills": ["React", "Python", "AWS"],
    "recentActivity": [ ... ]
  }
}
```

## Review Endpoints

### Submit Review
```
POST /api/reviews
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "jobId": "jobId",
  "resumeId": "resumeId",
  "rating": 4,
  "comment": "Strong technical background"
}

Response: 201 Created
{
  "success": true,
  "data": { ... }
}
```

### Get Reviews for Resume
```
GET /api/reviews?resumeId=resumeId
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "reviews": [ ... ],
    "avgRating": 4.2
  }
}
```

## Error Responses

All errors follow standard format:

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

Common status codes:
- 400: Bad Request (validation failed)
- 401: Unauthorized (invalid/missing token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 429: Too Many Requests (rate limit)
- 500: Internal Server Error

## Rate Limiting
- Default: 100 requests per 15 minutes per IP
- Applies to all endpoints
- Headers returned:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Pagination
For list endpoints:
- Query params: `page` (default: 1), `limit` (default: 10, max: 100)
- Response includes `pagination` object

## Authentication
All endpoints (except /auth/login and /auth/register) require:
```
Authorization: Bearer {jwt_token}
```

Token expires after 7 days (configurable).
