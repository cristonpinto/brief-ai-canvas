// Generate Brief Edge Function using Google Gemini
// Deploy this to Supabase Edge Functions
// Required secret: GOOGLE_GEMINI_API_KEY

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

    const { documentIds, briefTitle, briefType } = await req.json();

    if (!documentIds || documentIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one document ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating brief for documents:', documentIds);

    // Get document chunks
    const { data: chunks, error: chunksError } = await supabaseClient
      .from('document_chunks')
      .select('content, metadata, document_id')
      .in('document_id', documentIds)
      .order('chunk_index');

    if (chunksError) {
      console.error('Chunks error:', chunksError);
      return new Response(
        JSON.stringify({ error: 'Failed to retrieve document content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!chunks || chunks.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No content found for selected documents' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Combine content (limit to avoid token limits)
    const combinedContent = chunks
      .map(c => c.content)
      .join('\n\n')
      .substring(0, 15000); // Limit content

    // Get document names
    const { data: documents } = await supabaseClient
      .from('documents')
      .select('filename')
      .in('id', documentIds);

    const documentNames = documents?.map(d => d.filename).join(', ') || 'Selected documents';

    // Generate brief using Gemini
    const geminiApiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `Analyze the following document content and create a structured brief.

Document Title: ${briefTitle}
Source Documents: ${documentNames}

Document Content:
${combinedContent}

Create a JSON array with exactly 4 sections:
1. Executive Summary (type: "summary") - 2-3 sentences overview
2. Key Points (type: "keypoints") - 4-5 bullet points using •
3. Action Items (type: "actions") - 3-4 actionable tasks using •
4. Key Decisions (type: "decisions") - 2-3 decisions or conclusions using •

Return ONLY valid JSON in this exact format:
[
  {"id": "summary-1", "type": "summary", "title": "Executive Summary", "content": "...", "isEditing": false},
  {"id": "keypoints-1", "type": "keypoints", "title": "Key Points", "content": "• Point 1\\n• Point 2", "isEditing": false},
  {"id": "actions-1", "type": "actions", "title": "Action Items", "content": "• Action 1\\n• Action 2", "isEditing": false},
  {"id": "decisions-1", "type": "decisions", "title": "Key Decisions", "content": "• Decision 1\\n• Decision 2", "isEditing": false}
]`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini error:', errorText);
      return new Response(
        JSON.stringify({ error: 'AI generation failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geminiData = await geminiResponse.json();
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse JSON from response
    let briefSections;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        briefSections = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Parse error:', parseError);
      // Fallback to template
      briefSections = [
        { id: 'summary-1', type: 'summary', title: 'Executive Summary', content: 'Brief generated from your documents. Please review and edit.', isEditing: false },
        { id: 'keypoints-1', type: 'keypoints', title: 'Key Points', content: '• Key insight from documents\n• Important finding\n• Notable detail', isEditing: false },
        { id: 'actions-1', type: 'actions', title: 'Action Items', content: '• Review generated content\n• Edit sections as needed\n• Share with team', isEditing: false },
        { id: 'decisions-1', type: 'decisions', title: 'Key Decisions', content: '• Decision based on document analysis\n• Recommended next steps', isEditing: false }
      ];
    }

    return new Response(
      JSON.stringify({
        brief: briefSections,
        sourceDocuments: documentNames,
        totalChunks: chunks.length
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
