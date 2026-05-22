-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vhvfqgyzbtwwutfrowoc/sql

-- AI Chats table
CREATE TABLE IF NOT EXISTS ai_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Chat Messages table
CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES ai_chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_chats_user_id ON ai_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_chat_id ON ai_chat_messages(chat_id);

-- Enable Row Level Security
ALTER TABLE ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_chats (users can only see/edit their own chats)
CREATE POLICY "Users can view own chats" ON ai_chats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chats" ON ai_chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chats" ON ai_chats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chats" ON ai_chats
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for ai_chat_messages (users can only see/add messages in their chats)
CREATE POLICY "Users can view messages in own chats" ON ai_chat_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM ai_chats WHERE id = chat_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert messages in own chats" ON ai_chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM ai_chats WHERE id = chat_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete messages in own chats" ON ai_chat_messages
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM ai_chats WHERE id = chat_id AND user_id = auth.uid())
  );
