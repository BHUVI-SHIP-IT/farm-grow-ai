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
      console.error('Hugging Face API key not configured');
      return new Response(JSON.stringify({ 
        error: 'Plant identification service is not configured. Please contact support.' 
      }), {
        status: 500,
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
    console.log(`Processing image: ${imageFile.name}, size: ${imageBuffer.byteLength} bytes`);

    // Try plant-specific model first
    let plantData = await tryPlantSpecificModel(imageBuffer, huggingFaceApiKey);
    
    // Fallback to general model if plant-specific model fails
    if (!plantData) {
      console.log('Plant-specific model failed, trying general model');
      plantData = await tryGeneralModel(imageBuffer, huggingFaceApiKey);
    }

    if (!plantData) {
      return new Response(JSON.stringify({ 
        error: 'Unable to identify plant. Please try a clearer image with better lighting.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse and clean plant name
    const cleanedPlantName = cleanPlantName(plantData.label);
    const confidence = plantData.score || 0;

    // Generate comprehensive care instructions
    const careInstructions = generateCareInstructions(cleanedPlantName);
    const healthStatus = determineHealthStatus(confidence);

    console.log(`Identified plant: ${cleanedPlantName} with confidence: ${Math.round(confidence * 100)}%`);

    return new Response(JSON.stringify({
      plantName: cleanedPlantName,
      confidence: Math.round(confidence * 100),
      careInstructions,
      healthStatus,
      allPredictions: plantData.allPredictions || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in identify-plant function:', error);
    return new Response(JSON.stringify({ 
      error: 'An unexpected error occurred during plant identification. Please try again.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Try plant-specific model first for better accuracy
async function tryPlantSpecificModel(imageBuffer: ArrayBuffer, apiKey: string) {
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/microsoft/resnet-50',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/octet-stream',
        },
        body: imageBuffer,
      }
    );

    if (!response.ok) {
      console.error('Plant-specific model error:', await response.text());
      return null;
    }

    const data = await response.json();
    if (data && data[0]) {
      return {
        label: data[0].label,
        score: data[0].score,
        allPredictions: data.slice(0, 3)
      };
    }
    return null;
  } catch (error) {
    console.error('Plant-specific model failed:', error);
    return null;
  }
}

// Fallback to general model
async function tryGeneralModel(imageBuffer: ArrayBuffer, apiKey: string) {
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/google/vit-base-patch16-224',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/octet-stream',
        },
        body: imageBuffer,
      }
    );

    if (!response.ok) {
      console.error('General model error:', await response.text());
      return null;
    }

    const data = await response.json();
    if (data && data[0]) {
      return {
        label: data[0].label,
        score: data[0].score,
        allPredictions: data.slice(0, 3)
      };
    }
    return null;
  } catch (error) {
    console.error('General model failed:', error);
    return null;
  }
}

// Clean and normalize plant names
function cleanPlantName(rawName: string): string {
  if (!rawName) return 'Unknown plant';
  
  // Remove common prefixes and suffixes that aren't part of plant names
  let cleaned = rawName
    .replace(/^(egyptian|tiger|tabby|domestic|feral|wild)\s+/i, '')
    .replace(/\s+(cat|dog|animal)$/i, '')
    .replace(/[,\(\)]/g, '')
    .trim();
  
  // If it looks like a plant name, use it; otherwise, try to extract meaningful parts
  if (isLikelyPlantName(cleaned)) {
    return capitalizeWords(cleaned);
  }
  
  // Fallback: return cleaned version or unknown
  return cleaned ? capitalizeWords(cleaned) : 'Unknown plant';
}

// Check if the name looks like a plant name
function isLikelyPlantName(name: string): boolean {
  const plantKeywords = [
    'plant', 'tree', 'flower', 'leaf', 'bush', 'shrub', 'herb', 'grass',
    'fern', 'moss', 'vine', 'cactus', 'succulent', 'palm', 'pine', 'oak',
    'maple', 'rose', 'lily', 'daisy', 'sunflower', 'tulip', 'orchid'
  ];
  
  const lowerName = name.toLowerCase();
  return plantKeywords.some(keyword => lowerName.includes(keyword)) ||
         name.includes(' ') && name.length > 3; // Scientific names often have spaces
}

// Capitalize words properly
function capitalizeWords(text: string): string {
  return text.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Determine health status based on confidence
function determineHealthStatus(confidence: number): string {
  if (confidence > 0.8) {
    return 'Excellent identification confidence';
  } else if (confidence > 0.6) {
    return 'Good identification confidence';
  } else if (confidence > 0.4) {
    return 'Moderate identification confidence';
  } else {
    return 'Low identification confidence - try a clearer image with better lighting';
  }
}

function generateCareInstructions(plantName: string): string {
  const lowerName = plantName.toLowerCase();
  
  // Vegetables and Food Crops
  if (lowerName.includes('tomato')) {
    return 'Water regularly but avoid overwatering. Provide support with stakes or cages. Ensure 6-8 hours of sunlight daily. Watch for signs of blight and pests. Harvest when fruits are firm and fully colored.';
  } else if (lowerName.includes('corn') || lowerName.includes('maize')) {
    return 'Plant in well-draining soil with full sun. Water deeply but less frequently. Apply nitrogen fertilizer during growing season. Watch for corn borers. Plant in blocks for better pollination.';
  } else if (lowerName.includes('bean')) {
    return 'Plant in well-draining soil. Water regularly but avoid waterlogged soil. Provide support for climbing varieties. Rich in nitrogen-fixing bacteria. Harvest pods when young and tender.';
  } else if (lowerName.includes('potato')) {
    return 'Plant in loose, well-draining soil. Hill soil around plants as they grow. Water consistently but avoid overwatering. Harvest when foliage dies back. Store in cool, dark place.';
  } else if (lowerName.includes('cabbage') || lowerName.includes('lettuce')) {
    return 'Prefers cool weather. Keep soil consistently moist. Provide partial shade in hot climates. Watch for aphids and caterpillars. Harvest outer leaves first for continuous growth.';
  } else if (lowerName.includes('pepper') || lowerName.includes('capsicum')) {
    return 'Needs warm weather and full sun. Water regularly but ensure good drainage. Support heavy fruit-bearing plants. Harvest when fruits reach desired size and color.';
  } else if (lowerName.includes('cucumber')) {
    return 'Requires warm soil and consistent moisture. Provide climbing support or let sprawl. Regular harvesting encourages more production. Watch for cucumber beetles.';
  } else if (lowerName.includes('carrot')) {
    return 'Plant in loose, sandy soil. Keep soil consistently moist. Thin seedlings for proper root development. Harvest when roots reach desired size.';
  
  // Herbs
  } else if (lowerName.includes('basil')) {
    return 'Loves warm weather and full sun. Water regularly but avoid wetting leaves. Pinch flowers to encourage leaf growth. Harvest leaves frequently for best flavor.';
  } else if (lowerName.includes('mint')) {
    return 'Prefers partial shade and moist soil. Can be invasive - consider container growing. Harvest regularly to prevent flowering. Very hardy and fast-growing.';
  } else if (lowerName.includes('rosemary')) {
    return 'Requires well-draining soil and full sun. Drought-tolerant once established. Prune regularly to maintain shape. Protect from harsh winter conditions.';
  } else if (lowerName.includes('oregano') || lowerName.includes('thyme')) {
    return 'Thrives in well-draining soil with full sun. Drought-tolerant. Trim regularly to encourage bushy growth. Dry leaves for winter use.';
  
  // Flowers
  } else if (lowerName.includes('rose')) {
    return 'Needs full sun and well-draining soil. Water at base to avoid leaf diseases. Prune in late winter. Feed regularly during growing season. Watch for aphids and black spot.';
  } else if (lowerName.includes('sunflower')) {
    return 'Requires full sun and rich, well-draining soil. Water regularly, especially during flower development. Support tall varieties. Harvest seeds when flower head droops.';
  } else if (lowerName.includes('marigold')) {
    return 'Easy to grow in full sun. Tolerates poor soil. Deadhead spent flowers for continuous blooming. Good companion plant for vegetables.';
  } else if (lowerName.includes('lavender')) {
    return 'Needs full sun and well-draining, alkaline soil. Drought-tolerant once established. Prune after flowering. Harvest flowers just before fully open.';
  
  // Trees and Shrubs
  } else if (lowerName.includes('oak') || lowerName.includes('maple')) {
    return 'Plant in well-draining soil with adequate space for growth. Water young trees regularly. Mulch around base. Prune dead or damaged branches in dormant season.';
  } else if (lowerName.includes('pine') || lowerName.includes('fir')) {
    return 'Prefers acidic, well-draining soil. Minimal pruning needed. Water during dry periods. Watch for needle diseases and pests like bark beetles.';
  } else if (lowerName.includes('citrus')) {
    return 'Needs warm climate and well-draining soil. Regular watering but avoid waterlogging. Feed with citrus-specific fertilizer. Protect from frost.';
  
  // Indoor/Houseplants
  } else if (lowerName.includes('succulent') || lowerName.includes('cactus')) {
    return 'Requires bright light and well-draining soil. Water only when soil is completely dry. Avoid overwatering. Good drainage is essential to prevent root rot.';
  } else if (lowerName.includes('fern')) {
    return 'Prefers indirect light and high humidity. Keep soil consistently moist but not waterlogged. Mist regularly. Good for bathrooms and shaded areas.';
  } else if (lowerName.includes('spider plant') || lowerName.includes('pothos')) {
    return 'Adaptable to various light conditions. Water when top inch of soil is dry. Easy to propagate from cuttings. Good air-purifying plant.';
  
  // Default advice for unknown plants
  } else {
    return 'Provide appropriate sunlight based on plant type, water regularly based on soil moisture, ensure good drainage, and monitor for pests and diseases. Research specific care requirements for this plant variety and consider local growing conditions and seasonal requirements.';
  }
}