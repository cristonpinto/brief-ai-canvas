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
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Only POST requests are allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate authorization header - check multiple possible formats
    const authHeader = req.headers.get('Authorization') || 
                      req.headers.get('authorization') ||
                      req.headers.get('x-authorization');
                      
    if (!authHeader) {
      console.error('Missing authorization header. Available headers:', Object.fromEntries(req.headers.entries()));
      return new Response(
        JSON.stringify({ 
          error: 'Authorization header is required',
          details: 'No authorization header found in request'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log authorization header for debugging (remove in production)
    console.log('Authorization header received:', authHeader.substring(0, 20) + '...');

    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error',
          details: 'Missing Supabase environment variables'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!openaiApiKey) {
      console.error('Missing OpenAI API key');
      return new Response(
        JSON.stringify({ 
          error: 'AI service is currently unavailable',
          details: 'OpenAI API key not configured'
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify the user is authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error('User authentication failed:', userError);
      return new Response(
        JSON.stringify({ 
          error: 'Authentication failed',
          details: 'Invalid or expired session'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User authenticated:', user.id);

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: parseError.message
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { question, documentIds } = requestBody;
    
    // Validate required fields
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'A valid question is required',
          details: 'Question must be a non-empty string'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'At least one document ID is required',
          details: 'documentIds must be a non-empty array'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate document IDs are strings
    if (!documentIds.every(id => typeof id === 'string' && id.trim().length > 0)) {
      return new Response(
        JSON.stringify({ 
          error: 'All document IDs must be valid strings',
          details: 'Each document ID must be a non-empty string'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing request for user:', user.id, 'with documents:', documentIds);

    // Generate embedding for the question
    let questionEmbedding;
    try {
      const questionEmbeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: question.trim(),
        }),
      });

      if (!questionEmbeddingResponse.ok) {
        const errorText = await questionEmbeddingResponse.text();
        console.error('OpenAI embedding API error:', questionEmbeddingResponse.status, errorText);
        throw new Error(`OpenAI API error: ${questionEmbeddingResponse.status}`);
      }

      const questionEmbeddingData = await questionEmbeddingResponse.json();
      
      if (!questionEmbeddingData.data || !questionEmbeddingData.data[0] || !questionEmbeddingData.data[0].embedding) {
        throw new Error('Invalid response from OpenAI embedding API');
      }

      questionEmbedding = questionEmbeddingData.data[0].embedding;
      console.log('Embedding generated successfully');
    } catch (embeddingError) {
      console.error('Embedding generation error:', embeddingError);
      return new Response(
        JSON.stringify({ 
          error: 'Unable to process your question at the moment. Please try again later.',
          details: 'Embedding generation failed: ' + embeddingError.message
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find similar chunks using vector similarity
    let similarChunks;
    try {
      const { data, error: searchError } = await supabaseClient.rpc(
        'match_document_chunks',
        {
          query_embedding: questionEmbedding,
          match_threshold: 0.7,
          match_count: 5,
          filter_document_ids: documentIds
        }
      );

      if (searchError) {
        console.error('Vector search error:', searchError);
        throw searchError;
      }

      similarChunks = data;
      console.log('Vector search completed, found', similarChunks?.length || 0, 'chunks');
    } catch (searchError) {
      console.error('Search error:', searchError);
      
      // Fallback: get some chunks from the documents
      try {
        const { data: fallbackChunks, error: fallbackError } = await supabaseClient
          .from('document_chunks')
          .select('content, metadata, document_id')
          .in('document_id', documentIds)
          .limit(3);

        if (fallbackError) {
          console.error('Fallback search error:', fallbackError);
          throw fallbackError;
        }

        if (fallbackChunks && fallbackChunks.length > 0) {
          console.log('Using fallback search, found', fallbackChunks.length, 'chunks');
          const context = fallbackChunks.map(chunk => chunk.content).join('\n\n');
          return await generateAnswer(context, question, fallbackChunks, openaiApiKey);
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        return new Response(
          JSON.stringify({ 
            error: 'Unable to search documents at the moment. Please try again later.',
            details: 'Document search failed: ' + fallbackError.message
          }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!similarChunks || similarChunks.length === 0) {
      return new Response(
        JSON.stringify({ 
          answer: "I couldn't find relevant information in the selected documents to answer your question. Please try rephrasing your question or selecting different documents.",
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
    
    // Provide more specific error messages based on error type
    let errorMessage = 'An unexpected error occurred. Please try again.';
    let statusCode = 500;

    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Network error. Please check your connection and try again.';
      statusCode = 503;
    } else if (error.message?.includes('OpenAI')) {
      errorMessage = 'AI service is temporarily unavailable. Please try again later.';
      statusCode = 503;
    } else if (error.message?.includes('Supabase')) {
      errorMessage = 'Database connection error. Please try again later.';
      statusCode = 503;
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateAnswer(context: string, question: string, chunks: Array<{content: string, metadata?: any, document_id: string}>, openaiApiKey: string) {
  try {
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
        max_tokens: 1000,
      }),
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error('OpenAI chat API error:', chatResponse.status, errorText);
      throw new Error(`OpenAI chat API error: ${chatResponse.status}`);
    }

    const chatData = await chatResponse.json();
    
    if (!chatData.choices || !chatData.choices[0] || !chatData.choices[0].message) {
      throw new Error('Invalid response from OpenAI chat API');
    }

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
  } catch (error) {
    console.error('Answer generation error:', error);
    throw new Error(`Failed to generate answer: ${error.message}`);
  }
}
