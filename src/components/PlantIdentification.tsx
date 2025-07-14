import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, X, Leaf, Droplets, Sun, Bug, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PlantResult {
  name: string;
  confidence: number;
  scientificName?: string;
  health: 'healthy' | 'diseased' | 'pest' | 'nutrient-deficiency';
  care: {
    watering: string;
    sunlight: string;
    fertilizer: string;
    pruning: string;
  };
  issues?: string[];
  recommendations: string[];
}

export function PlantIdentification() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PlantResult | null>(null);
  const { toast } = useToast();

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [toast]);

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis - In production, this would call your backend API
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock result
      const mockResult: PlantResult = {
        name: "Tomato Plant",
        confidence: 92,
        scientificName: "Solanum lycopersicum",
        health: "healthy",
        care: {
          watering: "Water deeply 1-2 times per week, ensuring soil drains well",
          sunlight: "Requires 6-8 hours of direct sunlight daily",
          fertilizer: "Use balanced fertilizer (10-10-10) every 2-3 weeks during growing season",
          pruning: "Remove suckers and lower leaves regularly for better air circulation"
        },
        recommendations: [
          "Monitor for early blight and tomato hornworms",
          "Provide support stakes or cages as plants grow",
          "Mulch around base to retain moisture and prevent weeds",
          "Harvest when fruits are fully colored but still firm"
        ]
      };

      setResult(mockResult);
      
      toast({
        title: "Analysis Complete",
        description: `Identified as ${mockResult.name} with ${mockResult.confidence}% confidence.`,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
  };

  const getHealthIcon = (health: PlantResult['health']) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'diseased':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'pest':
        return <Bug className="w-5 h-5 text-orange-500" />;
      case 'nutrient-deficiency':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getHealthColor = (health: PlantResult['health']) => {
    switch (health) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'diseased':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pest':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'nutrient-deficiency':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Leaf className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Plant Identification</h2>
          </div>
          <p className="text-muted-foreground">
            Upload a photo of your plant for instant identification and care advice
          </p>
        </div>

        {/* Image Upload Area */}
        {!imagePreview ? (
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Upload Plant Photo</h3>
                <p className="text-muted-foreground mb-4">
                  Take a clear photo of leaves, flowers, or the whole plant
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="farmer" asChild>
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </label>
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported: JPG, PNG, WebP (Max 10MB)
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="relative rounded-lg overflow-hidden border">
              <img
                src={imagePreview}
                alt="Plant to identify"
                className="w-full h-64 object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={resetImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Analysis Button */}
            {!result && (
              <Button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                variant="farmer"
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing Plant...
                  </>
                ) : (
                  <>
                    <Leaf className="w-4 h-4 mr-2" />
                    Identify Plant
                  </>
                )}
              </Button>
            )}

            {/* Analysis Progress */}
            {isAnalyzing && (
              <div className="space-y-2">
                <Progress value={33} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  Analyzing plant characteristics...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6 border-t pt-6">
            {/* Plant Identification */}
            <div className="text-center space-y-2">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {result.confidence}% Confidence
              </Badge>
              <h3 className="text-2xl font-bold text-primary">{result.name}</h3>
              {result.scientificName && (
                <p className="text-muted-foreground italic">{result.scientificName}</p>
              )}
              
              {/* Health Status */}
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getHealthColor(result.health)}`}>
                {getHealthIcon(result.health)}
                <span className="font-medium capitalize">
                  {result.health.replace('-', ' ')}
                </span>
              </div>
            </div>

            {/* Care Instructions */}
            <Tabs defaultValue="care" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="care">Care Guide</TabsTrigger>
                <TabsTrigger value="recommendations">Tips</TabsTrigger>
              </TabsList>
              
              <TabsContent value="care" className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex gap-3 p-3 rounded-lg bg-blue-50 border">
                    <Droplets className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Watering</h4>
                      <p className="text-sm text-blue-700">{result.care.watering}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 p-3 rounded-lg bg-yellow-50 border">
                    <Sun className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-yellow-900">Sunlight</h4>
                      <p className="text-sm text-yellow-700">{result.care.sunlight}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 p-3 rounded-lg bg-green-50 border">
                    <Leaf className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-green-900">Fertilizer</h4>
                      <p className="text-sm text-green-700">{result.care.fertilizer}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="recommendations" className="space-y-3">
                {result.recommendations.map((tip, index) => (
                  <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <p className="text-sm">{tip}</p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>

            {/* New Analysis Button */}
            <Button
              onClick={resetImage}
              variant="outline"
              className="w-full"
            >
              Analyze Another Plant
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}