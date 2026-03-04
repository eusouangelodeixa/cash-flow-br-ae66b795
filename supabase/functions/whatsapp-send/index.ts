import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const body = await req.json();

    // Test mode - just check if credentials exist
    if (body.action === "test") {
      if (!uazapiUrl || !uazapiToken) {
        return new Response(
          JSON.stringify({ error: "UAZAPI_URL ou UAZAPI_TOKEN não configurados" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ success: true, message: "Credenciais Uazapi configuradas" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send message via Uazapi
    const { phone, message } = body;
    if (!phone || !message) {
      return new Response(
        JSON.stringify({ error: "phone e message são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!uazapiUrl || !uazapiToken) {
      return new Response(
        JSON.stringify({ error: "Uazapi não configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send text message via Uazapi
    const baseUrl = uazapiUrl.replace(/\/$/, "");
    const response = await fetch(`${baseUrl}/send/text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "token": uazapiToken,
      },
      body: JSON.stringify({
        number: phone,
        text: message,
      }),
    });

    const result = await response.json();

    // Log outgoing message
    await supabase.from("whatsapp_messages").insert({
      phone,
      direction: "outgoing",
      message_type: "text",
      content: message,
      status: "completed",
    });

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
