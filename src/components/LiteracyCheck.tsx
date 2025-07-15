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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-4">Language Preference</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Can you read and write in <span className="font-bold text-primary">{languageName}</span>?
          </p>
        </div>
        
        <div className="space-y-4">
          <Button
            size="lg"
            className="w-full h-16 text-lg"
            onClick={() => onLiteracySelect(true)}
          >
            Yes, I can read and write
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="w-full h-16 text-lg"
            onClick={() => onLiteracySelect(false)}
          >
            No, I prefer voice interaction
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mt-6">
          Don't worry! We support both text and voice-based interactions.
        </p>
      </Card>
    </div>
  );
};