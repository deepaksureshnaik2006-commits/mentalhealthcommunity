import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    const { action, email, answer1, answer2, newPassword } = await req.json();
    
    console.log(`Security password reset action: ${action} for email: ${email}`);

    if (action === 'get-questions') {
      // Get security questions for email (no auth required)
      const { data, error } = await supabase.rpc('get_security_questions_for_email', {
        p_email: email
      });

      if (error) {
        console.error('Error getting security questions:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to retrieve security questions' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const result = data?.[0];
      
      if (!result || !result.has_questions) {
        return new Response(
          JSON.stringify({ 
            error: 'no_questions',
            message: 'No security questions set up for this account. Please contact support.'
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          question1: result.question1,
          question2: result.question2
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'verify-answers') {
      // Verify security answers only (no password change)
      if (!email || !answer1 || !answer2) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: verifyData, error: verifyError } = await supabase.rpc('verify_security_answers', {
        p_email: email,
        p_answer1: answer1,
        p_answer2: answer2
      });

      if (verifyError) {
        console.error('Error verifying security answers:', verifyError);
        return new Response(
          JSON.stringify({ error: 'Verification failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const result = verifyData?.[0];
      
      if (!result || !result.is_valid) {
        console.log('Security answers verification failed for:', email);
        return new Response(
          JSON.stringify({ verified: false, error: 'Security answers are incorrect' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Security answers verified for:', email);
      return new Response(
        JSON.stringify({ verified: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'verify-and-reset') {
      // Validate inputs
      if (!email || !answer1 || !answer2 || !newPassword) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (newPassword.length < 6) {
        return new Response(
          JSON.stringify({ error: 'Password must be at least 6 characters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify security answers
      const { data: verifyData, error: verifyError } = await supabase.rpc('verify_security_answers', {
        p_email: email,
        p_answer1: answer1,
        p_answer2: answer2
      });

      if (verifyError) {
        console.error('Error verifying security answers:', verifyError);
        return new Response(
          JSON.stringify({ error: 'Verification failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const result = verifyData?.[0];
      
      if (!result || !result.is_valid) {
        console.log('Security answers verification failed for:', email);
        return new Response(
          JSON.stringify({ error: 'Security answers are incorrect' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Answers verified! Update password using admin API
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        result.user_id,
        { password: newPassword }
      );

      if (updateError) {
        console.error('Error updating password:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update password' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Password successfully reset for user:', result.user_id);
      
      return new Response(
        JSON.stringify({ success: true, message: 'Password updated successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Security password reset error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
