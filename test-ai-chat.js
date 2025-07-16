// Test script for AI Chat function
// Run this with: node test-ai-chat.js

const SUPABASE_URL = 'https://zahkvkvsfdikdzeftwkr.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your actual anon key
const AI_CHAT_FUNCTION_URL = 'https://zahkvkvsfdikdzeftwkr.supabase.co/functions/v1/ai-chat';

async function testAIChat() {
  try {
    console.log('🧪 Testing AI Chat function...');
    console.log('Function URL:', AI_CHAT_FUNCTION_URL);
    
    // First, let's test if the function is accessible
    console.log('\n📡 Testing function accessibility...');
    const healthCheck = await fetch(AI_CHAT_FUNCTION_URL, {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Health check status:', healthCheck.status);
    
    const testData = {
      question: "What is the main topic of this document?",
      documentIds: ["test-document-id"] // Replace with actual document IDs
    };

    console.log('\n📤 Sending test request...');
    console.log('Request data:', testData);

    const response = await fetch(AI_CHAT_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(testData)
    });

    console.log('\n📥 Response received:');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('\n✅ Success!');
        console.log('Answer:', data.answer);
        console.log('Sources:', data.sources);
      } catch (parseError) {
        console.log('\n⚠️ Response is not valid JSON:', parseError.message);
        console.log('Raw response:', responseText);
      }
    } else {
      console.log('\n❌ Error response');
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error:', errorData.error);
        console.log('Details:', errorData.details);
      } catch (e) {
        console.log('Raw error:', responseText);
      }
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Common issues to check:
console.log('\n🔍 Common Issues to Check:');
console.log('1. Environment Variables:');
console.log('   - SUPABASE_URL is set');
console.log('   - SUPABASE_ANON_KEY is set');
console.log('   - OPENAI_API_KEY is set');
console.log('2. Database:');
console.log('   - match_document_chunks function exists');
console.log('   - document_chunks table exists');
console.log('   - Documents are properly uploaded and processed');
console.log('3. Function Deployment:');
console.log('   - Function is deployed to Supabase');
console.log('   - Function URL is correct');
console.log('4. Permissions:');
console.log('   - RLS policies allow access to document_chunks');
console.log('   - Function has proper permissions');

console.log('\n🚀 Starting test...');
testAIChat(); 