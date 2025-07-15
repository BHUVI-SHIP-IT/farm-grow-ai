import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');

// Language-specific agricultural expert prompts
const getLanguagePrompt = (language: string, nativeName: string) => {
  const prompts = {
    tamil: `நீங்கள் ஒரு தமிழ் விவசாய நிபுணர். விவசாயிகளுக்கு தமிழில் மட்டுமே பதில் அளிக்கவும். உங்கள் பதில்கள் எளிமையாகவும், புரிந்துகொள்ளக்கூடியதாகவும், நடைமுறை ரீதியாகவும் இருக்க வேண்டும்.`,
    hindi: `आप एक हिंदी कृषि विशेषज्ञ हैं। किसानों को केवल हिंदी में उत्तर दें। आपके उत्तर सरल, समझने योग्य और व्यावहारिक होने चाहिए।`,
    bengali: `আপনি একজন বাংলা কৃষি বিশেষজ্ঞ। কৃষকদের শুধুমাত্র বাংলায় উত্তর দিন। আপনার উত্তরগুলো সহজ, বোধগম্য এবং ব্যবহারিক হতে হবে।`,
    telugu: `మీరు తెలుగు వ్యవసాయ నిపుణుడు. రైతులకు తెలుగులో మాత్రమే సమాధానం ఇవ్వండి. మీ సమాధానాలు సరళంగా, అర్థమయ్యేలా మరియు ఆచరణాత్మకంగా ఉండాలి।`,
    kannada: `ನೀವು ಕನ್ನಡ ಕೃಷಿ ತಜ್ಞರು. ರೈತರಿಗೆ ಕೇವಲ ಕನ್ನಡದಲ್ಲಿ ಮಾತ್ರ ಉತ್ತರಿಸಿ. ನಿಮ್ಮ ಉತ್ತರಗಳು ಸರಳ, ಅರ್ಥವಾಗುವ ಮತ್ತು ಪ್ರಾಯೋಗಿಕವಾಗಿರಬೇಕು।`,
    marathi: `तुम्ही मराठी शेती तज्ञ आहात. शेतकऱ्यांना फक्त मराठीत उत्तर द्या. तुमची उत्तरे सोपी, समजण्यासारखी आणि व्यावहारिक असावीत।`,
    gujarati: `તમે ગુજરાતી કૃષિ નિષ્ણાત છો. ખેડૂતોને માત્ર ગુજરાતીમાં જ જવાબ આપો. તમારા જવાબો સરળ, સમજી શકાય તેવા અને વ્યવહારિક હોવા જોઈએ।`,
    punjabi: `ਤੁਸੀਂ ਪੰਜਾਬੀ ਖੇਤੀ ਮਾਹਰ ਹੋ। ਕਿਸਾਨਾਂ ਨੂੰ ਸਿਰਫ਼ ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ। ਤੁਹਾਡੇ ਜਵਾਬ ਸਰਲ, ਸਮਝਣ ਯੋਗ ਅਤੇ ਵਿਹਾਰਕ ਹੋਣੇ ਚਾਹੀਦੇ ਹਨ।`,
    malayalam: `നിങ്ങൾ ഒരു മലയാളം കൃഷി വിദഗ്ധനാണ്. കർഷകർക്ക് മലയാളത്തിൽ മാത്രം ഉത്തരം നൽകുക. നിങ്ങളുടെ ഉത്തരങ്ങൾ ലളിതവും മനസ്സിലാക്കാവുന്നതും പ്രായോഗികവുമായിരിക്കണം।`,
    spanish: `Eres un experto agrícola en español. Responde a los agricultores solo en español. Tus respuestas deben ser simples, comprensibles y prácticas.`,
    portuguese: `Você é um especialista agrícola em português. Responda aos agricultores apenas em português. Suas respostas devem ser simples, compreensíveis e práticas.`,
    japanese: `あなたは日本の農業専門家です。農家には日本語でのみ回答してください。あなたの回答は簡潔で理解しやすく実用的である必要があります。`,
    indonesian: `Anda adalah ahli pertanian Indonesia. Jawab petani hanya dalam bahasa Indonesia. Jawaban Anda harus sederhana, mudah dipahami, dan praktis.`,
    english: `You are an agricultural expert. Respond to farmers in English. Your answers should be simple, understandable, and practical.`
  };
  
  return prompts[language as keyof typeof prompts] || prompts.english;
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

    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    // Get language-specific prompt
    const systemPrompt = getLanguagePrompt(language, languageConfig?.nativeName || language);
    
    // Enhanced request to OpenRouter AI with language-specific responses
    const makeRequest = async (attempt: number = 1): Promise<any> => {
      console.log(`[${conversationId}] Attempt ${attempt} - Sending request to OpenRouter for ${language}`);

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://growsmart.ai',
          'X-Title': 'Grow Smart AI'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1:free',
          messages: [
            {
              role: 'system',
              content: `${systemPrompt} Always respond in the native language of the user. You are a knowledgeable agricultural expert with expertise in modern farming techniques, crop management, pest control, irrigation, soil health, and sustainable agriculture practices. Provide practical, actionable advice that farmers can implement immediately.`
            },
            {
              role: 'user',
              content: question.trim()
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 0.9
        }),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`[${conversationId}] OpenRouter API error ${response.status}: ${errorText}`);
        
        if (attempt < 3 && (response.status >= 500 || response.status === 429)) {
          console.log(`[${conversationId}] Retrying in ${attempt * 1000}ms...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          return makeRequest(attempt + 1);
        }
        
        throw new Error(`AI service unavailable (${response.status}). Please try again.`);
      }

      return response.json();
    };

    let aiResponse: any;
    try {
      aiResponse = await makeRequest();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again with a shorter question.');
      }
      throw error;
    }

    // Extract the response text
    let responseText = '';
    if (aiResponse?.choices?.[0]?.message?.content) {
      responseText = aiResponse.choices[0].message.content.trim();
    } else {
      console.warn(`[${conversationId}] Unexpected AI response format:`, aiResponse);
      // Use fallback in the user's language
      const fallbacks = {
        tamil: 'மன்னிக்கவும், தற்போது உங்கள் கேள்விக்கு பதிலளிக்க முடியவில்லை. உடனடி விவசாய ஆலோசனைக்கு உங்கள் உள்ளூர் வேளாண் நீட்டிப்பு அலுவலகத்தை தொடர்பு கொள்ளவும்.',
        hindi: 'खुशी है, अभी आपके प्रश्न का उत्तर देने में असमर्थ हूँ। तत्काल कृषि सलाह के लिए अपने स्थानीय कृषि विस्तार कार्यालय से संपर्क करें।',
        bengali: 'দুঃখিত, বর্তমানে আপনার প্রশ্নের উত্তর দিতে অক্ষম। তাৎক্ষণিক কৃষি পরামর্শের জন্য আপনার স্থানীয় কৃষি সম্প্রসারণ অফিসে যোগাযোগ করুন।',
        telugu: 'క్షమించండి, ప్రస్తుతం మీ ప్రశ్నకు సమాధానం ఇవ్వలేకపోతున్నాను. తక్షణ వ్యవసాయ సలహా కోసం మీ స్థానిక వ్యవసాయ విస్తరణ కార్యాలయాన్ని సంప్రదించండి।',
        kannada: 'ಕ್ಷಮಿಸಿ, ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಉತ್ತರಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ತಕ್ಷಣದ ಕೃಷಿ ಸಲಹೆಗಾಗಿ ನಿಮ್ಮ ಸ್ಥಳೀಯ ಕೃಷಿ ವಿಸ್ತರಣೆ ಕಚೇರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ।',
        english: 'I\'m temporarily unable to process your specific question. For immediate farming advice, please contact your local agricultural extension office.'
      };
      responseText = fallbacks[language as keyof typeof fallbacks] || fallbacks.english;
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