import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface LiteracyCheckProps {
  selectedLanguage: string;
  onLiteracySelect: (isLiterate: boolean) => void;
}

const languageNames = {
  english: 'English',
  hindi: 'हिंदी',
  tamil: 'தமிழ்',
  telugu: 'తెలుగు',
  kannada: 'ಕನ್ನಡ',
  marathi: 'मराठी',
  gujarati: 'ગુજરાતી',
  bengali: 'বাংলা',
  punjabi: 'ਪੰਜਾਬੀ',
  malayalam: 'മലയാളം',
  spanish: 'Español',
  portuguese: 'Português',
  japanese: '日本語',
  indonesian: 'Bahasa Indonesia',
};

export const LiteracyCheck: React.FC<LiteracyCheckProps> = ({ selectedLanguage, onLiteracySelect }) => {
  const languageName = languageNames[selectedLanguage as keyof typeof languageNames] || selectedLanguage;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 text-center shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mb-6 shadow-lg">
            <span className="text-white text-2xl">📖</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">Language Preference</h1>
          <p className="text-xl text-gray-600 mb-6">
            Can you read and write in <span className="font-bold text-green-600">{languageName}</span>?
          </p>
        </div>
        
        <div className="space-y-4">
          <Button
            size="lg"
            className="w-full h-16 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => onLiteracySelect(true)}
          >
            ✅ Yes, I can read and write
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="w-full h-16 text-lg border-2 border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-300"
            onClick={() => onLiteracySelect(false)}
          >
            🎤 No, I prefer voice interaction
          </Button>
        </div>
        
        <p className="text-sm text-gray-500 mt-6">
          🌱 Don't worry! Grow Smart AI supports both text and voice-based interactions.
        </p>
      </Card>
    </div>
  );
};