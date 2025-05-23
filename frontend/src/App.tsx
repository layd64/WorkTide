import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import FindWork from './pages/FindWork'
import FindFreelancers from './pages/FindFreelancers'
import Login from './components/auth/Login'
import SignUp from './components/auth/SignUp'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import FreelancerProfile from './pages/FreelancerProfile'
import FreelancerReviewsPage from './pages/FreelancerReviewsPage'
import FreelancerApplications from './pages/FreelancerApplications'
import TaskManagement from './pages/TaskManagement'
import Chat from './pages/Chat'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { DropdownProvider, useDropdown } from './contexts/DropdownContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

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

function AppContent() {
  const { isDropdownOpen } = useDropdown();

  return (
    <Router>
      <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 pt-16 flex flex-col">
        <Navbar />
        <OverlayCleanup />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/find-work" element={<FindWork />} />
            <Route path="/find-freelancers" element={<FindFreelancers />} />
            <Route path="/freelancer-profile/:id" element={<FreelancerProfile />} />
            <Route path="/freelancer-reviews/:id" element={<FreelancerReviewsPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
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
              path="/my-applications"
              element={
                <ProtectedRoute>
                  <FreelancerApplications />
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
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

import { AccessibilityProvider } from './contexts/AccessibilityContext'
import { ChatProvider } from './contexts/ChatContext'

// ... existing imports

import ReadingGuide from './components/accessibility/ReadingGuide'

// ... existing imports

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <DropdownProvider>
            <AccessibilityProvider>
              <ChatProvider>
                <ReadingGuide />
                <AppContent />
              </ChatProvider>
            </AccessibilityProvider>
          </DropdownProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  )
}

export default App
