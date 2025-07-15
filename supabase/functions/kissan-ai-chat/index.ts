import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, language } = await req.json();

    if (!question) {
      throw new Error('Question is required');
    }

    console.log(`Processing question: ${question} in language: ${language}`);

    // Proxy request to kissan.ai/chat
    const response = await fetch('https://kissan.ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'KissanAI-CoPilot/1.0',
      },
      body: JSON.stringify({
        message: question,
        language: language || 'english',
        context: 'agriculture_advice'
      }),
    });

    if (!response.ok) {
      console.error('Kissan.ai API error:', response.status, response.statusText);
      throw new Error(`Failed to get response from agriculture service: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the response text from kissan.ai response
    let responseText = '';
    if (typeof data === 'string') {
      responseText = data;
    } else if (data.response) {
      responseText = data.response;
    } else if (data.message) {
      responseText = data.message;
    } else if (data.answer) {
      responseText = data.answer;
    } else {
      responseText = 'I apologize, but I cannot provide a response at the moment. Please try asking your question again.';
    }

    console.log('Successfully processed question and got response');

    return new Response(
      JSON.stringify({ 
        response: responseText,
        language: language || 'english'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in kissan-ai-chat function:', error);
    
    // Provide a fallback response for agriculture questions
    const fallbackResponse = "I'm sorry, I'm having trouble processing your question right now. For immediate farming advice, please contact your local agricultural extension office or visit your nearest Krishi Vigyan Kendra (KVK).";
    
    return new Response(
      JSON.stringify({ 
        response: fallbackResponse,
        error: true 
      }),
      {
        status: 200, // Return 200 to provide fallback response
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});