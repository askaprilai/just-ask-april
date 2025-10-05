import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[REWRITE] Function started');
    
    // Check for authentication (optional for this endpoint)
    const authHeader = req.headers.get('Authorization');
    let user = null;
    let isPro = false;

    if (authHeader) {
      console.log('[REWRITE] Auth header present, checking user...');
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: userData, error: authError } = await supabaseClient.auth.getUser();
      if (!authError && userData.user) {
        user = userData.user;
        console.log('[REWRITE] User authenticated:', user.id);

        // Check subscription status for authenticated users
        const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
          apiVersion: "2025-08-27.basil" 
        });
        
        const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
        
        if (customers.data.length > 0) {
          const subscriptions = await stripe.subscriptions.list({
            customer: customers.data[0].id,
            status: "active",
            limit: 1,
          });
          isPro = subscriptions.data.length > 0;
          console.log('[REWRITE] Pro status:', isPro);
        }

        // Check daily usage for authenticated free users
        if (!isPro) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const { count, error: countError } = await supabaseClient
            .from("rewrites")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .gte("created_at", today.toISOString());

          if (countError) {
            console.error("[REWRITE] Error checking daily usage:", countError);
          }

          const dailyLimit = 5;
          if (count !== null && count >= dailyLimit) {
            console.log('[REWRITE] Daily limit reached:', count);
            return new Response(
              JSON.stringify({ 
                error: "daily_limit_reached",
                message: `You've reached your daily limit of ${dailyLimit} rewrites. Upgrade to Pro for unlimited rewrites!`,
                limit: dailyLimit,
                used: count
              }),
              {
                status: 429,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              }
            );
          }
        }
      } else {
        console.log('[REWRITE] Auth header present but invalid');
      }
    } else {
      console.log('[REWRITE] No auth header - guest user');
    }

    const { user_text, environment, outcome, desired_emotion, allow_infer = true } = await req.json();
    
    if (!user_text || user_text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "user_text is required" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are April, an AI communication expert using The Impact Language Method™ with 5 pillars:
1. INTENT - Clarity begins with intention
2. MESSAGE - Simplify to clarify
3. POSITION - Your tone is your influence
4. ACTION - Turn communication into movement
5. CALIBRATION - Refine and re-align

Your task:
1. If environment/outcome/desired_emotion are missing and allow_infer=true, infer them from the user's text
2. Generate exactly 3 concise rewrites (1-3 sentences each) that:
   - Align with the outcome (Resolve/Motivate/Align/Clarify/Inspire/SetBoundary)
   - Are de-escalatory for Resolve/SetBoundary outcomes
   - Include a clear next step in the Action pillar
3. For each rewrite provide:
   - tone_label (e.g., "Professional & Direct", "Warm & Accountable")
   - 5 pillars, each ONE SHORT LINE describing how this rewrite applies that pillar
   - rationale: one line "Why it works"
   - cautions: brief notes on what to watch for (or empty string)

Environments: Corporate, SmallBusiness, Personal, Relationship
Outcomes: Resolve, Motivate, Align, Clarify, Inspire, SetBoundary
Emotions: Heard, Motivated, Respected, Accountable, Reassured, Understood

Return ONLY valid JSON in this exact structure:
{
  "inferred": {
    "environment": "...",
    "outcome": "...",
    "desired_emotion": "..."
  },
  "diagnostics": {
    "intent_summary": "One sentence describing the user's core intent"
  },
  "rewrites": [
    {
      "text": "1-3 sentence rewrite",
      "tone_label": "Tone Name",
      "pillars": {
        "intent": "one short line",
        "message": "one short line",
        "position": "one short line",
        "action": "one short line with clear next step",
        "calibration": "one short line"
      },
      "rationale": "Why it works in one line",
      "cautions": "Brief caution or empty string"
    }
  ]
}`;

    const userPrompt = `User's text: "${user_text}"

${environment ? `Environment: ${environment}` : ''}
${outcome ? `Outcome: ${outcome}` : ''}
${desired_emotion ? `Desired Emotion: ${desired_emotion}` : ''}
${!environment || !outcome || !desired_emotion ? 'Please infer missing labels.' : ''}`;

    const startTime = Date.now();
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const latency = Date.now() - startTime;
    
    let aiResponse = data.choices[0].message.content;
    
    // Clean markdown code blocks if present
    aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const result = JSON.parse(aiResponse);
    console.log('[REWRITE] AI response parsed successfully');

    let rewriteId = null;

    // Store in database only if user is authenticated
    if (user) {
      console.log('[REWRITE] Storing rewrite in database...');
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: rewriteRecord, error: dbError } = await supabase
        .from('rewrites')
        .insert({
          user_id: user.id,
          raw_text: user_text,
          environment: environment || null,
          outcome: outcome || null,
          desired_emotion: desired_emotion || null,
          inferred_env: result.inferred?.environment || null,
          inferred_outcome: result.inferred?.outcome || null,
          inferred_emotion: result.inferred?.desired_emotion || null,
          intent_summary: result.diagnostics?.intent_summary || null,
          model_latency_ms: latency
        })
        .select()
        .single();

      if (dbError) {
        console.error("[REWRITE] Database error:", dbError);
      } else {
        rewriteId = rewriteRecord?.id;
        console.log('[REWRITE] Stored in database:', rewriteId);
      }
    } else {
      console.log('[REWRITE] Guest user - not storing in database');
    }

    return new Response(JSON.stringify({
      ...result,
      rewrite_id: rewriteId,
      model_latency_ms: latency
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Rewrite error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});