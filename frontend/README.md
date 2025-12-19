# AI Resume Screener - Frontend

## Overview
React-based web interface for recruiters to manage job postings, screen resumes, and generate interview kits.

## Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React

## Architecture Role
This is the **Presentation Layer**:
- User authentication UI
- Recruiter dashboards
- Job and resume management interfaces
- AI insights visualization
- Interview kit displays

## Project Structure
```
frontend/
├── public/           # Static assets
├── src/
│   ├── components/   # Reusable UI components
│   ├── pages/        # Route-level page components
│   ├── contexts/     # React Context providers
│   ├── services/     # API client services
│   ├── hooks/        # Custom React hooks
│   ├── utils/        # Helper functions
│   ├── styles/       # Global styles
│   ├── App.jsx       # Root component
│   └── main.jsx      # Application entry
├── index.html
├── vite.config.js
└── tailwind.config.js
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with backend API URL
```

### 3. Run Development Server
```bash
npm run dev
```
Open http://localhost:5173

### 4. Build for Production
```bash
npm run build
```

### 5. Preview Production Build
```bash
npm run preview
```

## Key Features

### Authentication
- Login/Registration forms
- JWT token management
- Protected routes
- Session persistence

### Dashboard
- Job listing overview
- Candidate rankings
- Usage statistics
- Quick actions

### Job Management
- Create/edit job descriptions
- Track job status
- View applicants

### Resume Screening
- Upload resumes (drag-drop)
- View parsed data
- AI match scores
- Skill overlap visualization

### Interview Preparation
- Generate interview kits
- View technical questions
- Review behavioral questions
- Export interview guides

## Styling Guidelines
- Use Tailwind utility classes
- Follow mobile-first approach
- Maintain consistent spacing (4px/8px/16px grid)
- Use semantic color names from theme

## State Management
- **Authentication**: Context API
- **API Data**: React Query (future)
- **Local State**: useState/useReducer

## Deployment
- **Phase-1**: Vercel
- **Phase-3**: AWS CloudFront + S3

## Environment Variables
See `.env.example` for configuration.

## License
MIT
