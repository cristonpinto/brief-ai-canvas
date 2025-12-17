-- Create briefs table to store generated briefs
CREATE TABLE IF NOT EXISTS briefs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  brief_type text NOT NULL,
  content jsonb NOT NULL, -- Store brief cards as JSON
  source_documents uuid[] DEFAULT '{}', -- Array of document IDs used to generate the brief
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create brief_cards table for individual cards (alternative approach)
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
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for briefs
CREATE POLICY "Users can view their own briefs" ON briefs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own briefs" ON briefs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own briefs" ON briefs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own briefs" ON briefs
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for brief_cards
CREATE POLICY "Users can view their own brief cards" ON brief_cards
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM briefs WHERE id = brief_cards.brief_id));

CREATE POLICY "Users can insert their own brief cards" ON brief_cards
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM briefs WHERE id = brief_cards.brief_id));

CREATE POLICY "Users can update their own brief cards" ON brief_cards
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM briefs WHERE id = brief_cards.brief_id));

CREATE POLICY "Users can delete their own brief cards" ON brief_cards
  FOR DELETE USING (auth.uid() = (SELECT user_id FROM briefs WHERE id = brief_cards.brief_id));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_briefs_user_id ON briefs(user_id);
CREATE INDEX IF NOT EXISTS idx_briefs_created_at ON briefs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brief_cards_brief_id ON brief_cards(brief_id);
CREATE INDEX IF NOT EXISTS idx_brief_cards_sort_order ON brief_cards(brief_id, sort_order);
