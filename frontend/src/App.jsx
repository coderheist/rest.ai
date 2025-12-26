import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/NewLandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetailNew from './pages/JobDetailNew';
import TalentPoolNew from './pages/TalentPoolNew';
import Resumes from './pages/Resumes';
import ResumeDetail from './pages/ResumeDetail';
import CandidateProfile from './pages/CandidateProfile';
import CandidateInbox from './pages/CandidateInbox';
import SplitViewReview from './pages/SplitViewReview';
import PipelineView from './pages/PipelineView';
import Matches from './pages/Matches';
import CandidateRanking from './pages/CandidateRanking';
import MatchDetail from './pages/MatchDetail';
import Interviews from './pages/Interviews';
import InterviewKit from './pages/InterviewKit';
import Analytics from './pages/Analytics';
import Exports from './pages/Exports';
import Settings from './pages/Settings';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#363636',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              borderRadius: '0.75rem',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Jobs Routes */}
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <Jobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:id"
            element={
              <ProtectedRoute>
                <JobDetailNew />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:jobId/candidates"
            element={
              <ProtectedRoute>
                <CandidateRanking />
              </ProtectedRoute>
            }
          />

          {/* Candidates Routes */}
          <Route
            path="/candidates"
            element={
              <ProtectedRoute>
                <CandidateInbox />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate-review/:id"
            element={
              <ProtectedRoute>
                <SplitViewReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pipeline"
            element={
              <ProtectedRoute>
                <PipelineView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/talent-pool"
            element={
              <ProtectedRoute>
                <TalentPoolNew />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidates/:id"
            element={
              <ProtectedRoute>
                <CandidateProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resumes"
            element={
              <ProtectedRoute>
                <Resumes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resumes/:id"
            element={
              <ProtectedRoute>
                <ResumeDetail />
              </ProtectedRoute>
            }
          />

          {/* Matches Routes */}
          <Route
            path="/matches"
            element={
              <ProtectedRoute>
                <Matches />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matches/:matchId"
            element={
              <ProtectedRoute>
                <MatchDetail />
              </ProtectedRoute>
            }
          />

          {/* Interview Routes */}
          <Route
            path="/interviews"
            element={
              <ProtectedRoute>
                <Interviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interviews/:kitId"
            element={
              <ProtectedRoute>
                <InterviewKit />
              </ProtectedRoute>
            }
          />

          {/* Analytics Route */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />

          {/* Exports Route */}
          <Route
            path="/exports"
            element={
              <ProtectedRoute>
                <Exports />
              </ProtectedRoute>
            }
          />

          {/* Settings Route */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  </ThemeProvider>
  );
}

export default App;
