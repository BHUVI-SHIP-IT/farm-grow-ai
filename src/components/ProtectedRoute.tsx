import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingFallback } from '@/components/LoadingFallback';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresProfileSetup?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresProfileSetup = false 
}) => {
  const { user, profile, loading } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    // Set a timeout for loading state
    const timer = setTimeout(() => {
      if (loading) {
        setLoadingTimeout(true);
        console.warn('ProtectedRoute loading timeout - possible auth issue');
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [loading]);

  console.log('ProtectedRoute - loading:', loading, 'user:', !!user, 'profile:', !!profile);

  if (loading && !loadingTimeout) {
    return (
      <LoadingFallback 
        message="Authenticating..." 
        timeout={8000}
        onTimeout={() => setLoadingTimeout(true)}
      />
    );
  }

  // If loading timed out, try to recover
  if (loadingTimeout && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If profile setup is required but not completed, redirect to profile setup
  if (requiresProfileSetup && profile && !profile.profile_completed) {
    return <Navigate to="/profile-setup" replace />;
  }

  // If we require profile setup but don't have a profile yet, wait a bit
  if (requiresProfileSetup && !profile) {
    return (
      <LoadingFallback 
        message="Loading your profile..." 
        timeout={5000}
        onTimeout={() => {
          console.warn('Profile loading timeout - redirecting to profile setup');
          window.location.href = '/profile-setup';
        }}
      />
    );
  }

  return <>{children}</>;
};