import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sprout, 
  MessageSquare, 
  Camera, 
  Sparkles, 
  Volume2,
  VolumeX,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface WelcomeExperienceProps {
  onComplete: () => void;
}

export const WelcomeExperience: React.FC<WelcomeExperienceProps> = ({ onComplete }) => {
  const { profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const getWelcomeMessage = () => {
    const messages = {
      english: `Welcome to FarmAI Assistant, ${profile?.full_name?.split(' ')[0] || 'Friend'}! I'm here to help you with all your farming needs.`,
      hindi: `फार्म एआई असिस्टेंट में आपका स्वागत है, ${profile?.full_name?.split(' ')[0] || 'मित्र'}! मैं यहाँ आपकी सभी खेती की जरूरतों में मदद करने के लिए हूँ।`,
      tamil: `FarmAI Assistant-க்கு வரவேற்கிறோம், ${profile?.full_name?.split(' ')[0] || 'நண்பரே'}! உங்கள் அனைத்து விவசாய தேவைகளுக்கும் உதவ நான் இங்கே இருக்கிறேன்।`,
      telugu: `FarmAI Assistant కి స్వాగతం, ${profile?.full_name?.split(' ')[0] || 'మిత్రమా'}! మీ అన్ని వ్యవసాయ అవసరాలకు సహాయం చేయడానికి నేను ఇక్కడ ఉన్నాను।`,
      kannada: `FarmAI Assistant ಗೆ ಸ್ವಾಗತ, ${profile?.full_name?.split(' ')[0] || 'ಸ್ನೇಹಿತರೇ'}! ನಿಮ್ಮ ಎಲ್ಲಾ ಕೃಷಿ ಅಗತ್ಯಗಳಿಗೆ ಸಹಾಯ ಮಾಡಲು ನಾನು ಇಲ್ಲಿದ್ದೇನೆ।`,
      marathi: `FarmAI Assistant मध्ये आपले स्वागत आहे, ${profile?.full_name?.split(' ')[0] || 'मित्रा'}! तुमच्या सर्व शेतीच्या गरजांमध्ये मदत करण्यासाठी मी येथे आहे।`,
      gujarati: `FarmAI Assistant માં આપનું સ્વાગત છે, ${profile?.full_name?.split(' ')[0] || 'મિત્ર'}! તમારી બધી ખેતીની જરૂરિયાતોમાં મદદ કરવા માટે હું અહીં છું।`,
      bengali: `FarmAI Assistant এ আপনাকে স্বাগতম, ${profile?.full_name?.split(' ')[0] || 'বন্ধু'}! আপনার সব কৃষি প্রয়োজনে সাহায্য করতে আমি এখানে আছি।`
    };

    return messages[profile?.preferred_language as keyof typeof messages] || messages.english;
  };

  const welcomeSteps = [
    {
      title: 'Welcome to FarmAI Assistant!',
      description: 'Your intelligent farming companion powered by AI',
      icon: Sprout,
      color: 'bg-emerald-500'
    },
    {
      title: 'Chat with AI Expert',
      description: 'Get instant answers to all your farming questions',
      icon: MessageSquare,
      color: 'bg-blue-500'
    },
    {
      title: 'Plant Identification',
      description: 'Upload photos to identify plants and diseases',
      icon: Camera,
      color: 'bg-green-500'
    },
    {
      title: 'Personalized for You',
      description: `Tailored advice for ${profile?.crop_types?.length || 0} crop types in ${profile?.district || 'your area'}`,
      icon: Sparkles,
      color: 'bg-purple-500'
    }
  ];

  const playWelcomeMessage = () => {
    if ('speechSynthesis' in window) {
      setIsPlaying(true);
      const utterance = new SpeechSynthesisUtterance(getWelcomeMessage());
      utterance.lang = profile?.preferred_language === 'english' ? 'en-US' : 'hi-IN';
      utterance.onend = () => setIsPlaying(false);
      speechSynthesis.speak(utterance);
    }
  };

  const stopWelcomeMessage = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const nextStep = () => {
    if (currentStep < welcomeSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const currentStepData = welcomeSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {/* Progress */}
          <div className="flex justify-center space-x-2 mb-6">
            {welcomeSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= currentStep ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className={`w-16 h-16 ${currentStepData.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
            <currentStepData.icon className="w-8 h-8 text-white" />
          </div>

          {/* Content */}
          <h2 className="text-xl font-bold mb-3">{currentStepData.title}</h2>
          <p className="text-gray-600 mb-6">{currentStepData.description}</p>

          {/* Welcome Message (only on first step) */}
          {currentStep === 0 && (
            <div className="mb-6 p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-800 mb-3">
                {getWelcomeMessage()}
              </p>
              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isPlaying ? stopWelcomeMessage : playWelcomeMessage}
                  disabled={!('speechSynthesis' in window)}
                >
                  {isPlaying ? (
                    <>
                      <VolumeX className="w-4 h-4 mr-1" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 mr-1" />
                      Listen
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Role-specific content */}
          {currentStep === 3 && profile?.role && (
            <div className="mb-4">
              <Badge variant="outline" className="capitalize">
                {profile.role} Dashboard
              </Badge>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={onComplete}
              disabled={currentStep === 0}
            >
              Skip Tour
            </Button>
            <Button onClick={nextStep} className="flex items-center">
              {currentStep === welcomeSteps.length - 1 ? 'Get Started' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Quick actions on last step */}
          {currentStep === welcomeSteps.length - 1 && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 mb-3">Quick start:</p>
              <div className="flex justify-center space-x-2">
                <Link to="/?tab=chat">
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Ask AI
                  </Button>
                </Link>
                <Link to="/?tab=identify">
                  <Button variant="outline" size="sm">
                    <Camera className="w-4 h-4 mr-1" />
                    Identify Plant
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};