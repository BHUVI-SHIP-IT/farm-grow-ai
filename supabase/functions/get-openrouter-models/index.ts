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
    const { apiKey } = await req.json();

    if (!apiKey || apiKey.trim() === '') {
      return new Response(JSON.stringify({ error: 'OpenRouter API key is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching models from OpenRouter...');
    
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://lovableproject.com',
        'X-Title': 'Farmer Agent App',
      },
    });

    console.log('OpenRouter response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      
      if (response.status === 401) {
        return new Response(JSON.stringify({ error: 'Invalid API key. Please check your OpenRouter API key.' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: `OpenRouter API error: ${response.status}` }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('Models fetched successfully:', data.data?.length || 0);
    
    if (!data.data || !Array.isArray(data.data)) {
      return new Response(JSON.stringify({ error: 'Invalid response format from OpenRouter' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Filter and format models for easier use
    const formattedModels = data.data.map((model: any) => ({
      id: model.id,
      name: model.name || model.id,
      description: model.description,
      pricing: model.pricing,
      context_length: model.context_length,
      architecture: model.architecture,
      top_provider: model.top_provider,
    }));

    return new Response(JSON.stringify({ models: formattedModels }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-openrouter-models function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});