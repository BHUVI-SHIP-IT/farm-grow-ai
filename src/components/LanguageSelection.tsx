import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface LanguageSelectionProps {
  onLanguageSelect: (language: string) => void;
}

const languages = [
  { code: 'english', name: 'English', flag: '🇺🇸' },
  { code: 'hindi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'tamil', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'telugu', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kannada', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'marathi', name: 'मराठी', flag: '🇮🇳' },
  { code: 'gujarati', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'bengali', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'punjabi', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'malayalam', name: 'മലയാളം', flag: '🇮🇳' },
  { code: 'spanish', name: 'Español', flag: '🇪🇸' },
  { code: 'portuguese', name: 'Português', flag: '🇵🇹' },
  { code: 'japanese', name: '日本語', flag: '🇯🇵' },
  { code: 'indonesian', name: 'Bahasa Indonesia', flag: '🇮🇩' },
];

export const LanguageSelection: React.FC<LanguageSelectionProps> = ({ onLanguageSelect }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Welcome to KissanAI</h1>
          <p className="text-xl text-muted-foreground">Please select your preferred language</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {languages.map((language) => (
            <Button
              key={language.code}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-primary/10 hover:border-primary transition-all duration-200"
              onClick={() => onLanguageSelect(language.code)}
            >
              <span className="text-2xl">{language.flag}</span>
              <span className="text-sm font-medium">{language.name}</span>
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
};