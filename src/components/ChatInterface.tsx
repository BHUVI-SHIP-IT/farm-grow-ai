import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Mic, MicOff, User, Bot, Loader2, Sparkles, Lightbulb, Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'image';
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "🌱 Welcome to your **AI Farm Assistant**! I'm here to help you with:\n\n🌾 **Crop Management** - Planting, growing, and harvesting advice\n🦠 **Disease & Pest Control** - Identify and treat plant issues\n🌡️ **Weather & Climate** - Seasonal planning and adaptation\n🌿 **Sustainable Practices** - Eco-friendly farming methods\n💰 **Market Insights** - Crop pricing and market trends\n\nWhat agricultural challenge can I help you solve today?",
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      // Get API key and model from localStorage
      const openRouterKey = localStorage.getItem("openRouterKey");
      const selectedModel = localStorage.getItem("selectedModel") || "meta-llama/llama-3.2-3b-instruct:free";
      
      if (!openRouterKey || openRouterKey.trim() === "") {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "⚠️ Please configure your OpenRouter API key in the Settings tab first.",
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }

      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message: currentMessage,
          model: selectedModel,
          apiKey: openRouterKey,
          userContext: {
            location: null,
            farmType: null
          }
        }
      });

      if (error) throw error;

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || "Sorry, I couldn't generate a response.",
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting to the AI service. Please check your API keys in Settings.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      toast({
        title: "Voice Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-[700px] flex flex-col bg-gradient-to-br from-background via-background to-muted/20 rounded-xl border shadow-xl">
      {/* Enhanced Chat Header */}
      <div className="p-6 border-b bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-teal-500/10 rounded-t-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              AI Farm Assistant Pro
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Leaf className="w-3 h-3" />
              Your intelligent agricultural companion
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              AI Ready
            </Badge>
          </div>
        </div>
      </div>

      {/* Enhanced Messages Area */}
      <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'bot' && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[85%] rounded-2xl p-5 shadow-sm ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white ml-auto'
                    : 'bg-white border border-gray-100 shadow-md'
                }`}
              >
                <div className={`prose prose-sm max-w-none ${
                  message.sender === 'user' 
                    ? 'prose-invert' 
                    : 'prose-slate'
                }`}>
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed text-sm">{children}</p>,
                      strong: ({ children }) => <strong className="font-bold text-emerald-700">{children}</strong>,
                      em: ({ children }) => <em className="italic text-emerald-600">{children}</em>,
                      ul: ({ children }) => <ul className="my-3 ml-4 space-y-2 list-disc marker:text-emerald-500">{children}</ul>,
                      ol: ({ children }) => <ol className="my-3 ml-4 space-y-2 list-decimal marker:text-emerald-500">{children}</ol>,
                      li: ({ children }) => <li className="text-sm leading-relaxed pl-2">{children}</li>,
                      h1: ({ children }) => <h1 className="text-lg font-bold mb-3 text-emerald-800 border-b border-emerald-200 pb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-bold mb-3 text-emerald-700">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-semibold mb-2 text-emerald-600">{children}</h3>,
                      h4: ({ children }) => <h4 className="text-sm font-medium mb-2 text-gray-700">{children}</h4>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-emerald-300 pl-4 py-2 my-3 bg-emerald-50 italic text-emerald-800">
                          {children}
                        </blockquote>
                      ),
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-4">
                          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => <thead className="bg-emerald-50">{children}</thead>,
                      th: ({ children }) => <th className="px-4 py-3 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider border-b border-gray-200">{children}</th>,
                      td: ({ children }) => <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">{children}</td>,
                      tr: ({ children }) => <tr className="hover:bg-gray-50">{children}</tr>,
                      code: ({ children }) => (
                        <code className="bg-gray-100 text-emerald-700 px-2 py-1 rounded text-xs font-mono">
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto my-3 text-sm">
                          {children}
                        </pre>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
                <p className={`text-xs mt-2 ${
                  message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {message.sender === 'user' && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-md">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                  <span className="text-sm text-gray-600">Analyzing your question...</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Enhanced Input Area */}
      <div className="p-6 border-t bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-b-xl">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Textarea
              placeholder="Ask me anything about farming: crop diseases, planting schedules, soil health, pest control..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={3}
              className="min-h-[80px] resize-none rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:ring-emerald-400 text-base p-4"
              disabled={isLoading}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-white/80">
                <Lightbulb className="w-3 h-3 mr-1" />
                Pro Tips
              </Badge>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleVoiceInput}
              variant={isListening ? "destructive" : "outline"}
              size="lg"
              disabled={isLoading}
              className="h-[60px] w-[60px] rounded-xl shadow-sm"
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="h-[60px] w-[60px] rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg"
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Press Enter to send • Use voice input for hands-free operation
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>AI Model: {localStorage.getItem("selectedModel")?.split("/").pop() || "Ready"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}