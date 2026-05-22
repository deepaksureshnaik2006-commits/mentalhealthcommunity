-- Add video_url column to peer_messages for video support
ALTER TABLE public.peer_messages 
ADD COLUMN IF NOT EXISTS video_url text;

-- Create a table to track deleted conversations per user (for permanent deletion)
CREATE TABLE IF NOT EXISTS public.deleted_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  chat_id uuid NOT NULL,
  deleted_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, chat_id)
);

-- Enable RLS on deleted_conversations
ALTER TABLE public.deleted_conversations ENABLE ROW LEVEL SECURITY;

-- RLS policies for deleted_conversations
CREATE POLICY "Users can view own deleted conversations"
ON public.deleted_conversations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deleted conversations"
ON public.deleted_conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own deleted conversation records"
ON public.deleted_conversations
FOR DELETE
USING (auth.uid() = user_id);

-- Create a function to delete all user data when account is deleted
CREATE OR REPLACE FUNCTION public.delete_user_data(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete all forum replies by user
  DELETE FROM forum_replies WHERE user_id = target_user_id;
  
  -- Delete all forum posts by user (this will cascade delete replies to those posts)
  DELETE FROM forum_posts WHERE user_id = target_user_id;
  
  -- Delete all AI chat messages in user's chats
  DELETE FROM ai_chat_messages WHERE chat_id IN (
    SELECT id FROM ai_chats WHERE user_id = target_user_id
  );
  
  -- Delete all AI chats by user
  DELETE FROM ai_chats WHERE user_id = target_user_id;
  
  -- Delete all peer messages sent by user
  DELETE FROM peer_messages WHERE sender_id = target_user_id;
  
  -- Delete all peer chats involving user
  DELETE FROM peer_chats WHERE participant1_id = target_user_id OR participant2_id = target_user_id;
  
  -- Delete all notifications for user
  DELETE FROM notifications WHERE user_id = target_user_id;
  
  -- Delete all mood logs by user
  DELETE FROM mood_logs WHERE user_id = target_user_id;
  
  -- Delete deleted conversation records
  DELETE FROM deleted_conversations WHERE user_id = target_user_id;
  
  -- Profile deletion is handled separately (already in Settings.tsx)
END;
$$;

-- Allow authenticated users to call this function for their own data
GRANT EXECUTE ON FUNCTION public.delete_user_data(uuid) TO authenticated;