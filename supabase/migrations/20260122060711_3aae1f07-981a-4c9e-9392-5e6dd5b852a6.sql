-- Create table for storing user security questions
CREATE TABLE public.security_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  question1 TEXT NOT NULL,
  answer1_hash TEXT NOT NULL,
  question2 TEXT NOT NULL,
  answer2_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.security_questions ENABLE ROW LEVEL SECURITY;

-- Users can view their own security questions (but not answer hashes via client)
CREATE POLICY "Users can view own security questions"
ON public.security_questions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own security questions
CREATE POLICY "Users can insert own security questions"
ON public.security_questions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own security questions
CREATE POLICY "Users can update own security questions"
ON public.security_questions
FOR UPDATE
USING (auth.uid() = user_id);

-- Create function to verify security answers (used by edge function with service role)
CREATE OR REPLACE FUNCTION public.verify_security_answers(
  p_email TEXT,
  p_answer1 TEXT,
  p_answer2 TEXT
)
RETURNS TABLE(user_id UUID, is_valid BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_answer1_hash TEXT;
  v_answer2_hash TEXT;
BEGIN
  -- Get user_id from auth.users by email
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, FALSE;
    RETURN;
  END IF;
  
  -- Get stored answer hashes
  SELECT sq.answer1_hash, sq.answer2_hash INTO v_answer1_hash, v_answer2_hash
  FROM security_questions sq
  WHERE sq.user_id = v_user_id;
  
  IF v_answer1_hash IS NULL THEN
    -- No security questions set up
    RETURN QUERY SELECT v_user_id, FALSE;
    RETURN;
  END IF;
  
  -- Compare hashed answers (case-insensitive, trimmed)
  IF v_answer1_hash = encode(sha256(lower(trim(p_answer1))::bytea), 'hex')
     AND v_answer2_hash = encode(sha256(lower(trim(p_answer2))::bytea), 'hex')
  THEN
    RETURN QUERY SELECT v_user_id, TRUE;
  ELSE
    RETURN QUERY SELECT v_user_id, FALSE;
  END IF;
END;
$$;

-- Create function to get security questions for an email (public, no answers exposed)
CREATE OR REPLACE FUNCTION public.get_security_questions_for_email(p_email TEXT)
RETURNS TABLE(question1 TEXT, question2 TEXT, has_questions BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_q1 TEXT;
  v_q2 TEXT;
BEGIN
  -- Get user_id from auth.users by email
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT NULL::TEXT, NULL::TEXT, FALSE;
    RETURN;
  END IF;
  
  -- Get questions
  SELECT sq.question1, sq.question2 INTO v_q1, v_q2
  FROM security_questions sq
  WHERE sq.user_id = v_user_id;
  
  IF v_q1 IS NULL THEN
    RETURN QUERY SELECT NULL::TEXT, NULL::TEXT, FALSE;
  ELSE
    RETURN QUERY SELECT v_q1, v_q2, TRUE;
  END IF;
END;
$$;

-- Add trigger for updated_at
CREATE TRIGGER update_security_questions_updated_at
BEFORE UPDATE ON public.security_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();