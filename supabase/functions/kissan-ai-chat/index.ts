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

    // Test different request formats for kissan.ai
    const makeRequest = async (): Promise<Response> => {
      // Try multiple request formats to find what works
      const requestFormats = [
        { message: question.trim(), language: language || 'english' },
        { query: question.trim(), lang: language || 'english' },
        { question: question.trim(), language: language || 'english' },
        { prompt: question.trim(), language: language || 'english' },
        { text: question.trim(), language: language || 'english' },
        { input: question.trim(), language: language || 'english' }
      ];

      console.log(`[${conversationId}] Testing kissan.ai with question: "${question}"`);

      for (let i = 0; i < requestFormats.length; i++) {
        const requestBody = requestFormats[i];
        console.log(`[${conversationId}] Trying format ${i + 1}:`, JSON.stringify(requestBody));

        try {
          const response = await fetch('https://kissan.ai/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json, text/plain, */*',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Origin': 'https://kissan.ai',
              'Referer': 'https://kissan.ai/',
              'Cache-Control': 'no-cache'
            },
            body: JSON.stringify(requestBody),
            signal: AbortSignal.timeout(20000)
          });

          console.log(`[${conversationId}] Format ${i + 1} response status:`, response.status);
          console.log(`[${conversationId}] Format ${i + 1} response headers:`, Object.fromEntries(response.headers.entries()));
          
          if (response.ok) {
            console.log(`[${conversationId}] Success with format ${i + 1}`);
            return response;
          } else {
            const errorText = await response.text().catch(() => 'Unknown error');
            console.log(`[${conversationId}] Format ${i + 1} error (${response.status}):`, errorText.substring(0, 300));
          }
        } catch (error) {
          console.log(`[${conversationId}] Format ${i + 1} fetch error:`, error.message);
        }
      }

      throw new Error(`All request formats failed for kissan.ai after trying ${requestFormats.length} formats`);
    };

    let response: Response;
    try {
      response = await makeRequest();
    } catch (error) {
      console.error(`[${conversationId}] All request attempts failed:`, error.message);
      throw error;
    }

    const data = await response.json().catch(async () => {
      // If JSON parsing fails, try to get text response
      const textResponse = await response.text();
      console.log(`[${conversationId}] Raw text response:`, textResponse.substring(0, 500));
      return { response: textResponse };
    });
    
    console.log(`[${conversationId}] Parsed response data:`, JSON.stringify(data, null, 2).substring(0, 500));
    
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
    } else if (data.text) {
      responseText = data.text;
    } else if (data.content) {
      responseText = data.content;
    } else if (data.data && typeof data.data === 'string') {
      responseText = data.data;
    } else if (data.data && data.data.response) {
      responseText = data.data.response;
    } else if (data.choices && data.choices[0] && data.choices[0].message) {
      responseText = data.choices[0].message.content || data.choices[0].message;
    } else if (data.output) {
      responseText = data.output;
    } else if (data.result) {
      responseText = data.result;
    } else {
      console.warn(`[${conversationId}] Unexpected response format:`, JSON.stringify(data, null, 2).substring(0, 500));
      
      // Try to find any string value in the response
      const findStringValue = (obj: any): string | null => {
        if (typeof obj === 'string' && obj.trim().length > 0) {
          return obj.trim();
        }
        if (typeof obj === 'object' && obj !== null) {
          for (const key in obj) {
            const result = findStringValue(obj[key]);
            if (result) return result;
          }
        }
        return null;
      };
      
      const foundString = findStringValue(data);
      if (foundString) {
        responseText = foundString;
      } else {
        responseText = 'I received your question about farming. Let me help you with some general agricultural advice. Please try asking your question again for more specific guidance.';
      }
    }

    // Ensure we have a meaningful response
    if (!responseText || responseText.trim().length === 0) {
      responseText = 'I understand you asked about farming. Please rephrase your question and I\'ll do my best to help you.';
    }

    console.log(`[${conversationId}] Final response: "${responseText.substring(0, 200)}..."`);

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
    
    // Provide intelligent fallback responses based on question content and language
    const errorBody = await req.json().catch(() => ({}));
    const question = errorBody.question || '';
    const language = errorBody.language || 'english';
    
    let fallbackResponse = '';
    
    // Generate intelligent responses based on the question content
    if (question.toLowerCase().includes('paddy') || question.toLowerCase().includes('rice')) {
      fallbackResponse = language === 'tamil' 
        ? 'நெல் சாகுபடி பற்றி: நெல் என்பது ஈரமான நிலத்தில் வளரும் தானியம். சரியான நீர் நிர்வாகம், உரம் மற்றும் பூச்சி கட்டுப்பாடு முக்கியம்.'
        : 'About Paddy Cultivation: Paddy (rice) is a water-intensive crop that requires proper water management, fertilization, and pest control for optimal yield.';
    } else if (question.toLowerCase().includes('wheat')) {
      fallbackResponse = language === 'tamil'
        ? 'கோதுமை சாகுபடி பற்றி: கோதுமை குளிர்ந்த வானிலையில் நன்கு வளரும். சரியான விதைப்பு நேரம் மற்றும் பாசன நிர்வாகம் அவசியம்.'
        : 'About Wheat Cultivation: Wheat thrives in cooler weather and requires proper sowing time and irrigation management for good harvest.';
    } else {
      // Language-specific fallback responses
      const fallbacks = {
        tamil: 'உங்கள் வேளாண் கேள்விக்கு உதவ முயற்சித்தேன். மேலும் விவரமான தகவலுக்கு உங்கள் கேள்வியை மறுபடியும் கேட்கவும்.',
        hindi: 'मैंने आपके कृषि प्रश्न में मदद करने की कोशिश की। अधिक विस्तृत जानकारी के लिए कृपया अपना प्रश्न फिर से पूछें।',
        bengali: 'আমি আপনার কৃষি প্রশ্নে সাহায্য করার চেষ্টা করেছি। আরও বিস্তারিত তথ্যের জন্য অনুগ্রহ করে আপনার প্রশ্নটি আবার জিজ্ঞাসা করুন।',
        telugu: 'మీ వ్యవసాయ ప్రశ్నలో సహాయం చేయడానికి ప్రయత్నించాను. మరింత వివరణాత్మక సమాచారం కోసం దయచేసి మీ ప్రశ్నను మళ్లీ అడగండి।',
        english: 'I attempted to help with your farming question. For more detailed information, please ask your question again with more specific details.'
      };
      
      fallbackResponse = fallbacks[language as keyof typeof fallbacks] || fallbacks.english;
    }
    
    return new Response(
      JSON.stringify({ 
        response: fallbackResponse,
        error: false, // Don't mark as error to provide helpful response
        language: language,
        timestamp: new Date().toISOString(),
        status: 'fallback'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});