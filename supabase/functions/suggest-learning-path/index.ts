import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript_id } = await req.json();
    
    if (!transcript_id) {
      throw new Error('transcript_id is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the conversation transcript
    const { data: transcript, error: transcriptError } = await supabase
      .from('voice_transcripts')
      .select('*')
      .eq('id', transcript_id)
      .single();

    if (transcriptError || !transcript) {
      throw new Error('Transcript not found');
    }

    // Get all published courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, description')
      .eq('is_published', true);

    if (coursesError) {
      throw new Error('Failed to fetch courses');
    }

    // Analyze the conversation using Lovable AI
    const messages = transcript.transcript as Array<{ role: string; content: string }>;
    const conversationText = messages
      .map(m => `${m.role === 'user' ? 'User' : 'April'}: ${m.content}`)
      .join('\n');

    const coursesInfo = courses
      .map(c => `- ${c.title}: ${c.description}`)
      .join('\n');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are April Sabral, a communication and leadership coach. Analyze the conversation and recommend the most relevant courses from the available list. Focus on identifying communication challenges, leadership development needs, and areas for growth discussed in the conversation.`
          },
          {
            role: 'user',
            content: `Based on this conversation:\n\n${conversationText}\n\nAvailable courses:\n${coursesInfo}\n\nProvide a JSON response with:
1. "recommended_course_ids": array of up to 3 most relevant course IDs (use exact IDs from the list)
2. "analysis_summary": brief explanation of why these courses were recommended based on the conversation (2-3 sentences)
3. "personalized_message": encouraging message to the user about their learning journey (1-2 sentences)

Format: { "recommended_course_ids": ["id1", "id2"], "analysis_summary": "...", "personalized_message": "..." }`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error('Failed to analyze conversation');
    }

    const aiData = await aiResponse.json();
    const aiMessage = aiData.choices[0].message.content;
    
    // Parse the AI response
    let parsedResponse;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = aiMessage.match(/```json\s*([\s\S]*?)\s*```/) || aiMessage.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiMessage;
      parsedResponse = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiMessage);
      throw new Error('Invalid AI response format');
    }

    // Get full course details for the recommendations
    const recommendedCourses = courses.filter(c => 
      parsedResponse.recommended_course_ids.includes(c.id)
    );

    const suggestedCoursesData = recommendedCourses.map(course => ({
      course_id: course.id,
      title: course.title,
      description: course.description,
      reason: parsedResponse.analysis_summary,
    }));

    // Save the suggestions
    const { data: suggestion, error: suggestionError } = await supabase
      .from('learning_path_suggestions')
      .insert({
        user_id: transcript.user_id,
        transcript_id: transcript_id,
        suggested_courses: suggestedCoursesData,
        analysis_summary: parsedResponse.personalized_message || parsedResponse.analysis_summary,
      })
      .select()
      .single();

    if (suggestionError) {
      console.error('Error saving suggestion:', suggestionError);
      throw new Error('Failed to save suggestions');
    }

    return new Response(
      JSON.stringify({
        success: true,
        suggestion: {
          ...suggestion,
          courses: recommendedCourses,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in suggest-learning-path:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});