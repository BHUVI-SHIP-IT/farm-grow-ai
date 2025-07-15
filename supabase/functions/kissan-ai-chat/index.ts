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

    // Enhanced request to kissan.ai with proper language support
    const makeRequest = async (attempt: number = 1): Promise<Response> => {
      const requestBody = {
        message: question.trim(),
        language: language || 'english',
        lang: language || 'english', // Additional language parameter
        locale: languageConfig?.code || language || 'en',
        user_language: languageConfig?.nativeName || language,
        response_language: language,
        context: 'agriculture_advice',
        conversation_id: conversationId,
        timestamp: new Date().toISOString(),
        // Explicit instruction to respond in native language
        instruction: `Please respond in ${languageConfig?.nativeName || language} language only`
      };

      console.log(`[${conversationId}] Attempt ${attempt} - Sending request to kissan.ai with language: ${language}`);

      const response = await fetch('https://kissan.ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'GrowSmartAI-CoPilot/2.0',
          'Accept': 'application/json',
          'Accept-Language': languageConfig?.code || language || 'en',
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
    } else if (data.text) {
      responseText = data.text;
    } else {
      console.warn(`[${conversationId}] Unexpected response format:`, data);
      responseText = 'I received your question about farming. Let me help you with some general agricultural advice. Please try asking your question again for more specific guidance.';
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
    
    // Provide intelligent fallback responses based on question content and language
    const errorBody = await req.json().catch(() => ({}));
    const question = errorBody.question || '';
    const language = errorBody.language || 'english';
    const languageConfig = errorBody.languageConfig;
    
    let fallbackResponse = '';
    
    // Language-specific fallback responses
    const fallbacks = {
      tamil: 'மன்னிக்கவும், தற்போது உங்கள் கேள்விக்கு பதிலளிக்க முடியவில்லை. உடனடி விவசாய ஆலோசனைக்கு உங்கள் உள்ளூர் வேளாண் நீட்டிப்பு அலுவலகத்தை தொடர்பு கொள்ளவும்.',
      hindi: 'खुशी है, अभी आपके प्रश्न का उत्तर देने में असमर्थ हूँ। तत्काल कृषि सलाह के लिए अपने स्थानीय कृषि विस्तार कार्यालय से संपर्क करें।',
      bengali: 'দুঃখিত, বর্তমানে আপনার প্রশ্নের উত্তর দিতে অক্ষম। তাৎক্ষণিক কৃষি পরামর্শের জন্য আপনার স্থানীয় কৃষি সম্প্রসারণ অফিসে যোগাযোগ করুন।',
      telugu: 'క్షమించండి, ప్రస్తుతం మీ ప్రశ్నకు సమాధానం ఇవ্వలేకపోతున్నాను। తక్షణ వ్యవసాయ సలహా కోసం మీ స్థానిక వ్యవసాయ విస్తరణ కార్యాలయాన్ని సంప్రదించండి।',
      kannada: 'ಕ್ಷಮಿಸಿ, ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಉತ್ತರಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ। ತಕ್ಷಣದ ಕೃಷಿ ಸಲಹೆಗಾಗಿ ನಿಮ್ಮ ಸ್ಥಳೀಯ ಕೃಷಿ ವಿಸ್ತರಣೆ ಕಚೇರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ।',
      marathi: 'माफ करा, सध्या तुमच्या प्रश्नाचे उत्तर देण्यास अक्षम आहे। तत्काळ शेती सल्ल्यासाठी तुमच्या स्थानिक कृषी विस्तार कार्यालयाशी संपर्क साधा।',
      gujarati: 'માફ કરશો, હાલમાં તમારા પ્રશ્નનો જવાબ આપવામાં અસમર્થ છું। તાત્કાલિક કૃષિ સલાહ માટે તમારી સ્થાનિક કૃષિ વિસ્તરણ કચેરી સાથે સંપર્ક કરો।',
      punjabi: 'ਮਾਫ਼ ਕਰਨਾ, ਇਸ ਸਮੇਂ ਤੁਹਾਡੇ ਸਵਾਲ ਦਾ ਜਵਾਬ ਦੇਣ ਵਿੱਚ ਅਸਮਰੱਥ ਹਾਂ। ਤੁਰੰਤ ਖੇਤੀ ਸਲਾਹ ਲਈ ਆਪਣੇ ਸਥਾਨਕ ਖੇਤੀ ਵਿਸਤਾਰ ਦਫ਼ਤਰ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।',
      malayalam: 'ക്ഷമിക്കണം, ഇപ്പോൾ നിങ്ങളുടെ ചോദ്യത്തിന് ഉത്തരം നൽകാൻ കഴിയുന്നില്ല। ഉടനടിയുള്ള കൃഷി ഉപദേശത്തിനായി നിങ്ങളുടെ പ്രാദേശിക കൃഷി വിപുലീകരണ ഓഫീസുമായി ബന്ധപ്പെടുക।',
      spanish: 'Lo siento, actualmente no puedo procesar su pregunta específica. Para asesoramiento agrícola inmediato, póngase en contacto con su oficina de extensión agrícola local.',
      portuguese: 'Desculpe, atualmente não consigo processar sua pergunta específica. Para aconselhamento agrícola imediato, entre em contato com seu escritório de extensão agrícola local.',
      japanese: '申し訳ございませんが、現在あなたの特定の質問を処理できません。即座の農業アドバイスについては、地元の農業普及事務所にお問い合わせください。',
      indonesian: 'Maaf, saat ini tidak dapat memproses pertanyaan spesifik Anda. Untuk saran pertanian segera, hubungi kantor penyuluhan pertanian lokal Anda.',
      english: 'I\'m temporarily unable to process your specific question. For immediate farming advice, please contact your local agricultural extension office.'
    };
    
    fallbackResponse = fallbacks[language as keyof typeof fallbacks] || fallbacks.english;
    
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