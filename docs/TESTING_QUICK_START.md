# AI Resume Screener - Testing Quick Reference

## 🚀 Run Tests Quickly

### Backend (Unit + Integration)
```bash
cd backend
npm test                    # Run all tests
npm run test:coverage       # With coverage report
```

### Frontend (Component + Unit)
```bash
cd frontend
npm test                    # Run all tests
npm run test:ui             # Interactive UI
npm run test:coverage       # With coverage report
```

### E2E (Full User Flows)
```bash
cd e2e
npm install                 # First time only
npx playwright install      # Install browsers (first time only)
npm run test:e2e           # Run all E2E tests
npm run test:e2e:headed    # See browser
npm run test:e2e:ui        # Interactive mode
```

## 📊 Coverage Targets
- **Minimum**: 70% across all metrics
- **Target**: 80%+ for production

## 🧪 Test Categories

| Category | Location | Command | Count |
|----------|----------|---------|-------|
| Backend Unit | `backend/__tests__/unit/` | `npm test unit` | 50+ |
| Backend Integration | `backend/__tests__/integration/` | `npm test integration` | 30+ |
| Frontend Component | `frontend/src/__tests__/` | `npm test` | 25+ |
| E2E Flows | `e2e/tests/` | `npm run test:e2e` | 20+ |

## 🐛 Debug Tips

**Backend**: Use VS Code Jest extension + breakpoints  
**Frontend**: Run `npm run test:ui` for interactive debugging  
**E2E**: Run `npm run test:e2e:debug` for Playwright Inspector

## 📈 View Reports

**Backend Coverage**: `open backend/coverage/index.html`  
**Frontend Coverage**: `open frontend/coverage/index.html`  
**E2E Report**: `npm run test:e2e:report` (after running tests)

---

See [MODULE_5_TESTING.md](MODULE_5_TESTING.md) for complete documentation.
