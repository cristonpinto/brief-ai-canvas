
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// This is a one-time setup function to create the vector search function
serve(async (req) => {
  return new Response(
    JSON.stringify({ message: "Vector search function should be created via SQL migration" }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
