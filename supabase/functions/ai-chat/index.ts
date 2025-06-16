
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { question, documentIds } = await req.json();
    
    if (!question || !documentIds || documentIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Question and document IDs are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    // Generate embedding for the question
    const questionEmbeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: question,
      }),
    });

    if (!questionEmbeddingResponse.ok) {
      throw new Error('Failed to generate question embedding');
    }

    const questionEmbeddingData = await questionEmbeddingResponse.json();
    const questionEmbedding = questionEmbeddingData.data[0].embedding;

    // Find similar chunks using vector similarity
    const { data: similarChunks, error: searchError } = await supabaseClient.rpc(
      'match_document_chunks',
      {
        query_embedding: questionEmbedding,
        match_threshold: 0.7,
        match_count: 5,
        filter_document_ids: documentIds
      }
    );

    if (searchError) {
      console.error('Search error:', searchError);
      // Fallback: get some chunks from the documents
      const { data: fallbackChunks } = await supabaseClient
        .from('document_chunks')
        .select('content, metadata, document_id')
        .in('document_id', documentIds)
        .limit(3);
      
      if (fallbackChunks) {
        const context = fallbackChunks.map(chunk => chunk.content).join('\n\n');
        return await generateAnswer(context, question, fallbackChunks, openaiApiKey);
      }
    }

    if (!similarChunks || similarChunks.length === 0) {
      return new Response(
        JSON.stringify({ 
          answer: "I couldn't find relevant information in the selected documents to answer your question.",
          sources: []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare context from similar chunks
    const context = similarChunks.map(chunk => chunk.content).join('\n\n');
    
    return await generateAnswer(context, question, similarChunks, openaiApiKey);

  } catch (error) {
    console.error('AI Chat error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateAnswer(context: string, question: string, chunks: any[], openaiApiKey: string) {
  // Generate answer using OpenAI
  const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that answers questions based on provided document content. 
          Use only the information from the provided context to answer questions. 
          If you can't answer based on the context, say so clearly.
          Be concise and accurate.`
        },
        {
          role: 'user',
          content: `Context from documents:\n${context}\n\nQuestion: ${question}`
        }
      ],
      temperature: 0.3,
    }),
  });

  if (!chatResponse.ok) {
    throw new Error('Failed to generate answer');
  }

  const chatData = await chatResponse.json();
  const answer = chatData.choices[0].message.content;

  // Create sources from chunks
  const sources = chunks.map(chunk => {
    const page = chunk.metadata?.page || 1;
    return `Page ${page}`;
  });

  return new Response(
    JSON.stringify({ 
      answer,
      sources: [...new Set(sources)] // Remove duplicates
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
