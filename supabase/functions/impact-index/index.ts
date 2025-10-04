import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get authenticated user's feedback only
    const { data: feedbackData, error } = await supabaseClient
      .from('feedback')
      .select('helpful, environment, outcome')
      .eq('user_id', user.id);

    if (error) {
      console.error("Database error:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch feedback" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate helpful rate by environment and outcome
    const stats: Record<string, { total: number; helpful: number; rate: number }> = {};
    
    feedbackData.forEach((fb) => {
      const env = fb.environment || 'Unknown';
      const out = fb.outcome || 'Unknown';
      const key = `${env}_${out}`;
      
      if (!stats[key]) {
        stats[key] = { total: 0, helpful: 0, rate: 0 };
      }
      
      stats[key].total++;
      if (fb.helpful) stats[key].helpful++;
    });

    // Calculate rates
    Object.keys(stats).forEach(key => {
      stats[key].rate = stats[key].total > 0 
        ? Math.round((stats[key].helpful / stats[key].total) * 100) 
        : 0;
    });

    return new Response(JSON.stringify({ stats }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Impact index error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});