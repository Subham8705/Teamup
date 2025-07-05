import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
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
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/ideas" element={<Ideas />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/hackathons" element={<Hackathons />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/about" element={<About />} />
                <Route path="/discover" element={<Discover />} />
                
                {/* Protected Routes */}
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
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;