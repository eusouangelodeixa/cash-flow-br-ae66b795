import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function sendWhatsApp(uazapiUrl: string, uazapiToken: string, phone: string, message: string) {
  const baseUrl = uazapiUrl.replace(/\/$/, "");
  const res = await fetch(`${baseUrl}/send/text`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "token": uazapiToken },
    body: JSON.stringify({ number: phone, text: message }),
  });
  const data = await res.json().catch(() => ({}));
  console.log("sendWhatsApp response:", JSON.stringify({ status: res.status, data }));
  return { ok: res.ok, data };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const rawBody = await req.text();
    console.log("Webhook received:", rawBody.substring(0, 2000));

    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      console.error("Failed to parse webhook body");
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Uazapi V2 sends different payload structures
    // Try to extract message data from various formats
    const event = body.event || body.type || "";
    const data = body.data || body.message || body;
    
    console.log("Parsed event:", event, "data keys:", Object.keys(data || {}));

    // Extract phone candidates from different Uazapi payload formats
    const normalizePhoneCandidate = (value: unknown): string => {
      if (!value) return "";
      const raw = String(value).trim();
      if (!raw) return "";

      // Ignore non-user JIDs
      if (raw.includes("@g.us") || raw.includes("status@broadcast") || raw.includes("@lid")) return "";

      let v = raw;
      v = v.replace(/^whatsapp:/i, "");
      v = v.replace(/@s\.whatsapp\.net$/i, "");
      v = v.replace(/@c\.us$/i, "");
      v = v.replace(/@lid$/i, "");

      // JID/device suffix formats (e.g. 258879573759:12@s.whatsapp.net)
      if (v.includes("@")) v = v.split("@")[0];
      if (v.includes(":")) v = v.split(":")[0];

      const digits = v.replace(/\D/g, "");
      // E.164 max length is 15 digits. Ignore clearly invalid identifiers (LID/group-like ids)
      if (digits.length < 8 || digits.length > 15) return "";
      return digits;
    };

    const buildPhoneVariants = (phoneDigits: string): string[] => {
      const variants = new Set<string>();
      if (!phoneDigits) return [];

      variants.add(phoneDigits);

      // Try stripping 1, 2, or 3-digit country prefixes
      for (let i = 1; i <= 3; i++) {
        if (phoneDigits.length > i + 6) {
          variants.add(phoneDigits.slice(i));
        }
      }

      // Add suffixes for local-number matching
      [8, 9, 10, 11, 12].forEach((len) => {
        if (phoneDigits.length >= len) {
          variants.add(phoneDigits.slice(-len));
        }
      });

      return Array.from(variants).filter((p) => p.length >= 8 && p.length <= 15);
    };

    // Priority: sender phone first, then direct chat id, then fallback sources
    const phoneSources = [
      { source: "sender_pn", value: data?.sender_pn || body?.sender_pn },
      { source: "sender", value: data?.sender || body?.sender },
      { source: "phone", value: data?.phone || body?.phone || body?.chat?.phone },
      { source: "chatid", value: data?.chatid || body?.chat?.wa_chatid },
      { source: "from", value: data?.from || body?.from },
      { source: "remoteJid", value: data?.key?.remoteJid },
    ];

    const normalizedCandidates = phoneSources
      .map((entry) => ({ ...entry, normalized: normalizePhoneCandidate(entry.value) }))
      .filter((entry) => !!entry.normalized);

    const normalizedPhone = normalizedCandidates[0]?.normalized || "";

    if (!normalizedPhone) {
      console.log("No valid phone found in payload", JSON.stringify(phoneSources));
      return new Response(
        JSON.stringify({ success: true, message: "No phone - skipping" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build variants from all valid candidates to maximize match reliability
    const phoneVariants = new Set<string>();
    normalizedCandidates.forEach((entry) => {
      buildPhoneVariants(entry.normalized).forEach((variant) => phoneVariants.add(variant));
    });

    const phoneVariantsArray = Array.from(phoneVariants);
    console.log("Phone candidates:", normalizedCandidates);
    console.log("Phone selected:", normalizedPhone);
    console.log("Phone variants for lookup:", phoneVariantsArray);

    // Skip messages sent by the API itself
    if (data?.fromMe === true || data?.wasSentByApi === true) {
      console.log("Skipping own message");
      return new Response(
        JSON.stringify({ success: true, message: "Own message - skipping" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Detect message type
    const messageType = (data?.messageType || body?.messageType || "").toLowerCase();
    const isAudio = messageType === "audiomessage" || messageType === "audio" ||
                    data?.type === "audio" || data?.mimetype?.includes("audio") ||
                    !!data?.audioMessage;

    const isText = messageType === "extendedtextmessage" || messageType === "conversation" ||
                   data?.type === "text" || data?.type === "chat" ||
                   !!data?.conversation || !!data?.extendedTextMessage;

    const messageContent = data?.body || data?.text || data?.message ||
                          data?.conversation || data?.extendedTextMessage?.text ||
                          body?.body || body?.text || "";

    const audioUrl = data?.content?.URL || data?.content?.url ||
                     data?.audioUrl || data?.mediaUrl || data?.url ||
                     data?.audioMessage?.url || body?.mediaUrl || "";

    console.log("Message type:", { messageType, isAudio, isText, hasContent: !!messageContent, hasAudioUrl: !!audioUrl });

    const phone = normalizedPhone;

    // Check if user is in verification flow
    const { data: pendingVerification } = await supabase
      .from("whatsapp_verifications")
      .select("*")
      .in("phone", phoneVariantsArray)
      .eq("verified", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const uazapiUrl = Deno.env.get("UAZAPI_URL");
    const uazapiToken = Deno.env.get("UAZAPI_TOKEN");

    // Handle verification code
    if (pendingVerification && isText) {
      const code = messageContent.trim();
      if (code === pendingVerification.code) {
        await supabase.from("whatsapp_verifications").update({ verified: true }).eq("id", pendingVerification.id);
        await supabase.from("profiles").update({ 
          whatsapp: pendingVerification.phone, 
          whatsapp_verified: true,
          updated_at: new Date().toISOString(),
        }).eq("id", pendingVerification.user_id);

        if (uazapiUrl && uazapiToken) {
          await sendWhatsApp(uazapiUrl, uazapiToken, phone,
            "✅ WhatsApp verificado com sucesso! Agora você pode enviar áudios com comandos.\n\nExemplos:\n🎙️ \"Cadastra um iPhone 15 Pro 256GB preto, paguei 4500\"\n🎙️ \"Vendi o iPhone 15 Pro por 5500 pro João\"\n🎙️ \"Quantos iPhones tenho?\""
          );
        }

        return new Response(JSON.stringify({ success: true, action: "verified" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else if (code.length >= 4 && code.length <= 8) {
        if (uazapiUrl && uazapiToken) {
          await sendWhatsApp(uazapiUrl, uazapiToken, phone,
            "❌ Código incorreto. Tente novamente ou gere um novo código no app."
          );
        }
        return new Response(JSON.stringify({ success: false, action: "wrong_code" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Check if user is verified - try exact variants first
    let profile: any = null;
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, nome, whatsapp")
      .in("whatsapp", phoneVariantsArray)
      .eq("whatsapp_verified", true)
      .limit(1)
      .maybeSingle();
    
    profile = profileData;

    // Fallback: try matching by phone suffix (last 9+ digits)
    if (!profile && normalizedPhone.length >= 9) {
      const phoneSuffix = normalizedPhone.slice(-9);
      const { data: fallbackProfile } = await supabase
        .from("profiles")
        .select("id, nome, whatsapp")
        .eq("whatsapp_verified", true)
        .like("whatsapp", `%${phoneSuffix}`)
        .limit(1)
        .maybeSingle();
      profile = fallbackProfile;
      if (profile) console.log("Profile found via suffix fallback:", profile.whatsapp);
    }

    console.log("Profile lookup:", { phoneVariantsArray, found: !!profile, profileWhatsapp: profile?.whatsapp });

    if (!profile) {
      if (uazapiUrl && uazapiToken) {
        await sendWhatsApp(uazapiUrl, uazapiToken, phone,
          "👋 Olá! Para usar o assistente por WhatsApp, primeiro vincule seu número no app CashFlow na seção Perfil."
        );
      }
      return new Response(JSON.stringify({ success: false, reason: "not_verified" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deduplicação anti-loop para eventos repetidos de áudio (Uazapi pode reenviar o mesmo webhook)
    const recentCutoff = new Date(Date.now() - 90 * 1000).toISOString();
    if (isAudio && audioUrl) {
      const { data: duplicateAudio } = await supabase
        .from("whatsapp_messages")
        .select("id")
        .eq("user_id", profile.id)
        .eq("phone", normalizedPhone)
        .eq("direction", "incoming")
        .eq("message_type", "audio")
        .eq("content", audioUrl)
        .gt("created_at", recentCutoff)
        .limit(1)
        .maybeSingle();

      if (duplicateAudio) {
        console.log("Duplicate audio webhook ignored:", { phone: normalizedPhone, audioUrl, duplicateId: duplicateAudio.id });
        return new Response(JSON.stringify({ success: true, deduplicated: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Log incoming message
    const { data: msgRecord } = await supabase
      .from("whatsapp_messages")
      .insert({
        user_id: profile.id,
        phone: normalizedPhone,
        direction: "incoming",
        message_type: isAudio ? "audio" : "text",
        content: isAudio ? audioUrl : messageContent,
        action_result: {
          external_message_id: data?.messageid || null,
          external_raw_id: data?.id || null,
        },
        status: "received",
      })
      .select("id")
      .single();

    console.log("Message logged:", msgRecord?.id);

    // Process with AI (audio or text)
    if ((isAudio && audioUrl) || (isText && messageContent)) {
      console.log("Calling whatsapp-process-audio...");
      const processRes = await fetch(`${supabaseUrl}/functions/v1/whatsapp-process-audio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          audioUrl: isAudio ? audioUrl : undefined,
          textContent: isText ? messageContent : undefined,
          phone,
          messageId: msgRecord?.id,
          whatsappMessageId: data?.messageid || "",
          rawMessageId: data?.id || "",
          skipTranscription: isText,
        }),
      });

      const result = await processRes.json().catch(() => ({}));
      console.log("Process-audio result:", JSON.stringify(result).substring(0, 500));

      if (!processRes.ok || result?.error) {
        if (uazapiUrl && uazapiToken) {
          await sendWhatsApp(
            uazapiUrl,
            uazapiToken,
            phone,
            "⚠️ Recebi seu áudio, mas não consegui processar agora. Tente novamente em alguns segundos ou envie o comando em texto para eu confirmar execução/não execução."
          );
        }
      }

      return new Response(JSON.stringify({ success: processRes.ok, result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Message received" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
