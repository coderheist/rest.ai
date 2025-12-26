# Module 5: Testing & Quality Assurance

## 📋 Overview
Comprehensive testing suite for the AI Resume Screener application covering unit tests, integration tests, component tests, and end-to-end tests.

## 🎯 Testing Coverage

### Backend Testing
- **Unit Tests**: Service layer testing with mocked dependencies
- **Integration Tests**: Full API endpoint testing with real database
- **Coverage Target**: 70% minimum across all metrics

### Frontend Testing
- **Component Tests**: React component testing with React Testing Library
- **Unit Tests**: Utility and service function testing
- **Coverage Target**: 70% minimum

### E2E Testing
- **User Flows**: Complete user journey testing
- **Cross-Browser**: Chrome, Firefox, Safari, Mobile
- **Visual Regression**: Screenshot comparison

## 🚀 Quick Start

### Backend Tests
```bash
cd backend

# Install test dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Frontend Tests
```bash
cd frontend

# Install test dependencies
npm install

# Run all tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### E2E Tests
```bash
cd e2e

# Install dependencies
npm install

# Install browsers
npx playwright install

# Run tests (will start backend and frontend automatically)
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# Interactive UI mode
npm run test:e2e:ui

# View report
npm run test:e2e:report
```

## 📁 Test Structure

### Backend Tests (`backend/__tests__/`)
```
__tests__/
├── unit/
│   ├── jobService.test.js           # Job service tests
│   ├── resumeService.test.js        # Resume service tests
│   └── matchService.test.js         # Match service tests
└── integration/
    ├── jobApi.test.js               # Job API endpoint tests
    └── resumeApi.test.js            # Resume API endpoint tests
```

### Frontend Tests (`frontend/src/__tests__/`)
```
__tests__/
├── setup.js                         # Test setup and mocks
├── MatchExplanation.test.jsx        # Match explanation component
├── CandidateRanking.test.jsx        # Candidate ranking component
└── JobInsights.test.jsx             # Job insights component
```

### E2E Tests (`e2e/tests/`)
```
tests/
├── auth.spec.js                     # Authentication flow
├── resume-matching.spec.js          # Resume upload and matching
└── dashboard.spec.js                # Dashboard and analytics
```

## 🧪 Test Categories

### 1. Backend Unit Tests

**Job Service Tests** (`jobService.test.js`)
- ✅ Create job with AI extraction
- ✅ Get job by ID with authorization
- ✅ List jobs with pagination and filters
- ✅ Update job details
- ✅ Delete job and cascade matches
- ✅ Job statistics calculation

**Resume Service Tests** (`resumeService.test.js`)
- ✅ Upload and parse resume
- ✅ Handle parsing failures gracefully
- ✅ File type and size validation
- ✅ List resumes with filters
- ✅ Update resume information
- ✅ Delete resume and cleanup files
- ✅ Search resumes by keyword

**Match Service Tests** (`matchService.test.js`)
- ✅ Create match with AI scoring
- ✅ Get match with populated data
- ✅ Get matches by job (sorted)
- ✅ Update match status
- ✅ Rescreen candidates
- ✅ Get top N candidates
- ✅ Match statistics

### 2. Backend Integration Tests

**Job API Tests** (`jobApi.test.js`)
- ✅ POST /api/jobs - Create job
- ✅ GET /api/jobs - List jobs with filters
- ✅ GET /api/jobs/:id - Get job details
- ✅ PUT /api/jobs/:id - Update job
- ✅ DELETE /api/jobs/:id - Delete job
- ✅ POST /api/jobs/:id/rescreen - Rescreen candidates
- ✅ GET /api/jobs/:id/insights - Get AI insights
- ✅ Authorization and validation

**Resume API Tests** (`resumeApi.test.js`)
- ✅ POST /api/resumes/upload - Upload resume
- ✅ GET /api/resumes - List resumes
- ✅ GET /api/resumes/:id - Get resume details
- ✅ PUT /api/resumes/:id - Update resume
- ✅ DELETE /api/resumes/:id - Delete resume
- ✅ GET /api/resumes/search - Search resumes
- ✅ POST /api/resumes/:id/reparse - Reparse resume

### 3. Frontend Component Tests

**MatchExplanation Tests**
- ✅ Render match scores
- ✅ Display breakdown (skills/experience/education)
- ✅ Show strengths and weaknesses
- ✅ Display matched/missing skills
- ✅ Show AI recommendations
- ✅ Handle missing optional data

**CandidateRanking Tests**
- ✅ Render candidate list with ranks
- ✅ Display scores and skills
- ✅ Show status badges
- ✅ Handle status changes (shortlist/reject)
- ✅ Navigate to match details
- ✅ Empty state handling

**JobInsights Tests**
- ✅ Display statistics cards
- ✅ Show top skills with percentages
- ✅ Display skill gaps
- ✅ Show AI recommendations
- ✅ Render experience distribution
- ✅ Handle missing data gracefully

### 4. E2E Tests

**Authentication Flow**
- ✅ Register new user
- ✅ Login existing user
- ✅ Validation errors
- ✅ Logout functionality
- ✅ Protected route handling

**Resume Matching Flow**
- ✅ Create job posting
- ✅ Upload resume
- ✅ Match resume to job
- ✅ View match details
- ✅ Shortlist candidates
- ✅ Generate interview kit
- ✅ Rescreen candidates
- ✅ View job insights
- ✅ Export to CSV

**Dashboard Flow**
- ✅ Display statistics
- ✅ Show recent activity
- ✅ Navigate between sections
- ✅ View usage analytics

## 📊 Coverage Reports

### Backend Coverage
```bash
npm run test:coverage
```

Coverage reports are generated in:
- `backend/coverage/index.html` - HTML report
- `backend/coverage/coverage-summary.json` - JSON summary

Minimum thresholds (70%):
- **Lines**: 70%
- **Functions**: 70%
- **Branches**: 70%
- **Statements**: 70%

### Frontend Coverage
```bash
npm run test:coverage
```

Coverage reports in:
- `frontend/coverage/index.html` - HTML report
- `frontend/coverage/coverage.json` - JSON report

### E2E Test Results
```bash
npm run test:e2e:report
```

Results in:
- `e2e/playwright-report/` - HTML report
- `e2e/test-results/` - Screenshots and videos

## 🔧 Configuration

### Jest Configuration (Backend)
See `backend/package.json`:
```json
{
  "jest": {
    "testEnvironment": "node",
    "coveragePathIgnorePatterns": ["/node_modules/"],
    "collectCoverageFrom": [
      "services/**/*.js",
      "controllers/**/*.js",
      "middleware/**/*.js",
      "models/**/*.js",
      "utils/**/*.js"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 70,
        "statements": 70
      }
    }
  }
}
```

### Vitest Configuration (Frontend)
See `frontend/vitest.config.js`:
```javascript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70
      }
    }
  }
});
```

### Playwright Configuration (E2E)
See `e2e/playwright.config.js`:
```javascript
export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' },
    { name: 'mobile-chrome' },
  ]
});
```

## 🛠️ Writing New Tests

### Backend Unit Test Template
```javascript
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import myService from '../../services/myService.js';

// Mock dependencies
jest.mock('../../models/MyModel.js');

describe('MyService', () => {
  const mockUser = {
    _id: 'user123',
    tenantId: 'tenant123'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('myFunction', () => {
    test('should do something', async () => {
      // Arrange
      const MyModel = await import('../../models/MyModel.js');
      MyModel.find = jest.fn().mockResolvedValue([]);

      // Act
      const result = await myService.myFunction(mockUser);

      // Assert
      expect(result).toBeDefined();
    });
  });
});
```

### Frontend Component Test Template
```javascript
import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '../components/MyComponent';

describe('MyComponent', () => {
  test('renders correctly', () => {
    render(<MyComponent prop="value" />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  test('handles user interaction', async () => {
    render(<MyComponent />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText('Updated Text')).toBeInTheDocument();
  });
});
```

### E2E Test Template
```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Interact with page
    await page.click('text=Button');
    
    // Assert
    await expect(page.locator('text=Result')).toBeVisible();
  });
});
```

## 🐛 Debugging Tests

### Backend Tests
```bash
# Run specific test file
npm test -- jobService.test.js

# Run specific test
npm test -- -t "should create a new job"

# Debug mode (VS Code)
# Add breakpoint and use "Jest: Debug" command
```

### Frontend Tests
```bash
# Run specific test file
npm test -- MatchExplanation.test.jsx

# Interactive UI
npm run test:ui

# Debug in browser
npm run test:ui
# Click debug icon in UI
```

### E2E Tests
```bash
# Debug mode with Playwright Inspector
npm run test:e2e:debug

# Run specific test file
npx playwright test auth.spec.js

# Run specific test
npx playwright test -g "should register a new user"

# Show trace for failed tests
npx playwright show-trace trace.zip
```

## 📈 CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd backend && npm ci
      - run: cd backend && npm test

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd frontend && npm ci
      - run: cd frontend && npm test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd e2e && npm ci
      - run: npx playwright install --with-deps
      - run: cd e2e && npm run test:e2e
```

## 🎯 Best Practices

### General
- ✅ Write tests before or alongside code (TDD)
- ✅ Keep tests isolated and independent
- ✅ Use descriptive test names
- ✅ Follow AAA pattern: Arrange, Act, Assert
- ✅ Mock external dependencies
- ✅ Test edge cases and error conditions
- ✅ Maintain test coverage above 70%

### Backend
- ✅ Use separate test database
- ✅ Clean up data after each test
- ✅ Test both success and failure paths
- ✅ Verify authorization checks
- ✅ Test input validation

### Frontend
- ✅ Test user interactions, not implementation
- ✅ Use semantic queries (getByRole, getByLabelText)
- ✅ Test accessibility
- ✅ Avoid testing CSS/styling details
- ✅ Mock API calls

### E2E
- ✅ Test critical user journeys
- ✅ Use data-testid for stable selectors
- ✅ Wait for elements properly
- ✅ Test on multiple browsers
- ✅ Keep tests fast and reliable

## 📚 Resources

### Documentation
- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Supertest](https://github.com/ladjs/supertest)

### Guides
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [React Testing Tutorial](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [E2E Testing Guide](https://playwright.dev/docs/best-practices)

## 🚧 Known Issues

1. **AI Service Mocking**: Some tests may fail if AI service is unavailable. Mock the AI service for reliable tests.
2. **File Upload Tests**: Require proper file fixtures in `__tests__/fixtures/`
3. **E2E Flakiness**: Network-dependent tests may be flaky; use proper wait strategies

## 📝 TODO

- [ ] Add performance testing (load tests)
- [ ] Add accessibility testing (axe-core)
- [ ] Add visual regression testing
- [ ] Add API contract testing
- [ ] Increase coverage to 80%+
- [ ] Add mutation testing

## 🎉 Module Complete!

Module 5 provides a comprehensive testing framework ensuring code quality, reliability, and maintainability. All critical paths are covered with automated tests.

**Next Steps:**
1. Run backend tests: `cd backend && npm test`
2. Run frontend tests: `cd frontend && npm test`
3. Run E2E tests: `cd e2e && npm run test:e2e`
4. Review coverage reports
5. Integrate with CI/CD pipeline
