-- Tighten security: password reset codes should only be accessible by backend (service role)
-- Service role bypasses RLS, so we remove permissive client-access policies.

DROP POLICY IF EXISTS "Allow anonymous insert for reset codes" ON public.password_reset_codes;
DROP POLICY IF EXISTS "Allow anonymous select for reset codes" ON public.password_reset_codes;
DROP POLICY IF EXISTS "Allow anonymous update for reset codes" ON public.password_reset_codes;

-- (Optional hardening) Remove any direct table privileges from anon/authenticated roles
REVOKE ALL ON TABLE public.password_reset_codes FROM anon;
REVOKE ALL ON TABLE public.password_reset_codes FROM authenticated;