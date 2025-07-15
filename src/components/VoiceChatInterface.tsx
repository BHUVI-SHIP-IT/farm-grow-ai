import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Keyboard, 
  Languages, 
  ChevronDown, 
  ChevronUp, 
  Volume2, 
  VolumeX,
  Loader2,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { getLanguageConfig, getVoiceChatTranslation } from '@/utils/languageConfig';

interface VoiceChatInterfaceProps {
  selectedLanguage: string;
}

const sampleQuestions = {
  english: [
    "What is the best time to plant tomatoes?",
    "How to control pest in wheat crop?", 
    "What fertilizer should I use for rice?",
    "How to identify crop diseases?"
  ],
  hindi: [
    "टमाटर लगाने का सबसे अच्छा समय कब है?",
    "गेहूं की फसल में कीड़े कैसे नियंत्रित करें?",
    "चावल के लिए कौन सा उर्वरक उपयोग करना चाहिए?",
    "फसल की बीमारियों की पहचान कैसे करें?"
  ],
  tamil: [
    "தக்காளி நடுவதற்கு எப்போது சிறந்த நேரம்?",
    "கோதுமை பயிரில் பூச்சிகளை எவ்வாறு கட்டுப்படுத்துவது?",
    "அரிசிக்கு எந்த உரம் பயன்படுத்த வேண்டும்?",
    "பயிர் நோய்களை எவ்வாறு அடையாளம் காண்பது?"
  ]
};

const moreExamples = {
  english: [
    "Best irrigation practices for cotton",
    "Soil preparation for vegetable farming", 
    "Weather-based farming advice",
    "Organic farming techniques",
    "Market price trends for crops",
    "Government schemes for farmers"
  ],
  hindi: [
    "कपास के लिए सर्वोत्तम सिंचाई प्रथाएं",
    "सब्जी की खेती के लिए मिट्टी की तैयारी",
    "मौसम आधारित खेती सलाह", 
    "जैविक खेती तकनीक",
    "फसलों के बाजार मूल्य रुझान",
    "किसानों के लिए सरकारी योजनाएं"
  ],
  tamil: [
    "பருத்திக்கான சிறந்த நீர்ப்பாசன முறைகள்",
    "காய்கறி விவசாயத்திற்கான மண் தயாரிப்பு",
    "வானிலை அடிப்படையிலான விவசாய ஆலோசனை",
    "இயற்கை விவசாய நுட்பங்கள்",
    "பயிர்களின் சந்தை விலை போக்குகள்",
    "விவசாயிகளுக்கான அரசு திட்டங்கள்"
  ]
};

export const VoiceChatInterface: React.FC<VoiceChatInterfaceProps> = ({ selectedLanguage }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [textInput, setTextInput] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{id: string, question: string, answer: string, timestamp: Date}>>([]);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('online');
  const [retryCount, setRetryCount] = useState(0);
  
  const { toast } = useToast();
  const languageConfig = getLanguageConfig(selectedLanguage);
  const translation = getVoiceChatTranslation(selectedLanguage);
  
  const {
    isListening,
    transcript,
    confidence,
    error: voiceError,
    isSupported: voiceSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceRecognition({
    language: selectedLanguage,
    continuous: false,
    interimResults: true,
    onResult: (finalTranscript, conf) => {
      console.log('Voice recognition result:', finalTranscript, 'Confidence:', conf);
      if (finalTranscript.trim() && conf > 0.5) {
        handleSubmitQuestion(finalTranscript.trim());
      }
    },
    onError: (error) => {
      console.error('Voice recognition error:', error);
      toast({
        title: translation.errorTitle,
        description: error,
        variant: "destructive",
      });
    }
  });

  const {
    isSpeaking,
    speak,
    stop: stopSpeaking,
    cancel: cancelSpeaking,
    isSupported: ttsSupported
  } = useTextToSpeech(selectedLanguage);

  // Monitor network connection
  useEffect(() => {
    const handleOnline = () => setConnectionStatus('online');
    const handleOffline = () => setConnectionStatus('offline');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmitQuestion = useCallback(async (question: string) => {
    if (!question.trim()) return;
    
    const questionId = Date.now().toString();
    setIsLoading(true);
    setRetryCount(0);
    
    // Add question to history immediately
    const newEntry = {
      id: questionId,
      question: question.trim(),
      answer: '',
      timestamp: new Date()
    };
    
    setConversationHistory(prev => [newEntry, ...prev]);
    
    const attemptRequest = async (attempt: number = 1): Promise<void> => {
      try {
        const { data, error } = await supabase.functions.invoke('kissan-ai-chat', {
          body: { 
            question: question.trim(),
            language: selectedLanguage,
            languageConfig: languageConfig,
            conversationId: questionId
          }
        });

        if (error) throw error;

        const responseText = data.response || 'I apologize, but I cannot provide a response at the moment.';
        setResponse(responseText);
        
        // Update conversation history
        setConversationHistory(prev => 
          prev.map(entry => 
            entry.id === questionId 
              ? { ...entry, answer: responseText }
              : entry
          )
        );
        
        // Speak the response if TTS is supported
        if (ttsSupported && responseText) {
          try {
            await speak(responseText, { rate: 0.9, pitch: 1.0 });
          } catch (ttsError) {
            console.warn('TTS failed:', ttsError);
          }
        }
        
      } catch (error) {
        console.error('Error getting response:', error);
        
        if (attempt < 3 && connectionStatus === 'online') {
          console.log(`Retrying request, attempt ${attempt + 1}`);
          setRetryCount(attempt);
          setTimeout(() => attemptRequest(attempt + 1), 1000 * attempt);
          return;
        }
        
        const errorMessage = connectionStatus === 'offline' 
          ? 'You appear to be offline. Please check your internet connection.'
          : 'Unable to get response. Please try again later.';
          
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Update conversation history with error
        setConversationHistory(prev => 
          prev.map(entry => 
            entry.id === questionId 
              ? { ...entry, answer: `Error: ${errorMessage}` }
              : entry
          )
        );
      }
    };
    
    await attemptRequest();
    setIsLoading(false);
    resetTranscript();
    setTextInput('');
  }, [selectedLanguage, languageConfig, toast, speak, ttsSupported, resetTranscript, connectionStatus]);

  const handleTextSubmit = useCallback(() => {
    if (textInput.trim()) {
      handleSubmitQuestion(textInput);
    }
  }, [textInput, handleSubmitQuestion]);

  const handleVoiceToggle = useCallback(async () => {
    if (isListening) {
      stopListening();
    } else {
      if (!voiceSupported) {
        toast({
          title: "Voice Not Supported",
          description: "Your browser doesn't support voice recognition. Please use text input.",
          variant: "destructive",
        });
        return;
      }
      
      try {
        await startListening();
      } catch (error) {
        console.error('Failed to start listening:', error);
      }
    }
  }, [isListening, stopListening, startListening, voiceSupported, toast]);

  const speakText = useCallback(async (text: string) => {
    if (isSpeaking) {
      cancelSpeaking();
    } else {
      try {
        await speak(text);
      } catch (error) {
        console.error('TTS error:', error);
        toast({
          title: "Speech Error",
          description: "Unable to speak the text. Please check your audio settings.",
          variant: "destructive",
        });
      }
    }
  }, [isSpeaking, speak, cancelSpeaking, toast]);

  const currentSampleQuestions = sampleQuestions[selectedLanguage as keyof typeof sampleQuestions] || sampleQuestions.english;
  const currentMoreExamples = moreExamples[selectedLanguage as keyof typeof moreExamples] || moreExamples.english;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 relative">
      {/* Connection Status Indicator */}
      <div className="fixed top-4 right-4 z-20">
        <Badge variant={connectionStatus === 'online' ? 'default' : 'destructive'} className="flex items-center space-x-1">
          {connectionStatus === 'online' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          <span className="text-xs">{connectionStatus}</span>
        </Badge>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-6 shadow-xl">
            <span className="text-white text-3xl">🌱</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            {translation.title}
          </h1>
          <p className="text-xl text-green-600 font-medium">{translation.subtitle}</p>
        </div>

        {/* Main Chat Interface */}
        <Card className="p-8 mb-6 bg-white/90 shadow-2xl border-0 backdrop-blur-sm">
          {/* Voice Input Section */}
          <div className="text-center mb-8">
            <div className="relative">
              <Button
                size="lg"
                className={`w-40 h-40 rounded-full ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-2xl shadow-red-500/50' 
                    : 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-2xl shadow-green-500/30'
                } text-white transition-all duration-300 hover:scale-105`}
                onClick={handleVoiceToggle}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-16 h-16 animate-spin" />
                ) : isListening ? (
                  <MicOff className="w-16 h-16" />
                ) : (
                  <Mic className="w-16 h-16" />
                )}
              </Button>
              
              {/* Voice Level Indicator */}
              {isListening && (
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`w-2 h-8 bg-green-500 rounded-full animate-pulse`}
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 space-y-2">
              <p className="text-lg font-medium text-gray-700">
                {isListening 
                  ? translation.listeningText
                  : isLoading 
                  ? translation.processingText
                  : translation.tapToAskText}
              </p>
              
              {retryCount > 0 && (
                <div className="flex items-center justify-center space-x-2 text-orange-600">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Retrying... (Attempt {retryCount + 1})</span>
                </div>
              )}
              
              {/* Voice Support Status */}
              {!voiceSupported && (
                <Badge variant="destructive" className="mt-2">
                  Voice recognition not supported
                </Badge>
              )}
            </div>

            {/* Real-time Transcript */}
            {transcript && (
              <Card className="mt-6 p-4 bg-green-50 border-green-200 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-green-800">{translation.youSaidText}</p>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(confidence * 100)}% confidence
                  </Badge>
                </div>
                <p className="text-green-700 font-medium text-lg">"{transcript}"</p>
                {confidence > 0 && (
                  <Progress value={confidence * 100} className="mt-2 h-1" />
                )}
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mb-6">
            <Button
              variant="outline"
              onClick={() => setShowTextInput(!showTextInput)}
              className="flex items-center space-x-2 px-6 py-3 hover:bg-green-50 border-green-200"
            >
              <Keyboard className="w-5 h-5" />
              <span>{translation.typeText}</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex items-center space-x-2 px-6 py-3 hover:bg-green-50 border-green-200"
            >
              <Languages className="w-5 h-5" />
              <span>{translation.translateText}</span>
            </Button>
          </div>

          {/* Text Input */}
          {showTextInput && (
            <Card className="mb-6 p-4 bg-gray-50 border animate-slide-down">
              <div className="flex space-x-2">
                <Input
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={`${translation.typeText}...`}
                  onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
                  className="flex-1 text-lg"
                  dir={languageConfig.rtl ? 'rtl' : 'ltr'}
                />
                <Button 
                  onClick={handleTextSubmit} 
                  disabled={!textInput.trim() || isLoading}
                  className="px-6"
                >
                  Send
                </Button>
              </div>
            </Card>
          )}

          {/* Latest Response */}
          {response && (
            <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 mb-6 animate-fade-in">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-green-800 text-lg">{translation.responseText}</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speakText(response)}
                    disabled={!ttsSupported}
                    className={isSpeaking ? 'text-red-600' : 'text-green-600'}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <p className="text-green-700 leading-relaxed text-lg" dir={languageConfig.rtl ? 'rtl' : 'ltr'}>
                {response}
              </p>
            </Card>
          )}
        </Card>

        {/* Sample Questions */}
        <Card className="p-6 bg-white/90 shadow-2xl border-0 backdrop-blur-sm mb-6">
          <h3 className="text-xl font-bold text-green-700 mb-4">{translation.sampleQuestionsText}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {currentSampleQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                className="text-left justify-start h-auto p-4 hover:bg-green-50 hover:border-green-300 transition-all duration-200 text-wrap"
                onClick={() => handleSubmitQuestion(question)}
                disabled={isLoading}
                dir={languageConfig.rtl ? 'rtl' : 'ltr'}
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
              className="flex items-center space-x-2 text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <span>{translation.moreExamplesText}</span>
              {showMore ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            {showMore && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 animate-slide-down">
                {currentMoreExamples.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="text-left justify-start h-auto p-4 hover:bg-green-50 hover:border-green-300 transition-all duration-200 text-wrap"
                    onClick={() => handleSubmitQuestion(question)}
                    disabled={isLoading}
                    dir={languageConfig.rtl ? 'rtl' : 'ltr'}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Conversation History */}
        {conversationHistory.length > 0 && (
          <Card className="p-6 bg-white/90 shadow-2xl border-0 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-green-700 mb-4">Recent Conversations</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversationHistory.slice(0, 5).map((entry) => (
                <div key={entry.id} className="border-l-4 border-green-500 pl-4 py-2">
                  <p className="font-medium text-gray-800 mb-1" dir={languageConfig.rtl ? 'rtl' : 'ltr'}>
                    Q: {entry.question}
                  </p>
                  {entry.answer && (
                    <p className="text-gray-600 text-sm" dir={languageConfig.rtl ? 'rtl' : 'ltr'}>
                      A: {entry.answer}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {entry.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-green-600 font-medium">
            🌾 {translation.footerText}
          </p>
        </div>
      </div>
    </div>
  );
};