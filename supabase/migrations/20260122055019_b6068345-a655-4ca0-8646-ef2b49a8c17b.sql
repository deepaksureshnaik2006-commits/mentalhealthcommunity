-- Create table for password reset OTP codes
CREATE TABLE public.password_reset_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  used BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.password_reset_codes ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (edge function uses service role, but we need this for security)
CREATE POLICY "Allow anonymous insert for reset codes"
ON public.password_reset_codes
FOR INSERT
WITH CHECK (true);

-- Allow anonymous select for verification
CREATE POLICY "Allow anonymous select for reset codes"
ON public.password_reset_codes
FOR SELECT
USING (true);

-- Allow anonymous update for marking as used
CREATE POLICY "Allow anonymous update for reset codes"
ON public.password_reset_codes
FOR UPDATE
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_password_reset_codes_email ON public.password_reset_codes(email);
CREATE INDEX idx_password_reset_codes_expires_at ON public.password_reset_codes(expires_at);