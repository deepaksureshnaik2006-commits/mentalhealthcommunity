-- Add notifications_enabled column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN notifications_enabled BOOLEAN NOT NULL DEFAULT true;

-- Add reference columns to notifications for navigation
ALTER TABLE public.notifications 
ADD COLUMN reference_id TEXT,
ADD COLUMN reference_type TEXT;

-- Update the forum reply notification function to include reference
CREATE OR REPLACE FUNCTION public.notify_on_forum_reply()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  post_user_id UUID;
  post_title TEXT;
  replier_alias TEXT;
  user_notifications_enabled BOOLEAN;
BEGIN
  -- Get the post owner and title
  SELECT user_id, title INTO post_user_id, post_title
  FROM forum_posts WHERE id = NEW.post_id;
  
  -- Get replier's alias
  SELECT anonymous_alias INTO replier_alias
  FROM profiles WHERE user_id = NEW.user_id;
  
  -- Check if user has notifications enabled
  SELECT notifications_enabled INTO user_notifications_enabled
  FROM profiles WHERE user_id = post_user_id;
  
  -- Don't notify if user replies to their own post or has notifications disabled
  IF post_user_id != NEW.user_id AND COALESCE(user_notifications_enabled, true) THEN
    INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type)
    VALUES (
      post_user_id,
      'New reply to your post',
      replier_alias || ' replied to "' || LEFT(post_title, 50) || '"',
      'forum',
      NEW.post_id,
      'forum_post'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update the peer message notification function to include reference
CREATE OR REPLACE FUNCTION public.notify_on_peer_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  receiver_id UUID;
  sender_alias TEXT;
  chat_participant1 UUID;
  chat_participant2 UUID;
  user_notifications_enabled BOOLEAN;
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
  
  -- Check if receiver has notifications enabled
  SELECT notifications_enabled INTO user_notifications_enabled
  FROM profiles WHERE user_id = receiver_id;
  
  -- Get sender's alias
  SELECT anonymous_alias INTO sender_alias
  FROM profiles WHERE user_id = NEW.sender_id;
  
  -- Only create notification if user has notifications enabled
  IF COALESCE(user_notifications_enabled, true) THEN
    INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type)
    VALUES (
      receiver_id,
      'New message from ' || sender_alias,
      LEFT(NEW.content, 100),
      'message',
      NEW.chat_id,
      'peer_chat'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;