// Simplified process-document Edge Function using Google Gemini (free)
// Deploy this to Supabase Edge Functions

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { documentId } = await req.json();
    
    console.log('Processing document:', documentId);

    // Get document info
    const { data: document, error: docError } = await supabaseClient
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      console.error('Document not found:', docError);
      return new Response(
        JSON.stringify({ error: 'Document not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('documents')
      .download(document.storage_path);

    if (downloadError) {
      console.error('Download error:', downloadError);
      return new Response(
        JSON.stringify({ error: 'Failed to download file' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract text content
    let textContent = await fileData.text();
    
    console.log('Extracted text length:', textContent.length);

    // Split text into chunks
    const chunkSize = 1000;
    const overlap = 100;
    const chunks: string[] = [];
    
    for (let i = 0; i < textContent.length; i += chunkSize - overlap) {
      const chunk = textContent.slice(i, i + chunkSize);
      if (chunk.trim().length > 50) { // Only add meaningful chunks
        chunks.push(chunk.trim());
      }
    }

    console.log('Created chunks:', chunks.length);

    // Store chunks (without embeddings for simplicity)
    for (let i = 0; i < chunks.length; i++) {
      const { error: chunkError } = await supabaseClient
        .from('document_chunks')
        .insert({
          document_id: documentId,
          chunk_index: i,
          content: chunks[i],
          metadata: {
            chunk_number: i + 1,
            total_chunks: chunks.length,
            chunk_size: chunks[i].length
          }
        });

      if (chunkError) {
        console.error('Error storing chunk:', chunkError);
      }
    }

    // Update document status to processed
    const { error: updateError } = await supabaseClient
      .from('documents')
      .update({ status: 'processed' })
      .eq('id', documentId);

    if (updateError) {
      console.error('Error updating document status:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        chunks_created: chunks.length,
        message: 'Document processed successfully' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});