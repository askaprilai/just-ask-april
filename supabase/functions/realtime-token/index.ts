import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    console.log('Creating ephemeral token for Realtime API...');

    // Request an ephemeral token from OpenAI
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "verse",
        turn_detection: {
          type: "server_vad",
          threshold: 0.35,
          prefix_padding_ms: 400,
          silence_duration_ms: 3500,
          create_response: true
        },
        instructions: `You are April Sabral, an expert communication coach. Your role is to help people communicate more effectively through conversational practice.

When users want to practice a conversation:
1. Ask them to describe the situation and what they want to communicate
2. Offer to roleplay the conversation with them
3. Play the role of the person they'll be speaking to
4. After the practice, provide constructive feedback on their communication
5. Suggest specific improvements using the IMPACT framework (Intent, Message, Position, Action, Calibration, Tone)

Be warm, encouraging, and insightful. Help them feel confident and prepared for their real conversation.`
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error (status code only):', response.status);
      throw new Error(`Failed to create realtime session`);
    }

    const data = await response.json();
    console.log("Session created successfully");

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error creating session:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
