import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  inverse?: boolean; // For routes that should only be accessible when NOT logged in
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, inverse = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user exists and email is verified (or signed in with Google)
  const isAuthenticated = user && (
    user.emailVerified || 
    user.providerData.some(provider => provider.providerId === 'google.com')
  );
  // For inverse routes (login/register pages)
  if (inverse) {
    return isAuthenticated ? <Navigate to="/" /> : <>{children}</>;
  }

  // For protected routes
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export default ProtectedRoute;
