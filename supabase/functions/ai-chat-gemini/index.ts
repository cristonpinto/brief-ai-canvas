// AI Chat Edge Function using Google Gemini SDK
// Deploy this to Supabase Edge Functions
// Required secret: GOOGLE_GEMINI_API_KEY

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { question, documentIds } = await req.json();

    if (!question) {
      return new Response(
        JSON.stringify({ error: 'Question is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('AI Chat request:', { question, documentIds });

    // Get document chunks
    let context = '';
    if (documentIds && documentIds.length > 0) {
      const { data: chunks } = await supabaseClient
        .from('document_chunks')
        .select('content')
        .in('document_id', documentIds)
        .limit(10); // Limit chunks to avoid token limits

      if (chunks && chunks.length > 0) {
        context = chunks.map(c => c.content).join('\n\n');
      }
    }

    // Use Google Gemini SDK
    const geminiApiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = context 
      ? `Based on the following document context, answer the question concisely and professionally.

Document Context:
${context.substring(0, 10000)}

Question: ${question}

Answer:`
      : `Answer the following question concisely and professionally:

Question: ${question}

Answer:`;

    // Initialize the SDK
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate response
    const result = await model.generateContent(prompt);
    const answer = result.response.text() || 'I could not generate a response.';

    return new Response(
      JSON.stringify({
        answer: answer,
        sources: documentIds || []
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});