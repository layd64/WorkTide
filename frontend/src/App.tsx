import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import FindWork from './pages/FindWork'
import FindFreelancers from './pages/FindFreelancers'
import Login from './components/auth/Login'
import SignUp from './components/auth/SignUp'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import FreelancerReviewsPage from './pages/FreelancerReviewsPage'
import FreelancerApplications from './pages/FreelancerApplications'
import TaskManagement from './pages/TaskManagement'
import TaskRequestsPage from './pages/TaskRequestsPage'
import Chat from './pages/Chat'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { DropdownProvider } from './contexts/DropdownContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { Toaster } from 'sonner'
import { AccessibilityProvider } from './contexts/AccessibilityContext'
import { ChatProvider } from './contexts/ChatContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import AdminLayout from './components/layout/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminTasks from './pages/admin/AdminTasks'
import AdminRatings from './pages/admin/AdminRatings'
import AdminLogs from './pages/admin/AdminLogs'
import AdminRoute from './components/auth/AdminRoute'
import ReadingGuide from './components/accessibility/ReadingGuide'

// Component to detect and cleanup any lingering overlay elements
const OverlayCleanup: React.FC = () => {
  useEffect(() => {
    const cleanup = () => {
      // Find and remove any fixed position elements that might be blocking interactions
      const fixedElements = document.querySelectorAll('.fixed.inset-0');

      fixedElements.forEach(el => {
        // Only remove elements that might be blocking interactions but are not part of active modals
        const isPartOfActiveModal = el.closest('[role="dialog"]') ||
          el.parentElement?.classList.contains('z-50');

        if (!isPartOfActiveModal) {
          el.remove();
        }
      });
    };

    // Run cleanup on mount and set interval to check periodically
    cleanup();
    const interval = setInterval(cleanup, 1000);

    return () => clearInterval(interval);
  }, []);

  return null; // This component doesn't render anything
};

// AppContent to use useLocation hook
const AppContent: React.FC = () => {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith('/chat');

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 pt-16 flex flex-col">
      <Navbar />
      <OverlayCleanup />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/find-work" element={<FindWork />} />
          <Route path="/find-freelancers" element={<FindFreelancers />} />
          <Route path="/freelancer-reviews/:id" element={<FreelancerReviewsPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/profile/:id"
            element={<Profile />}
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-tasks"
            element={
              <ProtectedRoute>
                <TaskManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-applications"
            element={
              <ProtectedRoute>
                <FreelancerApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <ProtectedRoute>
                <TaskRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:userId"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="tasks" element={<AdminTasks />} />
              <Route path="ratings" element={<AdminRatings />} />
              <Route path="logs" element={<AdminLogs />} />
            </Route>
          </Route>
        </Routes>
      </div>
      {!isChatPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <DropdownProvider>
            <ChatProvider>
              <NotificationProvider>
                <AccessibilityProvider>
                  <ReadingGuide />
                  <Router>
                    <AppContent />
                    <Toaster position="top-right" richColors closeButton />
                  </Router>
                </AccessibilityProvider>
              </NotificationProvider>
            </ChatProvider>
          </DropdownProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  )
}

export default App
