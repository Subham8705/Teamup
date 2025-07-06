import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ChatProvider } from './contexts/ChatContext';
import Navbar from './components/Layout/Navbar';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Home from './pages/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Ideas from './pages/Ideas';
import Teams from './pages/Teams';
import Hackathons from './pages/Hackathons';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Courses from './pages/Courses';
import About from './pages/About';
import Discover from './pages/Discover';
import AuthWrapper from './components/Auth/AuthWrapper';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full overflow-x-hidden transition-colors duration-300">
              <Toaster 
                position="top-right"
                toastOptions={{
                  className: 'dark:bg-gray-800 dark:text-white',
                }}
              />
              <Navbar />
              <main className="w-full">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  
                  {/* Auth Routes (only accessible when NOT logged in) */}
                  <Route
                    path="/login"
                    element={
                      <ProtectedRoute inverse>
                        <Login />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <ProtectedRoute inverse>
                        <Register />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Protected Routes (only accessible when logged in) */}
                  <Route
                    path="/ideas"
                    element={
                      <ProtectedRoute>
                        <Ideas />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/teams"
                    element={
                      <ProtectedRoute>
                        <Teams />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hackathons"
                    element={
                      <ProtectedRoute>
                        <Hackathons />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/discover"
                    element={
                      <ProtectedRoute>
                        <Discover />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/courses"
                    element={
                      <ProtectedRoute>
                        <Courses />
                      </ProtectedRoute>
                    }
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
                    path="/chat"
                    element={
                      <ProtectedRoute>
                        <ChatProvider>
                          <Chat />
                        </ChatProvider>
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Auth wrapper route (from the chat app) */}
                  <Route 
                    path="/auth" 
                    element={
                      <ProtectedRoute inverse>
                        <AuthWrapper />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Catch all route - redirect to home */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;