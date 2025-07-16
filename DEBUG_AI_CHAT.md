# AI Chat Function Debugging Guide

## The Problem
You're getting the error: "Sorry, I encountered an error while processing your question. Please try again."

## Root Causes & Solutions

### 1. Environment Variables Missing
**Check if these are set in your Supabase project:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` 
- `OPENAI_API_KEY`

**Solution:**
1. Go to your Supabase Dashboard
2. Navigate to Settings > API
3. Copy the URL and anon key
4. Go to Settings > Edge Functions
5. Add environment variables:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   OPENAI_API_KEY=your-openai-api-key
   ```

### 2. Function Not Deployed
**Check if the function is deployed:**
```bash
supabase functions deploy ai-chat
```

### 3. Database Function Missing
**Verify the `match_document_chunks` function exists:**
```sql
-- Run this in your Supabase SQL editor
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'match_document_chunks';
```

**If missing, run the migration:**
```bash
supabase db push
```

### 4. No Documents or Documents Not Processed
**Check document status:**
```sql
SELECT id, filename, status, created_at 
FROM documents 
WHERE user_id = auth.uid();
```

**Documents must be in 'processed' status to be searchable.**

### 5. RLS (Row Level Security) Issues
**Check if you can access document chunks:**
```sql
-- Test this in SQL editor
SELECT COUNT(*) FROM document_chunks;
```

**If 0 results, check RLS policies:**
```sql
-- Verify policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('documents', 'document_chunks');
```

### 6. OpenAI API Issues
**Test OpenAI API directly:**
```javascript
// Test in browser console
const response = await fetch('https://api.openai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer YOUR_OPENAI_API_KEY`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'text-embedding-3-small',
    input: 'test',
  }),
});
console.log(await response.json());
```

### 7. Function URL Issues
**Check the correct function URL:**
- Your project ID: `zahkvkvsfdikdzeftwkr`
- Function URL should be: `https://zahkvkvsfdikdzeftwkr.supabase.co/functions/v1/ai-chat`

## Step-by-Step Debugging

### Step 1: Check Function Logs
```bash
supabase functions logs ai-chat --follow
```

### Step 2: Test Function Directly
Use the test script I created (`test-ai-chat.js`):
1. Update the variables with your actual values
2. Run: `node test-ai-chat.js`

### Step 3: Check Browser Console
1. Open browser dev tools
2. Go to Network tab
3. Try sending a message
4. Look for the function call and check response

### Step 4: Verify Document Processing
1. Upload a document
2. Check if it gets processed (status changes to 'processed')
3. Verify chunks are created:
```sql
SELECT COUNT(*) FROM document_chunks WHERE document_id = 'your-doc-id';
```

## Common Fixes

### Fix 1: Redeploy Function
```bash
supabase functions deploy ai-chat
```

### Fix 2: Reset Database
```bash
supabase db reset
supabase db push
```

### Fix 3: Check Authentication
Make sure you're logged in and the session is valid.

### Fix 4: Update Environment Variables
In Supabase Dashboard > Settings > Edge Functions, ensure all required variables are set.

## Testing Checklist

- [ ] Environment variables are set
- [ ] Function is deployed
- [ ] Database migrations are applied
- [ ] Documents are uploaded and processed
- [ ] User is authenticated
- [ ] OpenAI API key is valid
- [ ] Function URL is correct

## If Still Having Issues

1. Check the function logs for specific error messages
2. Test with a simple document (text file)
3. Verify the document has content and chunks were created
4. Check if the vector similarity search is working

## Emergency Fallback

If the vector search fails, the function should fall back to a simple text search. If that's also failing, the issue is likely with:
- Database permissions
- Missing environment variables
- Function deployment issues 