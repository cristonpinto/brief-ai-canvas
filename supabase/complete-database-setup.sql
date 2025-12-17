-- ============================================
-- COMPLETE DATABASE SETUP FOR BRIEF-AI-CANVAS
-- Run this in your new Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- 1. DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  storage_path text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'processed', 'error')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policies for documents
CREATE POLICY "Users can view their own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 2. DOCUMENT_CHUNKS TABLE (for AI processing)
-- ============================================
CREATE TABLE IF NOT EXISTS document_chunks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  chunk_index integer NOT NULL,
  embedding vector(1536), -- For OpenAI embeddings
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Policies for document_chunks
CREATE POLICY "Users can view their own document chunks" ON document_chunks
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM documents WHERE id = document_chunks.document_id)
  );

CREATE POLICY "Service role can insert document chunks" ON document_chunks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update document chunks" ON document_chunks
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own document chunks" ON document_chunks
  FOR DELETE USING (
    auth.uid() = (SELECT user_id FROM documents WHERE id = document_chunks.document_id)
  );

-- ============================================
-- 3. BRIEFS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS briefs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  brief_type text NOT NULL,
  content jsonb NOT NULL, -- Store brief cards as JSON
  source_documents uuid[] DEFAULT '{}', -- Array of document IDs used
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;

-- Policies for briefs
CREATE POLICY "Users can view their own briefs" ON briefs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own briefs" ON briefs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own briefs" ON briefs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own briefs" ON briefs
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. BRIEF_CARDS TABLE (optional - for individual cards)
-- ============================================
CREATE TABLE IF NOT EXISTS brief_cards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brief_id uuid REFERENCES briefs(id) ON DELETE CASCADE NOT NULL,
  card_type text NOT NULL CHECK (card_type IN ('summary', 'keypoints', 'actions', 'decisions')),
  title text NOT NULL,
  content text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE brief_cards ENABLE ROW LEVEL SECURITY;

-- Policies for brief_cards
CREATE POLICY "Users can view their own brief cards" ON brief_cards
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM briefs WHERE id = brief_cards.brief_id)
  );

CREATE POLICY "Users can insert their own brief cards" ON brief_cards
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM briefs WHERE id = brief_cards.brief_id)
  );

CREATE POLICY "Users can update their own brief cards" ON brief_cards
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM briefs WHERE id = brief_cards.brief_id)
  );

CREATE POLICY "Users can delete their own brief cards" ON brief_cards
  FOR DELETE USING (
    auth.uid() = (SELECT user_id FROM briefs WHERE id = brief_cards.brief_id)
  );

-- ============================================
-- 5. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_briefs_user_id ON briefs(user_id);
CREATE INDEX IF NOT EXISTS idx_briefs_created_at ON briefs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brief_cards_brief_id ON brief_cards(brief_id);

-- ============================================
-- 6. STORAGE BUCKET FOR DOCUMENTS
-- ============================================
-- Note: Run this in the SQL editor or create manually in Storage settings
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload their own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Your database is now ready for the Brief AI Canvas app