import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

interface RequestBody {
  action: "send" | "verify";
  email: string;
  code?: string;
  newPassword?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, email, code, newPassword }: RequestBody = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (action === "send") {
      // Check if user exists
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      const userExists = userData?.users?.some((u) => u.email?.toLowerCase() === email.toLowerCase());

      if (!userExists) {
        // Don't reveal if user exists - just say code sent
        console.log("User not found, returning success anyway for security");
        return new Response(
          JSON.stringify({ success: true, message: "If an account exists, a code was sent" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Generate OTP
      const otp = generateOTP();
      console.log(`Generated OTP for ${email}: ${otp}`);

      // Invalidate any existing codes for this email
      await supabase
        .from("password_reset_codes")
        .update({ used: true })
        .eq("email", email.toLowerCase())
        .eq("used", false);

      // Store the new code
      const { error: insertError } = await supabase
        .from("password_reset_codes")
        .insert({
          email: email.toLowerCase(),
          code: otp,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        });

      if (insertError) {
        console.error("Failed to store OTP:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to generate reset code" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Send email with OTP using fetch
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Mindful Heaven <onboarding@resend.dev>",
          to: [email],
          subject: "Your Password Reset Code - Mindful Heaven",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #4F7A6E; text-align: center;">🌿 Mindful Heaven</h1>
              <h2 style="color: #333; text-align: center;">Password Reset</h2>
              <p style="text-align: center; color: #666;">Use the code below to reset your password:</p>
              <div style="background: linear-gradient(135deg, #E8F0ED 0%, #F5E6D3 100%); padding: 30px; text-align: center; border-radius: 15px; margin: 20px 0; border: 1px solid #D1E0DA;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #4F7A6E; font-family: monospace;">${otp}</span>
              </div>
              <p style="text-align: center; color: #999; font-size: 14px;">⏱️ This code expires in 10 minutes.</p>
              <p style="text-align: center; color: #999; font-size: 14px;">If you didn't request this, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
              <p style="text-align: center; color: #bbb; font-size: 12px;">Mindful Heaven - Your safe space for mental wellness</p>
            </div>
          `,
        }),
      });

      const emailResult = await emailResponse.json();
      console.log("Email API response:", JSON.stringify(emailResult));

      if (!emailResponse.ok) {
        console.error("Email sending failed:", emailResult);
        // Still return success to not reveal if email exists, but log the error
      }

      return new Response(
        JSON.stringify({ success: true, message: "Code sent to your email" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (action === "verify") {
      if (!code || !newPassword) {
        return new Response(
          JSON.stringify({ error: "Code and new password are required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (newPassword.length < 6) {
        return new Response(
          JSON.stringify({ error: "Password must be at least 6 characters" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Find valid code
      const { data: codeData, error: codeError } = await supabase
        .from("password_reset_codes")
        .select("*")
        .eq("email", email.toLowerCase())
        .eq("code", code)
        .eq("used", false)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (codeError || !codeData) {
        console.log("Invalid or expired code:", codeError);
        return new Response(
          JSON.stringify({ error: "Invalid or expired code" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Mark code as used
      await supabase
        .from("password_reset_codes")
        .update({ used: true })
        .eq("id", codeData.id);

      // Find user and update password
      const { data: userData } = await supabase.auth.admin.listUsers();
      const user = userData?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

      if (!user) {
        return new Response(
          JSON.stringify({ error: "User not found" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        password: newPassword,
      });

      if (updateError) {
        console.error("Failed to update password:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update password" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      console.log("Password updated successfully for:", email);

      return new Response(
        JSON.stringify({ success: true, message: "Password updated successfully" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in password-reset function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
