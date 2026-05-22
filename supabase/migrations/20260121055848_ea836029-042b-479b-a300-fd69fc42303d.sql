-- Add columns to track message deletion states
ALTER TABLE public.peer_messages 
ADD COLUMN deleted_for_sender boolean NOT NULL DEFAULT false,
ADD COLUMN deleted_for_everyone boolean NOT NULL DEFAULT false;

-- Allow users to update their own messages (for delete for me)
CREATE POLICY "Users can update messages in their chats" 
ON public.peer_messages 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM peer_chats 
    WHERE peer_chats.id = peer_messages.chat_id 
    AND (peer_chats.participant1_id = auth.uid() OR peer_chats.participant2_id = auth.uid())
  )
);

-- Allow senders to delete their own messages (for delete for everyone)
CREATE POLICY "Senders can delete own messages" 
ON public.peer_messages 
FOR DELETE 
USING (sender_id = auth.uid());