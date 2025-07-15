import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Keyboard, Languages, ChevronDown, ChevronUp, Volume2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VoiceChatInterfaceProps {
  selectedLanguage: string;
}

const sampleQuestions = [
  "What is the best time to plant tomatoes?",
  "How to control pest in wheat crop?",
  "What fertilizer should I use for rice?",
  "How to identify crop diseases?",
];

const moreExamples = [
  "Best irrigation practices for cotton",
  "Soil preparation for vegetable farming",
  "Weather-based farming advice",
  "Organic farming techniques",
  "Market price trends for crops",
  "Government schemes for farmers",
];

export const VoiceChatInterface: React.FC<VoiceChatInterfaceProps> = ({ selectedLanguage }) => {
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [textInput, setTextInput] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = getLanguageCode(selectedLanguage);

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (transcript.trim()) {
          handleSubmitQuestion(transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Please try again or use text input",
          variant: "destructive",
        });
      };
    }
  }, [selectedLanguage, transcript]);

  const getLanguageCode = (language: string) => {
    const codes: { [key: string]: string } = {
      english: 'en-US',
      hindi: 'hi-IN',
      tamil: 'ta-IN',
      telugu: 'te-IN',
      kannada: 'kn-IN',
      marathi: 'mr-IN',
      gujarati: 'gu-IN',
      bengali: 'bn-IN',
      punjabi: 'pa-IN',
      malayalam: 'ml-IN',
      spanish: 'es-ES',
      portuguese: 'pt-PT',
      japanese: 'ja-JP',
      indonesian: 'id-ID',
    };
    return codes[language] || 'en-US';
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('');
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSubmitQuestion = async (question: string) => {
    if (!question.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('kissan-ai-chat', {
        body: { 
          question: question.trim(),
          language: selectedLanguage 
        }
      });

      if (error) throw error;

      setResponse(data.response);
      
      // Text-to-speech for the response
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(data.response);
        utterance.lang = getLanguageCode(selectedLanguage);
        speechSynthesis.speak(utterance);
      }
      
    } catch (error) {
      console.error('Error getting response:', error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setTranscript('');
      setTextInput('');
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      handleSubmitQuestion(textInput);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getLanguageCode(selectedLanguage);
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-700 mb-2">KissanAI</h1>
          <p className="text-xl text-green-600">Agriculture CoPilot for India</p>
        </div>

        {/* Main Chat Interface */}
        <Card className="p-6 mb-6 bg-white shadow-lg">
          {/* Voice Input Section */}
          <div className="text-center mb-6">
            <Button
              size="lg"
              className={`w-32 h-32 rounded-full ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-green-500 hover:bg-green-600'
              } text-white shadow-lg`}
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading}
            >
              {isListening ? (
                <MicOff className="w-12 h-12" />
              ) : (
                <Mic className="w-12 h-12" />
              )}
            </Button>
            
            <p className="mt-4 text-lg text-muted-foreground">
              {isListening 
                ? 'Listening... Speak your question' 
                : isLoading 
                ? 'Processing your question...' 
                : 'Tap to ask your question'}
            </p>

            {transcript && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-green-800 font-medium">You said: "{transcript}"</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mb-6">
            <Button
              variant="outline"
              onClick={() => setShowTextInput(!showTextInput)}
              className="flex items-center space-x-2"
            >
              <Keyboard className="w-5 h-5" />
              <span>Type</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Languages className="w-5 h-5" />
              <span>Translate</span>
            </Button>
          </div>

          {/* Text Input */}
          {showTextInput && (
            <div className="mb-6">
              <div className="flex space-x-2">
                <Input
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your question here..."
                  onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
                  className="flex-1"
                />
                <Button onClick={handleTextSubmit} disabled={!textInput.trim() || isLoading}>
                  Send
                </Button>
              </div>
            </div>
          )}

          {/* Response */}
          {response && (
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-green-800">KissanAI Response:</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => speakText(response)}
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-green-700 leading-relaxed">{response}</p>
            </Card>
          )}
        </Card>

        {/* Sample Questions */}
        <Card className="p-6 bg-white shadow-lg">
          <h3 className="text-xl font-semibold text-green-700 mb-4">Sample Questions:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {sampleQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                className="text-left justify-start h-auto p-3 hover:bg-green-50"
                onClick={() => handleSubmitQuestion(question)}
                disabled={isLoading}
              >
                {question}
              </Button>
            ))}
          </div>

          {/* More Examples */}
          <div>
            <Button
              variant="ghost"
              onClick={() => setShowMore(!showMore)}
              className="flex items-center space-x-2 text-green-600 hover:text-green-700"
            >
              <span>More Examples</span>
              {showMore ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            {showMore && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {moreExamples.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="text-left justify-start h-auto p-3 hover:bg-green-50"
                    onClick={() => handleSubmitQuestion(question)}
                    disabled={isLoading}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};