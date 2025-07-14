import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/ChatInterface";
import { PlantIdentification } from "@/components/PlantIdentification";
import { SettingsComponent } from "@/components/Settings";
import { 
  Sprout, 
  MessageSquare, 
  Camera, 
  Leaf, 
  Users, 
  Globe,
  Smartphone,
  Heart,
  Tractor,
  Sun,
  Settings
} from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="min-h-screen bg-gradient-to-br from-sun-light via-background to-leaf-light">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-leaf to-earth flex items-center justify-center">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">FarmAI Assistant</h1>
                <p className="text-sm text-muted-foreground">Your AI-powered farming companion</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="hidden sm:flex">
                <Globe className="w-3 h-3 mr-1" />
                Multi-language Support
              </Badge>
              <Badge variant="secondary" className="hidden sm:flex">
                <Smartphone className="w-3 h-3 mr-1" />
                Mobile Friendly
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground">
              Smart Farming Made 
              <span className="text-primary block mt-2">Simple</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Get personalized agricultural advice, identify plants instantly, and access expert knowledge 
              tailored to your farm's needs. Powered by AI, designed for farmers everywhere.
            </p>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <div className="flex items-center gap-2 bg-white/60 rounded-full px-4 py-2 border">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">AI Chat Assistant</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 rounded-full px-4 py-2 border">
                <Camera className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Plant Identification</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 rounded-full px-4 py-2 border">
                <Leaf className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Care Recommendations</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 rounded-full px-4 py-2 border">
                <Heart className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Free to Use</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main App Interface */}
      <main className="px-4 pb-12">
        <div className="container mx-auto max-w-6xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 h-12">
              <TabsTrigger value="chat" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="identify" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Camera className="w-4 h-4 mr-2" />
                Identify
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold">Chat with Your AI Farm Expert</h3>
                <p className="text-muted-foreground">
                  Ask questions about crops, soil, weather, pests, or any farming challenge
                </p>
              </div>
              <ChatInterface />
            </TabsContent>

            <TabsContent value="identify" className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold">Identify Plants & Get Care Tips</h3>
                <p className="text-muted-foreground">
                  Upload a photo to identify plants and receive personalized care instructions
                </p>
              </div>
              <PlantIdentification />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <SettingsComponent />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Empowering Farmers Worldwide</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform makes agricultural expertise accessible to small-scale farmers everywhere, 
              helping increase yields and improve crop health.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center space-y-4 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-xl font-semibold">Expert Knowledge</h4>
              <p className="text-muted-foreground">
                Access agricultural expertise that was previously only available to large commercial farms
              </p>
            </Card>
            
            <Card className="p-6 text-center space-y-4 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-xl font-semibold">Mobile Accessible</h4>
              <p className="text-muted-foreground">
                Works on any smartphone, even with poor internet connectivity in rural areas
              </p>
            </Card>
            
            <Card className="p-6 text-center space-y-4 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Tractor className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-xl font-semibold">Practical Solutions</h4>
              <p className="text-muted-foreground">
                Get actionable advice tailored to your specific crops, location, and farming conditions
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sprout className="w-6 h-6" />
            <span className="text-lg font-semibold">FarmAI Assistant</span>
          </div>
          <p className="text-sm opacity-80 mb-4">
            Empowering farmers with AI-powered agricultural knowledge and plant identification
          </p>
          <div className="flex justify-center items-center gap-2 text-xs opacity-60">
            <Sun className="w-4 h-4" />
            <span>Built with care for farmers worldwide</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
