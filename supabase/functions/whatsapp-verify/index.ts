import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const uazapiUrl = Deno.env.get("UAZAPI_URL");
    const uazapiToken = Deno.env.get("UAZAPI_TOKEN");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = authData.user.id;

    const body = await req.json();
    const { action, phone, code } = body;

    if (action === "send-code") {
      if (!phone) {
        return new Response(JSON.stringify({ error: "Número de telefone obrigatório" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!uazapiUrl || !uazapiToken) {
        return new Response(JSON.stringify({ error: "Uazapi não configurado" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Clean phone number - only digits
      const cleanPhone = phone.replace(/\D/g, "");

      // Generate 6-digit code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

      // Save verification record
      await supabase.from("whatsapp_verifications").insert({
        user_id: userId,
        phone: cleanPhone,
        code: verificationCode,
        expires_at: expiresAt,
      });

      // Send code via Uazapi
      const message = `🔐 *CashFlow* - Código de verificação\n\nSeu código é: *${verificationCode}*\n\nEle expira em 10 minutos.`;
      const baseUrl = uazapiUrl.replace(/\/$/, "");
      const sendUrl = `${baseUrl}/send/text`;

      console.log("Sending to Uazapi:", JSON.stringify({ sendUrl, phone: cleanPhone, tokenLength: uazapiToken.length, tokenPrefix: uazapiToken.substring(0, 8) }));

      const response = await fetch(sendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "token": uazapiToken,
        },
        body: JSON.stringify({ number: cleanPhone, text: message }),
      });

      const result = await response.json().catch(() => ({}));
      console.log("Uazapi response:", JSON.stringify({ status: response.status, result }));

      if (!response.ok) {
        return new Response(JSON.stringify({ error: "Falha ao enviar mensagem", details: result }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, message: "Código enviado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "verify-code") {
      if (!code || !phone) {
        return new Response(JSON.stringify({ error: "Código e telefone obrigatórios" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const cleanPhone = phone.replace(/\D/g, "");

      // Find valid verification
      const { data: verification, error: verErr } = await supabase
        .from("whatsapp_verifications")
        .select("*")
        .eq("user_id", userId)
        .eq("phone", cleanPhone)
        .eq("code", code)
        .eq("verified", false)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (verErr || !verification) {
        return new Response(JSON.stringify({ error: "Código inválido ou expirado" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Mark as verified
      await supabase.from("whatsapp_verifications")
        .update({ verified: true })
        .eq("id", verification.id);

      // Update profile
      await supabase.from("profiles")
        .update({ whatsapp: cleanPhone, whatsapp_verified: true, updated_at: new Date().toISOString() })
        .eq("id", userId);

      return new Response(JSON.stringify({ success: true, message: "Número verificado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else {
      return new Response(JSON.stringify({ error: "Ação inválida" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("WhatsApp verify error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
