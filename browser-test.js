// Browser-based test for AI Chat function
// Copy and paste this into your browser console (F12 > Console)

async function testAIChatInBrowser() {
  try {
    console.log('🧪 Testing AI Chat function in browser...');
    
    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('❌ No valid session found. Please log in first.');
      return;
    }
    
    console.log('✅ User session found');
    console.log('User ID:', session.user.id);
    console.log('Access token:', session.access_token.substring(0, 20) + '...');
    
    // Get user's documents
    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('id, filename, status')
      .eq('user_id', session.user.id);
    
    if (docError) {
      console.error('❌ Error fetching documents:', docError);
      return;
    }
    
    console.log('📄 User documents:', documents);
    
    if (!documents || documents.length === 0) {
      console.log('⚠️ No documents found. Please upload some documents first.');
      return;
    }
    
    // Find a processed document
    const processedDoc = documents.find(doc => doc.status === 'processed');
    
    if (!processedDoc) {
      console.log('⚠️ No processed documents found. Please wait for document processing to complete.');
      console.log('Document statuses:', documents.map(d => ({ filename: d.filename, status: d.status })));
      return;
    }
    
    console.log('✅ Found processed document:', processedDoc.filename);
    
    // Test the AI chat function
    const testData = {
      question: "What is the main topic of this document?",
      documentIds: [processedDoc.id]
    };
    
    console.log('📤 Sending request to AI chat function...');
    console.log('Request data:', testData);
    
    // Test with explicit headers to debug authorization
    const functionUrl = 'https://zahkvkvsfdikdzeftwkr.supabase.co/functions/v1/ai-chat';
    
    console.log('🔍 Testing with explicit fetch...');
    const fetchResponse = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(testData)
    });
    
    console.log('Fetch response status:', fetchResponse.status);
    const fetchResponseText = await fetchResponse.text();
    console.log('Fetch response body:', fetchResponseText);
    
    // Now test with supabase.functions.invoke
    console.log('\n🔍 Testing with supabase.functions.invoke...');
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: testData
    });
    
    console.log('📥 Response received:');
    console.log('Data:', data);
    console.log('Error:', error);
    
    if (error) {
      console.error('❌ Function error:', error);
      
      // Try to get more details about the error
      if (error.message) {
        console.error('Error message:', error.message);
      }
      if (error.status) {
        console.error('Error status:', error.status);
      }
      if (error.details) {
        console.error('Error details:', error.details);
      }
    } else if (data) {
      console.log('✅ Success!');
      console.log('Answer:', data.answer);
      console.log('Sources:', data.sources);
    } else {
      console.log('⚠️ No data or error returned');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Full error:', error);
  }
}

// Run the test
console.log('🚀 Starting browser test...');
testAIChatInBrowser(); 