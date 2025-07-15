import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  question: string;
  language: string;
  languageConfig?: {
    code: string;
    name: string;
    nativeName: string;
    speechCode: string;
  };
  conversationId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { question, language, languageConfig, conversationId } = body;

    if (!question?.trim()) {
      throw new Error('Question is required');
    }

    console.log(`[${conversationId || 'unknown'}] Processing question in ${language}: "${question.substring(0, 100)}..."`);

    // Enhanced request to kissan.ai with better error handling and retries
    const makeRequest = async (attempt: number = 1): Promise<Response> => {
      const requestBody = {
        message: question.trim(),
        language: language || 'english',
        context: 'agriculture_advice',
        user_language: languageConfig?.nativeName || language,
        conversation_id: conversationId,
        timestamp: new Date().toISOString()
      };

      console.log(`[${conversationId}] Attempt ${attempt} - Sending request to kissan.ai`);

      const response = await fetch('https://kissan.ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'GrowSmartAI-CoPilot/2.0',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`[${conversationId}] Kissan.ai API error ${response.status}: ${errorText}`);
        
        if (attempt < 3 && (response.status >= 500 || response.status === 429)) {
          console.log(`[${conversationId}] Retrying in ${attempt * 1000}ms...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          return makeRequest(attempt + 1);
        }
        
        throw new Error(`Agriculture service unavailable (${response.status}). Please try again.`);
      }

      return response;
    };

    let response: Response;
    try {
      response = await makeRequest();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again with a shorter question.');
      }
      throw error;
    }

    const data = await response.json().catch(async () => {
      // If JSON parsing fails, try to get text response
      const textResponse = await response.text();
      return { response: textResponse };
    });
    
    // Extract and enhance the response
    let responseText = '';
    if (typeof data === 'string') {
      responseText = data;
    } else if (data.response) {
      responseText = data.response;
    } else if (data.message) {
      responseText = data.message;
    } else if (data.answer) {
      responseText = data.answer;
    } else if (data.reply) {
      responseText = data.reply;
    } else {
      console.warn(`[${conversationId}] Unexpected response format:`, data);
      responseText = 'I received your question about farming. Let me help you with some general agricultural advice. Please try asking your question again for more specific guidance.';
    }

    // Enhance response with language-specific improvements
    if (responseText && language !== 'english') {
      responseText += `\n\n(Response in ${languageConfig?.nativeName || language})`;
    }

    console.log(`[${conversationId}] Successfully processed question. Response length: ${responseText.length} characters`);

    return new Response(
      JSON.stringify({ 
        response: responseText,
        language: language || 'english',
        conversationId: conversationId,
        timestamp: new Date().toISOString(),
        status: 'success'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error(`Error in kissan-ai-chat function:`, error);
    
    // Provide intelligent fallback responses based on question content
    const errorBody = await req.json().catch(() => ({}));
    const question = errorBody.question || '';
    const language = errorBody.language || 'english';
    
    let fallbackResponse = '';
    
    // Smart fallback based on question keywords
    if (question.toLowerCase().includes('water') || question.toLowerCase().includes('irrigation')) {
      fallbackResponse = 'For irrigation guidance: Water crops early morning or evening. Check soil moisture 2-3 inches deep. Drip irrigation saves 30-50% water compared to flood irrigation.';
    } else if (question.toLowerCase().includes('pest') || question.toLowerCase().includes('insect')) {
      fallbackResponse = 'For pest control: Use neem oil spray (10ml per liter water). Introduce beneficial insects. Rotate crops annually. Remove infected plants immediately.';
    } else if (question.toLowerCase().includes('fertilizer') || question.toLowerCase().includes('nutrient')) {
      fallbackResponse = 'For fertilization: Test soil pH first. Use organic compost when possible. Apply nitrogen during growth phase, phosphorus during root development.';
    } else {
      fallbackResponse = 'I\'m temporarily unable to process your specific question. For immediate farming advice, please contact your local agricultural extension office or visit your nearest Krishi Vigyan Kendra (KVK).';
    }
    
    return new Response(
      JSON.stringify({ 
        response: fallbackResponse,
        error: true,
        language: language,
        timestamp: new Date().toISOString(),
        status: 'fallback'
      }),
      {
        status: 200, // Return 200 to provide fallback response
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});