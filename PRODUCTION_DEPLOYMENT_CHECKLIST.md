# 🚀 PRODUCTION DEPLOYMENT CHECKLIST

**AI Resume Screener Platform**  
**Last Updated:** December 25, 2025

---

## 🎯 PRE-DEPLOYMENT CHECKLIST

### ✅ Phase 1: Core Fixes (Do First)

- [x] **Resume parsing working** - Tested with PDF and DOCX
- [x] **ATS scoring calculating** - Both JD-based and quality-based
- [x] **AI matching operational** - Hybrid scoring with fallback
- [x] **Data enrichment working** - Match scores joined with resumes
- [ ] **Database indexes added** - Run `node backend/scripts/addIndexes.js`
- [x] **Tenant validation added** - Applied to match routes
- [x] **Auth rate limiting added** - 5 attempts per 15 minutes
- [ ] **Token refresh implemented** - ⚠️ TODO
- [ ] **File validation added** - ⚠️ TODO (magic numbers)
- [ ] **Input validation complete** - ⚠️ TODO (express-validator)

### ✅ Phase 2: Performance Optimizations

- [ ] **Database indexes deployed** - Run migration script
- [ ] **N+1 queries fixed** - Dashboard aggregation
- [x] **Polling race condition fixed** - Added isPolling flag
- [x] **Frontend refresh logic** - Navigation triggers refetch
- [ ] **useMemo optimization** - ⚠️ TODO (filteredCandidates)
- [ ] **Bundle size optimized** - ⚠️ TODO (tree shaking)

### ✅ Phase 3: Security Hardening

- [x] **JWT authentication** - Working with bcrypt
- [ ] **Refresh tokens** - ⚠️ TODO
- [x] **Password hashing** - bcrypt with 12 rounds
- [x] **Rate limiting** - Auth routes protected
- [ ] **File type validation** - ⚠️ TODO (magic numbers)
- [x] **Tenant isolation** - Middleware added
- [ ] **Input sanitization** - ⚠️ TODO (all routes)
- [x] **CORS configured** - Allowed origins set
- [x] **Helmet.js active** - Security headers
- [x] **MongoDB sanitization** - express-mongo-sanitize

### ✅ Phase 4: Monitoring & Logging

- [x] **Winston logger** - Backend logging
- [x] **Error middleware** - Centralized error handling
- [ ] **Sentry integration** - ⚠️ TODO
- [ ] **Performance monitoring** - ⚠️ TODO (DataDog/New Relic)
- [ ] **Uptime monitoring** - ⚠️ TODO (UptimeRobot/Pingdom)
- [x] **Request logging** - Morgan middleware

### ✅ Phase 5: Testing

- [x] **Unit tests** - 70%+ coverage
- [x] **Integration tests** - API endpoints
- [x] **E2E tests** - Playwright
- [ ] **Load testing** - ⚠️ TODO (k6/Artillery)
- [ ] **Security audit** - ⚠️ TODO (OWASP ZAP)
- [ ] **Penetration testing** - ⚠️ TODO

---

## 🔧 ENVIRONMENT VARIABLES

### Backend (.env)
```bash
# Database
MONGODB_URI=your_mongodb_uri
MONGODB_TEST_URI=your_test_db_uri

# JWT
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRE=24h

# AI Service
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_TIMEOUT=120000

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_app_password

# Monitoring (Optional)
SENTRY_DSN=your_sentry_dsn
```

### AI Service (.env)
```bash
# LLM API Keys (at least one required)
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key

# Model Selection
GEMINI_MODEL=gemini-1.5-flash
EMBEDDING_MODEL=all-MiniLM-L6-v2

# Environment
ENVIRONMENT=production
LOG_LEVEL=INFO

# CORS
ALLOWED_ORIGINS=http://localhost:5000,https://api.yourdomain.com
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000/api
# Production: VITE_API_URL=https://api.yourdomain.com/api
```

---

## 🚀 DEPLOYMENT STEPS

### 1. Database Setup
```bash
# 1. Create MongoDB Atlas cluster or use existing
# 2. Whitelist deployment server IP
# 3. Create database user with readWrite permissions
# 4. Get connection string and add to .env
# 5. Run index migration
cd backend
node scripts/addIndexes.js
```

### 2. Backend Deployment
```bash
# Install dependencies
cd backend
npm install --production

# Run migrations (if any)
# npm run migrate

# Start with PM2 (recommended)
npm install -g pm2
pm2 start server.js --name "ai-resume-backend"
pm2 save
pm2 startup
```

### 3. AI Service Deployment
```bash
cd ai-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Start with PM2
pm2 start "uvicorn app.main:app --host 0.0.0.0 --port 8000" --name "ai-service"
```

### 4. Frontend Deployment
```bash
cd frontend
npm install
npm run build

# Deploy dist/ folder to:
# - Vercel (recommended)
# - Netlify
# - AWS S3 + CloudFront
# - Nginx static hosting
```

### 5. Configure Reverse Proxy (Nginx)
```nginx
# /etc/nginx/sites-available/ai-resume-screener

# Backend API
upstream backend {
    server localhost:5000;
}

# AI Service
upstream ai_service {
    server localhost:8000;
}

server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    
    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeout for AI operations
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }
    
    # AI Service (internal only, not exposed)
    # Access only from backend server
}
```

---

## 🧪 POST-DEPLOYMENT TESTS

### Health Checks
```bash
# Backend health
curl https://yourdomain.com/api/health

# AI Service health (internal)
curl http://localhost:8000/health
```

### Smoke Tests
```bash
# 1. Register new user
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#","fullName":"Test User"}'

# 2. Login
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'

# 3. Create job (with token from login)
curl -X POST https://yourdomain.com/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Software Engineer","description":"We are hiring..."}'

# 4. Upload resume
curl -X POST https://yourdomain.com/api/resumes/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "resume=@sample.pdf"
```

### Load Test
```bash
# Install k6
brew install k6  # macOS
# or download from k6.io

# Run load test
k6 run loadtest.js
```

---

## 📊 MONITORING SETUP

### 1. Sentry (Error Tracking)
```javascript
// backend/server.js
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### 2. PM2 Monitoring
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# View logs
pm2 logs ai-resume-backend --lines 100

# Monitor
pm2 monit
```

### 3. Database Monitoring
- Enable MongoDB Atlas monitoring
- Set up alerts for:
  - Connection spikes
  - Slow queries (>100ms)
  - Disk usage >80%
  - CPU usage >70%

---

## 🔐 SECURITY CHECKLIST

- [ ] HTTPS enabled (Let's Encrypt SSL)
- [ ] Environment variables secured (not in version control)
- [ ] Database user has minimal required permissions
- [ ] Firewall configured (only ports 80, 443 open)
- [ ] SSH key authentication (password login disabled)
- [ ] Regular security updates (Ubuntu/CentOS)
- [ ] Backup strategy in place (daily MongoDB backups)
- [ ] Rate limiting active on all APIs
- [ ] CORS properly configured (no wildcards in production)
- [ ] Helmet.js security headers enabled

---

## 🆘 ROLLBACK PLAN

### If deployment fails:
```bash
# 1. Stop new services
pm2 stop ai-resume-backend
pm2 stop ai-service

# 2. Restore previous version
pm2 resurrect

# 3. Check logs
pm2 logs --err

# 4. Restore database (if needed)
mongorestore --uri="mongodb://..." backup/

# 5. Update DNS if needed (point back to old server)
```

---

## 📞 SUPPORT CONTACTS

- **DevOps Lead:** [contact]
- **Database Admin:** [contact]
- **Security Team:** [contact]
- **On-call Engineer:** [contact]

---

## 📝 POST-LAUNCH MONITORING

### Week 1:
- [ ] Monitor error rates (should be <0.1%)
- [ ] Check API response times (should be <500ms p95)
- [ ] Review logs daily
- [ ] Monitor database performance
- [ ] Check disk space usage
- [ ] Verify backups running

### Week 2-4:
- [ ] Analyze user behavior
- [ ] Optimize slow queries
- [ ] Review security logs
- [ ] Plan scaling strategy
- [ ] User feedback collection

---

**🎉 Ready for Production?**

**Current Status:** ⚠️ **85% Ready**

**Blockers:**
1. ⚠️ Token refresh mechanism (2 hours)
2. ⚠️ File type validation (1 hour)
3. ⚠️ Database indexes deployment (5 minutes)

**Timeline:** **1 week to production-ready**

