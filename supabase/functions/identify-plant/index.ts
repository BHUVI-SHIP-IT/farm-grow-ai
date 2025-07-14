import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const huggingFaceApiKey = Deno.env.get('HUGGINGFACE_API_KEY');

    if (!huggingFaceApiKey) {
      return new Response(JSON.stringify({ error: 'Hugging Face API key not configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const formData = await req.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const imageBuffer = await imageFile.arrayBuffer();

    // Use Hugging Face plant classification model
    const response = await fetch(
      'https://api-inference.huggingface.co/models/google/vit-base-patch16-224',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${huggingFaceApiKey}`,
          'Content-Type': 'application/octet-stream',
        },
        body: imageBuffer,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', errorText);
      return new Response(JSON.stringify({ error: 'Failed to identify plant' }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    
    // Get the most confident prediction
    const topPrediction = data[0];
    const plantName = topPrediction?.label || 'Unknown plant';
    const confidence = topPrediction?.score || 0;

    // Generate care instructions based on plant identification
    const careInstructions = generateCareInstructions(plantName);
    const healthStatus = confidence > 0.5 ? 'Good identification confidence' : 'Low identification confidence - please try a clearer image';

    return new Response(JSON.stringify({
      plantName,
      confidence: Math.round(confidence * 100),
      careInstructions,
      healthStatus,
      allPredictions: data.slice(0, 3) // Top 3 predictions
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in identify-plant function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateCareInstructions(plantName: string): string {
  // Basic care instructions based on common plant types
  const lowerName = plantName.toLowerCase();
  
  if (lowerName.includes('tomato')) {
    return 'Water regularly but avoid overwatering. Provide support with stakes or cages. Ensure 6-8 hours of sunlight daily. Watch for signs of blight and pests.';
  } else if (lowerName.includes('corn') || lowerName.includes('maize')) {
    return 'Plant in well-draining soil with full sun. Water deeply but less frequently. Apply nitrogen fertilizer during growing season. Watch for corn borers.';
  } else if (lowerName.includes('bean')) {
    return 'Plant in well-draining soil. Water regularly but avoid waterlogged soil. Provide support for climbing varieties. Rich in nitrogen-fixing bacteria.';
  } else if (lowerName.includes('potato')) {
    return 'Plant in loose, well-draining soil. Hill soil around plants as they grow. Water consistently but avoid overwatering. Harvest when foliage dies back.';
  } else if (lowerName.includes('cabbage') || lowerName.includes('lettuce')) {
    return 'Prefers cool weather. Keep soil consistently moist. Provide partial shade in hot climates. Watch for aphids and caterpillars.';
  } else {
    return 'Provide appropriate sunlight, water regularly based on soil moisture, ensure good drainage, and monitor for pests and diseases. Consider local growing conditions and seasonal requirements.';
  }
}