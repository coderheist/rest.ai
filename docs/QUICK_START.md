# 🚀 Quick Start Guide - AI Resume Screener

## Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **Python** 3.10+ ([Download](https://python.org/))
- **MongoDB** 8.0+ ([Download](https://www.mongodb.com/try/download/community))
- **Gemini API Key** ([Get Free Key](https://makersuite.google.com/app/apikey))

---

## ⚡ 5-Minute Setup

### Step 1: Clone & Setup Environment

```bash
# Clone the repository
cd "AI-RESUME SCREENER"

# Create environment files
```

### Step 2: Configure Backend

```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ai-resume-screener
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_TIMEOUT=60000
EOF
```

### Step 3: Configure AI Service

```bash
cd ../ai-service
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# Create .env file
cat > .env << EOF
GEMINI_API_KEY=your_actual_gemini_api_key_here
LLM_PROVIDER=gemini
GEMINI_MODEL=gemini-1.5-flash
MONGODB_URI=mongodb://localhost:27017/ai-resume-screener
EOF
```

**Get your FREE Gemini API key:** https://makersuite.google.com/app/apikey

### Step 4: Configure Frontend

```bash
cd ../frontend
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
EOF
```

### Step 5: Start All Services

Open 3 terminals:

**Terminal 1: Backend**
```bash
cd backend
npm run dev
# ✅ Backend running on http://localhost:5000
```

**Terminal 2: AI Service**
```bash
cd ai-service
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# ✅ AI Service running on http://localhost:8000
```

**Terminal 3: Frontend**
```bash
cd frontend
npm run dev
# ✅ Frontend running on http://localhost:3000
```

---

## ✅ Verify Installation

Open browser to http://localhost:3000

1. **Register** - Create an account
2. **Create Job** - Add a sample job posting
3. **Upload Resume** - Upload a PDF/DOCX resume
4. **View Rankings** - Check the "Top Candidates" tab
5. **Generate Interview** - Click on a candidate

**If all steps work → 🎉 Setup Complete!**

---

## 🔧 Troubleshooting

### MongoDB Connection Error
```bash
# Make sure MongoDB is running
mongod --version

# If not installed:
# Windows: Download from mongodb.com
# Mac: brew install mongodb-community
# Linux: sudo apt install mongodb
```

### AI Service Error: "GEMINI_API_KEY not set"
```bash
# Get your free API key
1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key
4. Update ai-service/.env with your key
```

### Port Already in Use
```bash
# Change ports in .env files
# Backend: PORT=5001
# AI Service: uvicorn app.main:app --port 8001
# Frontend: Usually auto-assigns different port
```

### Resume Parsing Not Working
```bash
# Install spaCy model
cd ai-service
python -m spacy download en_core_web_sm

# Verify installation
python -c "import spacy; spacy.load('en_core_web_sm')"
```

---

## 📚 Next Steps

1. **Explore Features**
   - Create multiple jobs
   - Upload various resumes
   - Compare candidates
   - Generate interview kits

2. **Read Documentation**
   - [Project Complete](../docs/PROJECT_COMPLETE.md) - Full overview
   - [Module 3](../docs/MODULE_3_COMPLETE.md) - AI integration
   - [Module 4](../docs/MODULE_4_FRONTEND.md) - Frontend features
   - [API Contract](../docs/API_CONTRACT.md) - API documentation

3. **Customize**
   - Add your company logo
   - Configure email templates
   - Adjust scoring weights
   - Add custom skills

---

## 🎯 Test Data

### Sample Job Posting
```
Title: Senior Full Stack Developer
Department: Engineering
Skills Required: React, Node.js, MongoDB, AWS
Experience: 5+ years
```

### Sample Resume
Upload any PDF/DOCX resume with:
- Technical skills section
- Work experience
- Education
- Contact information

---

## 💡 Pro Tips

1. **Use Gemini API** (Free tier available) - Faster and more cost-effective
2. **Start MongoDB** before starting backend
3. **Keep all 3 terminals running** during development
4. **Check browser console** for frontend errors
5. **Check terminal logs** for backend/AI errors

---

## 🔐 Security Note

**⚠️ IMPORTANT for Production:**

1. Change `JWT_SECRET` to a strong random string
2. Use MongoDB Atlas (cloud) instead of local MongoDB
3. Enable HTTPS for all services
4. Set up proper CORS policies
5. Add rate limiting
6. Use environment-specific .env files

---

## 📞 Need Help?

- **Documentation:** Check `/docs` folder
- **Issues:** Review terminal logs for errors
- **API Testing:** Use http://localhost:8000/docs (FastAPI Swagger UI)

---

## 🎉 Success!

You now have a fully functional AI-powered recruitment platform!

**What you can do:**
- ✅ Upload and parse resumes
- ✅ Rank candidates using AI
- ✅ View detailed match explanations
- ✅ Generate personalized interview kits
- ✅ Analyze job performance
- ✅ Track usage and limits

**Enjoy recruiting with AI! 🚀**
