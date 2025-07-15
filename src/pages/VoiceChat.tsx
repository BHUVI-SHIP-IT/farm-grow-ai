import React, { useEffect, useState } from 'react';
import { VoiceChatInterface } from '@/components/VoiceChatInterface';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings } from 'lucide-react';

export const VoiceChatPage: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const navigate = useNavigate();

  useEffect(() => {
    const storedLanguage = localStorage.getItem('selectedLanguage');
    if (storedLanguage) {
      setSelectedLanguage(storedLanguage);
    }
  }, []);

  return (
    <div className="relative">
      {/* Header with navigation */}
      <div className="absolute top-4 left-4 z-10 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/language-selection')}
          className="bg-white/90 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Change Language
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/auth')}
          className="bg-white/90 backdrop-blur-sm"
        >
          <Settings className="w-4 h-4 mr-2" />
          Sign In
        </Button>
      </div>

      <VoiceChatInterface selectedLanguage={selectedLanguage} />
    </div>
  );
};