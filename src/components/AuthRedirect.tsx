import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export const AuthRedirect: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has completed language selection
    const selectedLanguage = localStorage.getItem('selectedLanguage');
    
    // Force redirect after a short delay if loading takes too long
    const timer = setTimeout(() => {
      if (!selectedLanguage) {
        navigate('/language-selection', { replace: true });
        return;
      }

      if (user && profile) {
        if (profile.profile_completed) {
          navigate('/dashboard', { replace: true });
        } else {
          const literacyStatus = localStorage.getItem('literacyStatus');
          if (literacyStatus === 'illiterate') {
            navigate('/voice-chat', { replace: true });
          } else {
            navigate('/profile-setup', { replace: true });
          }
        }
      } else if (!user) {
        navigate('/auth', { replace: true });
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

  // Check language selection first
  const selectedLanguage = localStorage.getItem('selectedLanguage');
  if (!selectedLanguage) {
    return <Navigate to="/language-selection" replace />;
  }

  if (user && profile) {
    if (profile.profile_completed) {
      return <Navigate to="/dashboard" replace />;
    } else {
      const literacyStatus = localStorage.getItem('literacyStatus');
      if (literacyStatus === 'illiterate') {
        return <Navigate to="/voice-chat" replace />;
      }
      return <Navigate to="/profile-setup" replace />;
    }
  }

  return <Navigate to="/auth" replace />;
};