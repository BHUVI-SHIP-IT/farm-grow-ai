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
    const { message, model, conversationId, userContext, apiKey } = await req.json();

    console.log('Chat request received:', { 
      hasMessage: !!message, 
      model, 
      hasApiKey: !!apiKey,
      messageLength: message?.length 
    });

    if (!apiKey) {
      console.error('No API key provided');
      return new Response(JSON.stringify({ error: 'OpenRouter API key is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!message || message.trim() === '') {
      console.error('No message provided');
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create enhanced system prompt for better responses
    const systemPrompt = `You are an expert agricultural AI assistant with deep knowledge of farming, agriculture, and sustainable practices. You provide comprehensive, well-structured responses that are both informative and practical.

USER CONTEXT: ${userContext ? `Location: ${userContext.location || 'Not specified'}, Farm type: ${userContext.farmType || 'Not specified'}` : 'General farming inquiry'}

RESPONSE GUIDELINES:
1. **Structure your responses clearly** with emojis, headings, and sections
2. **Be comprehensive** - cover multiple aspects of the topic (origin, cultivation, varieties, challenges, etc.)
3. **Use markdown formatting** with **bold text**, bullet points, and proper sections
4. **Include relevant emojis** to make content engaging (🌱🌾🦠🌡️💰🍌🥕etc.)
5. **Provide practical advice** that farmers can actually implement
6. **Cover multiple angles**: scientific facts, practical tips, common challenges, solutions
7. **Be encouraging and supportive** in your tone

EXAMPLE STRUCTURE:
🌱 **Topic Introduction** with key insight

**📍 Origin/Background**
- Key historical or scientific information

**🌾 Cultivation Requirements** 
- Climate, soil, water needs
- Best practices

**🍃 Varieties/Types**
- Different options available
- Pros and cons of each

**💡 Pro Tips**
- Expert advice and best practices

**⚠️ Common Challenges**
- Issues farmers face and solutions

**💰 Economic Considerations**
- Market insights, profitability tips

Always aim to be the most helpful, knowledgeable agricultural advisor possible. Provide actionable, research-backed information that helps farmers succeed.`;

    console.log('Calling OpenRouter API with model:', model || 'meta-llama/llama-3.2-3b-instruct:free');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovableproject.com',
        'X-Title': 'FarmAI Assistant',
      },
      body: JSON.stringify({
        model: model || 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 2500,
        temperature: 0.7,
      }),
    });

    console.log('OpenRouter response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      
      let errorMessage = 'Failed to get AI response';
      if (response.status === 401) {
        errorMessage = 'Invalid API key. Please check your OpenRouter API key.';
      } else if (response.status === 402) {
        errorMessage = 'Insufficient credits. Please check your OpenRouter account balance.';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again in a moment.';
      }
      
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('OpenRouter response data:', { 
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length,
      hasContent: !!data.choices?.[0]?.message?.content
    });
    
    const aiResponse = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    return new Response(JSON.stringify({ 
      response: aiResponse,
      model: model,
      conversationId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-with-ai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});