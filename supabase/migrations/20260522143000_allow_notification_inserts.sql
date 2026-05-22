-- Migration: Allow authenticated users to insert notifications for other users
-- This enables peer-to-peer message notifications to bypass RLS restrictions

CREATE POLICY "Allow authenticated inserts" 
ON public.notifications_mh 
FOR INSERT 
TO authenticated 
WITH CHECK (true);
