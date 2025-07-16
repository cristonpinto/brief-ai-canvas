#!/bin/bash

echo "🚀 Deploying AI Chat Function..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if logged in
if ! supabase status &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "supabase login"
    exit 1
fi

echo "📦 Deploying function..."
supabase functions deploy ai-chat

if [ $? -eq 0 ]; then
    echo "✅ Function deployed successfully!"
else
    echo "❌ Function deployment failed!"
    exit 1
fi

echo ""
echo "🔧 Next steps:"
echo "1. Go to your Supabase Dashboard"
echo "2. Navigate to Settings > Edge Functions"
echo "3. Add these environment variables:"
echo "   - SUPABASE_URL (from Settings > API)"
echo "   - SUPABASE_ANON_KEY (from Settings > API)"
echo "   - OPENAI_API_KEY (your OpenAI API key)"
echo ""
echo "4. Test the function with:"
echo "   node test-ai-chat.js"
echo ""
echo "5. Check logs with:"
echo "   supabase functions logs ai-chat --follow" 