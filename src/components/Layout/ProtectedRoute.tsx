import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../config/firebase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  inverse?: boolean;
  requireEmailVerification?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  inverse = false,
  requireEmailVerification = true
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // For routes that don't require authentication
  if (inverse) {
    return !user ? <>{children}</> : <Navigate to="/" replace />;
  }

  // Show loading state while checking auth status
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

  // Check if user is authenticated based on requirements
  const isAuthenticated = user && (
    !requireEmailVerification || 
    user.emailVerified || 
    user.providerData.some(provider => provider.providerId === 'google.com')
  );

  if (!isAuthenticated) {
    // Redirect to login page, saving the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;