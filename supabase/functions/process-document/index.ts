import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { documentId } = await req.json();

    // Get document info
    const { data: document, error: docError } = await supabaseClient
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (docError || !document) {
      return new Response(JSON.stringify({ error: "Document not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Download file from storage
    const { data: fileData, error: downloadError } =
      await supabaseClient.storage
        .from("documents")
        .download(document.storage_path);

    if (downloadError) {
      console.error("Download error:", downloadError);
      return new Response(
        JSON.stringify({ error: "Failed to download file" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Extract text based on file type
    let textContent = "";

    if (document.file_type === "text/plain") {
      textContent = await fileData.text();
    } else if (document.file_type === "application/pdf") {
      // For PDF, we'll use a simple text extraction approach
      // In production, you'd want to use a proper PDF parser
      textContent = await fileData.text();
    } else {
      // For other file types, try to extract as text
      textContent = await fileData.text();
    }

    // Split text into chunks (simple approach - split by sentences/paragraphs)
    const chunkSize = 1000;
    const overlap = 200;
    const chunks = [];

    for (let i = 0; i < textContent.length; i += chunkSize - overlap) {
      const chunk = textContent.slice(i, i + chunkSize);
      if (chunk.trim()) {
        chunks.push(chunk.trim());
      }
    }

    // Store chunks (without embeddings for now - embeddings are optional)
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      // Store chunk
      const { error: chunkError } = await supabaseClient
        .from("document_chunks")
        .insert({
          document_id: documentId,
          chunk_index: i,
          content: chunk,
          metadata: {
            page: Math.floor(i / 3) + 1, // Rough page estimation
            chunk_size: chunk.length,
          },
        });

      if (chunkError) {
        console.error("Error storing chunk:", chunkError);
      }
    }

    // Update document status to completed
    await supabaseClient
      .from("documents")
      .update({
        status: "completed",
        processed_at: new Date().toISOString(),
      })
      .eq("id", documentId);

    return new Response(
      JSON.stringify({
        success: true,
        chunks_created: chunks.length,
        message: "Document processed successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Processing error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
