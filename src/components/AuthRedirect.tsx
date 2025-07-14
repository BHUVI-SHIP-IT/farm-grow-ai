import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export const AuthRedirect: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Force redirect after a short delay if loading takes too long
    const timer = setTimeout(() => {
      if (user && profile) {
        if (profile.profile_completed) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/profile-setup', { replace: true });
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, profile, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-sm text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (user && profile) {
    if (profile.profile_completed) {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/profile-setup" replace />;
    }
  }

  return <Navigate to="/auth" replace />;
};