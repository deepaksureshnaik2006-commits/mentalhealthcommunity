-- Create message_images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('message_images', 'message_images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for message images
CREATE POLICY "Authenticated users can upload message images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'message_images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Message images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'message_images');

CREATE POLICY "Users can delete their own message images"
ON storage.objects FOR DELETE
USING (bucket_id = 'message_images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add image_url column to peer_messages table
ALTER TABLE public.peer_messages
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create function to notify on forum reply
CREATE OR REPLACE FUNCTION public.notify_on_forum_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_user_id UUID;
  post_title TEXT;
  replier_alias TEXT;
BEGIN
  -- Get the post owner and title
  SELECT user_id, title INTO post_user_id, post_title
  FROM forum_posts WHERE id = NEW.post_id;
  
  -- Get replier's alias
  SELECT anonymous_alias INTO replier_alias
  FROM profiles WHERE user_id = NEW.user_id;
  
  -- Don't notify if user replies to their own post
  IF post_user_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
      post_user_id,
      'New reply to your post',
      replier_alias || ' replied to "' || LEFT(post_title, 50) || '"',
      'forum'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for forum reply notifications
DROP TRIGGER IF EXISTS on_forum_reply_notify ON forum_replies;
CREATE TRIGGER on_forum_reply_notify
AFTER INSERT ON forum_replies
FOR EACH ROW
EXECUTE FUNCTION notify_on_forum_reply();

-- Create function to notify on peer message
CREATE OR REPLACE FUNCTION public.notify_on_peer_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  receiver_id UUID;
  sender_alias TEXT;
  chat_participant1 UUID;
  chat_participant2 UUID;
BEGIN
  -- Get chat participants
  SELECT participant1_id, participant2_id INTO chat_participant1, chat_participant2
  FROM peer_chats WHERE id = NEW.chat_id;
  
  -- Determine receiver (the other participant)
  IF NEW.sender_id = chat_participant1 THEN
    receiver_id := chat_participant2;
  ELSE
    receiver_id := chat_participant1;
  END IF;
  
  -- Get sender's alias
  SELECT anonymous_alias INTO sender_alias
  FROM profiles WHERE user_id = NEW.sender_id;
  
  -- Create notification for receiver
  INSERT INTO notifications (user_id, title, message, type)
  VALUES (
    receiver_id,
    'New message from ' || sender_alias,
    LEFT(NEW.content, 100),
    'message'
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for peer message notifications
DROP TRIGGER IF EXISTS on_peer_message_notify ON peer_messages;
CREATE TRIGGER on_peer_message_notify
AFTER INSERT ON peer_messages
FOR EACH ROW
EXECUTE FUNCTION notify_on_peer_message();

-- Allow users to insert notifications (for system use)
CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);