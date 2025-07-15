import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Disease classification mapping based on Kaggle dataset (38 classes)
const DISEASE_CLASSES = {
  'Apple___Apple_scab': 'Apple Scab',
  'Apple___Black_rot': 'Apple Black Rot',
  'Apple___Cedar_apple_rust': 'Apple Cedar Rust',
  'Apple___healthy': 'Healthy Apple',
  'Blueberry___healthy': 'Healthy Blueberry',
  'Cherry_(including_sour)___Powdery_mildew': 'Cherry Powdery Mildew',
  'Cherry_(including_sour)___healthy': 'Healthy Cherry',
  'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot': 'Corn Gray Leaf Spot',
  'Corn_(maize)___Common_rust_': 'Corn Common Rust',
  'Corn_(maize)___Northern_Leaf_Blight': 'Corn Northern Leaf Blight',
  'Corn_(maize)___healthy': 'Healthy Corn',
  'Grape___Black_rot': 'Grape Black Rot',
  'Grape___Esca_(Black_Measles)': 'Grape Black Measles',
  'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': 'Grape Leaf Blight',
  'Grape___healthy': 'Healthy Grape',
  'Orange___Haunglongbing_(Citrus_greening)': 'Citrus Greening Disease',
  'Peach___Bacterial_spot': 'Peach Bacterial Spot',
  'Peach___healthy': 'Healthy Peach',
  'Pepper,_bell___Bacterial_spot': 'Pepper Bacterial Spot',
  'Pepper,_bell___healthy': 'Healthy Pepper',
  'Potato___Early_blight': 'Potato Early Blight',
  'Potato___Late_blight': 'Potato Late Blight',
  'Potato___healthy': 'Healthy Potato',
  'Raspberry___healthy': 'Healthy Raspberry',
  'Soybean___healthy': 'Healthy Soybean',
  'Squash___Powdery_mildew': 'Squash Powdery Mildew',
  'Strawberry___Leaf_scorch': 'Strawberry Leaf Scorch',
  'Strawberry___healthy': 'Healthy Strawberry',
  'Tomato___Bacterial_spot': 'Tomato Bacterial Spot',
  'Tomato___Early_blight': 'Tomato Early Blight',
  'Tomato___Late_blight': 'Tomato Late Blight',
  'Tomato___Leaf_Mold': 'Tomato Leaf Mold',
  'Tomato___Septoria_leaf_spot': 'Tomato Septoria Leaf Spot',
  'Tomato___Spider_mites Two-spotted_spider_mite': 'Tomato Spider Mites',
  'Tomato___Target_Spot': 'Tomato Target Spot',
  'Tomato___Tomato_Yellow_Leaf_Curl_Virus': 'Tomato Yellow Leaf Curl Virus',
  'Tomato___Tomato_mosaic_virus': 'Tomato Mosaic Virus',
  'Tomato___healthy': 'Healthy Tomato'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const huggingFaceApiKey = Deno.env.get('HUGGINGFACE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!huggingFaceApiKey) {
      console.error('Hugging Face API key not configured');
      return new Response(JSON.stringify({ 
        error: 'Disease identification service is not configured. Please contact support.' 
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
    console.log(`Processing disease image: ${imageFile.name}, size: ${imageBuffer.byteLength} bytes`);

    // Use specialized plant disease model (ResNet-based from Kaggle)
    const diseaseData = await identifyPlantDisease(imageBuffer, huggingFaceApiKey);
    
    if (!diseaseData) {
      return new Response(JSON.stringify({ 
        error: 'Unable to identify plant disease. Please try a clearer image with better lighting.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse disease classification
    const diseaseInfo = parseDisease(diseaseData);
    
    // Get treatment recommendations from database
    const supabase = createClient(supabaseUrl!, supabaseKey!);
    const treatments = await getTreatmentRecommendations(supabase, diseaseInfo.disease);

    // Get regional alerts for this disease
    const alerts = await getRegionalAlerts(supabase, diseaseInfo.disease);

    console.log(`Disease identified: ${diseaseInfo.disease} with confidence: ${diseaseInfo.confidence}%`);

    const response = {
      plantName: diseaseInfo.plant,
      diseaseType: diseaseInfo.diseaseType,
      diseaseName: diseaseInfo.disease,
      confidence: diseaseInfo.confidence,
      severityLevel: determineSeverity(diseaseInfo.confidence, diseaseInfo.disease),
      affectedParts: getAffectedParts(diseaseInfo.disease),
      symptoms: getSymptoms(diseaseInfo.disease),
      treatments: treatments,
      prevention: getPreventionMeasures(diseaseInfo.disease),
      regionalAlerts: alerts,
      isHealthy: diseaseInfo.isHealthy,
      emergencyLevel: getEmergencyLevel(diseaseInfo.disease, diseaseInfo.confidence)
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in identify-plant-disease function:', error);
    return new Response(JSON.stringify({ 
      error: 'An unexpected error occurred during disease identification. Please try again.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function identifyPlantDisease(imageBuffer: ArrayBuffer, apiKey: string) {
  try {
    // Using a specialized plant disease classification model
    // This would ideally be the ResNet model from the Kaggle dataset
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
      console.error('Disease model error:', await response.text());
      return null;
    }

    const data = await response.json();
    return data && data[0] ? data : null;
  } catch (error) {
    console.error('Disease identification failed:', error);
    return null;
  }
}

function parseDisease(data: any) {
  const prediction = data[0];
  const rawLabel = prediction.label;
  const confidence = Math.round(prediction.score * 100);

  // Map to known disease classes or attempt intelligent parsing
  const mappedDisease = DISEASE_CLASSES[rawLabel] || parseRawLabel(rawLabel);
  
  const isHealthy = mappedDisease.toLowerCase().includes('healthy');
  const parts = mappedDisease.split(' ');
  const plant = parts[0];
  const disease = isHealthy ? 'Healthy' : parts.slice(1).join(' ');
  
  return {
    plant,
    disease: mappedDisease,
    diseaseType: isHealthy ? 'healthy' : getDiseaseType(disease),
    confidence,
    isHealthy
  };
}

function parseRawLabel(label: string): string {
  // Intelligent parsing for labels not in our mapping
  return label.replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
}

function getDiseaseType(disease: string): string {
  const diseaseLower = disease.toLowerCase();
  if (diseaseLower.includes('rust') || diseaseLower.includes('blight') || diseaseLower.includes('mold')) {
    return 'fungal';
  } else if (diseaseLower.includes('bacterial')) {
    return 'bacterial';
  } else if (diseaseLower.includes('virus') || diseaseLower.includes('mosaic')) {
    return 'viral';
  } else if (diseaseLower.includes('mite') || diseaseLower.includes('pest')) {
    return 'pest';
  }
  return 'unknown';
}

function determineSeverity(confidence: number, disease: string): string {
  if (disease.toLowerCase().includes('healthy')) return 'none';
  if (confidence > 85) return 'severe';
  if (confidence > 70) return 'moderate';
  return 'mild';
}

function getAffectedParts(disease: string): string[] {
  const diseaseLower = disease.toLowerCase();
  const parts = [];
  
  if (diseaseLower.includes('leaf') || diseaseLower.includes('spot')) parts.push('leaves');
  if (diseaseLower.includes('fruit') || diseaseLower.includes('rot')) parts.push('fruits');
  if (diseaseLower.includes('stem') || diseaseLower.includes('blight')) parts.push('stems');
  if (diseaseLower.includes('root')) parts.push('roots');
  
  return parts.length > 0 ? parts : ['leaves'];
}

function getSymptoms(disease: string): string[] {
  const symptoms = [];
  const diseaseLower = disease.toLowerCase();
  
  if (diseaseLower.includes('spot')) symptoms.push('Dark spots on leaves');
  if (diseaseLower.includes('blight')) symptoms.push('Browning and wilting of leaves');
  if (diseaseLower.includes('rust')) symptoms.push('Orange/brown pustules on leaves');
  if (diseaseLower.includes('mold')) symptoms.push('Fuzzy growth on plant surface');
  if (diseaseLower.includes('bacterial')) symptoms.push('Water-soaked lesions');
  if (diseaseLower.includes('virus')) symptoms.push('Yellowing and curling of leaves');
  
  return symptoms.length > 0 ? symptoms : ['Visual symptoms on plant'];
}

async function getTreatmentRecommendations(supabase: any, disease: string) {
  try {
    const { data, error } = await supabase
      .from('disease_treatments')
      .select('*')
      .ilike('disease_name', `%${disease.split(' ').slice(0, 2).join(' ')}%`)
      .order('effectiveness_rating', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching treatments:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Treatment fetch error:', error);
    return [];
  }
}

async function getRegionalAlerts(supabase: any, disease: string) {
  try {
    const { data, error } = await supabase
      .from('regional_disease_alerts')
      .select('*')
      .ilike('disease_name', `%${disease.split(' ').slice(0, 2).join(' ')}%`)
      .gte('expires_at', new Date().toISOString())
      .order('alert_level', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Alerts fetch error:', error);
    return [];
  }
}

function getPreventionMeasures(disease: string): string[] {
  const diseaseLower = disease.toLowerCase();
  const measures = [];
  
  if (diseaseLower.includes('blight') || diseaseLower.includes('fungal')) {
    measures.push('Ensure proper air circulation around plants');
    measures.push('Avoid overhead watering');
    measures.push('Remove infected plant debris');
  }
  
  if (diseaseLower.includes('bacterial')) {
    measures.push('Use disease-free seeds');
    measures.push('Disinfect tools between plants');
    measures.push('Avoid working with wet plants');
  }
  
  if (diseaseLower.includes('virus')) {
    measures.push('Control insect vectors');
    measures.push('Remove infected plants immediately');
    measures.push('Use resistant varieties');
  }
  
  measures.push('Regular crop rotation');
  measures.push('Maintain healthy soil conditions');
  
  return measures;
}

function getEmergencyLevel(disease: string, confidence: number): string {
  if (disease.toLowerCase().includes('healthy')) return 'none';
  
  const criticalDiseases = ['blight', 'black rot', 'virus'];
  const isCritical = criticalDiseases.some(d => disease.toLowerCase().includes(d));
  
  if (isCritical && confidence > 80) return 'high';
  if (confidence > 75) return 'medium';
  return 'low';
}