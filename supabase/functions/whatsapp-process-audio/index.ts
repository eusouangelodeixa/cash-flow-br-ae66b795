import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const fieldLabels: Record<string, string> = {
  modelo: "Modelo do aparelho",
  capacidade: "Capacidade (ex: 128GB)",
  cor: "Cor do aparelho",
  condicao: "Condição (novo_lacrado, usado_a, usado_b, para_pecas)",
  preco_custo: "Preço de compra (custo)",
  preco_venda: "Preço de venda",
  cliente: "Nome do cliente",
};

const requiredFieldsByAction: Record<string, string[]> = {
  register_sale: ["cliente"],
  register_device: ["modelo", "capacidade", "cor", "condicao", "preco_custo", "preco_venda"],
};

const normalize = (value: string) =>
  (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();

const invalidClients = ["", "desconhecido", "via whatsapp", "cliente", "n/a", "nao informado", "não informado"];

const isFieldPresent = (val: any) => {
  if (val === null || val === undefined) return false;
  if (typeof val === "string" && val.trim() === "") return false;
  if (typeof val === "number" && val <= 0) return false;
  return true;
};

const parsePositiveNumber = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  if (typeof value !== "string") return null;

  const cleaned = value.replace(/[^\d.,-]/g, "").trim();
  if (!cleaned) return null;

  let normalizedNumber = cleaned;

  if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    normalizedNumber = cleaned.replace(/\./g, "");
  } else if (cleaned.includes(".") && cleaned.includes(",")) {
    normalizedNumber = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (cleaned.includes(",")) {
    normalizedNumber = cleaned.replace(",", ".");
  }

  const parsed = Number(normalizedNumber);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const normalizeDeviceCapacity = (value: unknown, fallbackText = ""): string => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return `${Math.round(value)}GB`;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    const capacityMatch = trimmed.match(/(\d{2,4})\s*gb/i);
    if (capacityMatch?.[1]) return `${capacityMatch[1]}GB`;

    if (/^\d{2,4}$/.test(trimmed)) return `${trimmed}GB`;
    if (trimmed) return trimmed;
  }

  const textMatch = String(fallbackText || "").match(/(\d{2,4})\s*gb/i);
  return textMatch?.[1] ? `${textMatch[1]}GB` : "";
};

const normalizeDeviceCondition = (value: unknown, fallbackText = ""): string => {
  const combined = normalize(`${String(value || "")} ${String(fallbackText || "")}`);
  if (!combined) return "";

  if (combined.includes("para_pecas") || combined.includes("para pecas") || combined.includes("pecas") || combined.includes("peca")) {
    return "para_pecas";
  }
  if (combined.includes("usado_b") || combined.includes("usado b") || combined.includes("grau b")) {
    return "usado_b";
  }
  if (combined.includes("usado_a") || combined.includes("usado a") || combined.includes("seminovo") || combined.includes("semi novo")) {
    return "usado_a";
  }
  if (combined.includes("novo_lacrado") || combined.includes("novo") || combined.includes("lacrado") || combined.includes("selado")) {
    return "novo_lacrado";
  }

  return "";
};

const extractPriceFromTranscription = (text: string, kind: "custo" | "venda"): number | null => {
  const normalizedText = normalize(text || "");

  const patterns = kind === "custo"
    ? [
        /(?:preco de compra|preco compra|custo|compra|paguei)\D{0,18}([\d.,]+)/i,
      ]
    : [
        /(?:preco de venda|valor de venda|vendas?|vendo|por)\D{0,18}([\d.,]+)/i,
      ];

  for (const pattern of patterns) {
    const match = normalizedText.match(pattern);
    if (!match?.[1]) continue;

    const parsed = parsePositiveNumber(match[1]);
    if (parsed) return parsed;
  }

  return null;
};

const coerceRegisterDevicePayload = (baseAction: any, pendingContext: any, transcriptionText: string) => {
  const merged = {
    ...(pendingContext?.collected_data || {}),
    ...(baseAction || {}),
  };

  const modelo = typeof merged.modelo === "string" ? merged.modelo.trim() : "";
  const capacidade = normalizeDeviceCapacity(merged.capacidade, transcriptionText);
  const cor = typeof merged.cor === "string" ? merged.cor.trim() : "";
  const condicao = normalizeDeviceCondition(merged.condicao, transcriptionText);
  const preco_custo = parsePositiveNumber(merged.preco_custo) ?? extractPriceFromTranscription(transcriptionText, "custo");
  const preco_venda = parsePositiveNumber(merged.preco_venda) ?? extractPriceFromTranscription(transcriptionText, "venda");

  return {
    ...merged,
    modelo,
    capacidade,
    cor,
    condicao,
    preco_custo: preco_custo ?? null,
    preco_venda: preco_venda ?? null,
  };
};

const buildAllQuestionsMessage = (partialAction: string, missingFields: string[], collectedData: any, originalTranscription?: string) => {
  const questions = missingFields.map((f, i) => `${i + 1}. ${fieldLabels[f] || f}`).join("\n");
  const actionLabel = partialAction === "register_sale" ? "registrar a venda" : "cadastrar o aparelho";

  return {
    interpretedAction: {
      action: "need_info",
      partial_action: partialAction,
      missing_fields: missingFields,
      question: `Para ${actionLabel}, preciso dos seguintes dados:\n${questions}\n\nResponda tudo em uma única mensagem ou áudio.`,
    },
    actionResult: {
      success: true,
      action: "need_info",
      missing_fields: missingFields,
      partial_action: partialAction,
      pending_context: {
        partial_action: partialAction,
        collected_data: collectedData,
        missing_fields: missingFields,
        original_transcription: originalTranscription || "",
      },
    },
    replyMessage: `❓ Para ${actionLabel}, preciso dos seguintes dados:\n${questions}\n\n_Responda tudo em uma única mensagem ou áudio._`,
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const uazapiUrl = Deno.env.get("UAZAPI_URL");
    const uazapiToken = Deno.env.get("UAZAPI_TOKEN");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log("process-audio received:", JSON.stringify(body).substring(0, 500));

    // Test mode
    if (body.action === "test") {
      if (!openaiKey) {
        return new Response(
          JSON.stringify({ error: "OPENAI_API_KEY não configurada" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${openaiKey}` },
      });
      if (!res.ok) throw new Error("API key inválida");
      await res.text();
      return new Response(
        JSON.stringify({ success: true, message: "OpenAI conectada" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { audioUrl, phone, messageId, textContent, skipTranscription, whatsappMessageId, rawMessageId } = body;
    if ((!audioUrl && !textContent) || !phone) {
      return new Response(
        JSON.stringify({ error: "audioUrl/textContent e phone são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI não configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update message status
    if (messageId) {
      await supabase.from("whatsapp_messages").update({ status: "processing" }).eq("id", messageId);
    }

    let transcription: string;

    if (skipTranscription && textContent) {
      transcription = textContent;
      console.log("Using text content directly:", transcription);
    } else {
      // Download audio via Uazapi
      let audioBlob: Blob;
      
      if (uazapiUrl && uazapiToken) {
        const baseUrl = uazapiUrl.replace(/\/$/, "");
        const idCandidates = Array.from(new Set([
          whatsappMessageId,
          rawMessageId,
          typeof rawMessageId === "string" ? rawMessageId.split(":").pop() : undefined,
        ].filter(Boolean) as string[]));

        const endpointCandidates = [
          `${baseUrl}/message/download`,
          `${baseUrl}/message/downloadMediaMessage`,
          `${baseUrl}/chat/downloadMediaMessage`,
        ];

        let downloaded = false;

        for (const endpoint of endpointCandidates) {
          for (const id of idCandidates) {
            const payloads = [{ messageid: id }, { messageId: id }, { id }];
            for (const payload of payloads) {
              console.log("Trying Uazapi media download:", { endpoint, payload });
              const downloadRes = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json", "token": uazapiToken },
                body: JSON.stringify(payload),
              });

              if (!downloadRes.ok) {
                const errText = await downloadRes.text();
                console.error("Uazapi download failed:", downloadRes.status, errText);
                continue;
              }

              const contentType = downloadRes.headers.get("content-type") || "";

              if (contentType.includes("application/json")) {
                const mediaData = await downloadRes.json().catch(() => null);
                console.log("Uazapi media response keys:", mediaData ? Object.keys(mediaData) : "null");

                const base64Value = mediaData?.base64 || mediaData?.data?.base64 || mediaData?.file?.base64;
                const mediaUrl = mediaData?.url || mediaData?.mediaUrl || mediaData?.publicUrl || mediaData?.fileURL || mediaData?.data?.url || mediaData?.data?.fileURL;

                if (base64Value) {
                  const binaryStr = atob(base64Value);
                  const bytes = new Uint8Array(binaryStr.length);
                  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
                  audioBlob = new Blob([bytes], { type: "audio/ogg" });
                  downloaded = true;
                  break;
                }

                if (mediaUrl) {
                  const mediaResponse = await fetch(mediaUrl);
                  if (!mediaResponse.ok) continue;
                  audioBlob = await mediaResponse.blob();
                  downloaded = true;
                  break;
                }
              } else {
                audioBlob = await downloadRes.blob();
                downloaded = true;
                break;
              }
            }
            if (downloaded) break;
          }
          if (downloaded) break;
        }

        if (!downloaded) {
          console.log("Falling back to direct audio URL download");
          const audioResponse = await fetch(audioUrl);
          if (!audioResponse.ok) throw new Error(`Failed to download audio: ${audioResponse.status}`);
          audioBlob = await audioResponse.blob();
        }
      } else {
        console.log("Downloading audio directly from:", audioUrl);
        const audioResponse = await fetch(audioUrl);
        if (!audioResponse.ok) throw new Error(`Failed to download audio: ${audioResponse.status}`);
        audioBlob = await audioResponse.blob();
      }
      
      console.log("Audio blob size:", audioBlob.size, "type:", audioBlob.type);

      const formData = new FormData();
      formData.append("file", audioBlob, "audio.ogg");
      formData.append("model", "whisper-1");
      formData.append("language", "pt");

      const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${openaiKey}` },
        body: formData,
      });

      if (!whisperRes.ok) {
        const errText = await whisperRes.text();
        throw new Error(`Whisper error: ${errText}`);
      }

      const whisperData = await whisperRes.json();
      transcription = whisperData.text;
      console.log("Transcription:", transcription);
    }

    // Find user reliably (message log -> phone variants)
    const normalizePhone = (value: unknown): string => String(value || "").replace(/\D/g, "");

    const buildPhoneVariants = (phoneDigits: string): string[] => {
      if (!phoneDigits) return [];
      const variants = new Set<string>([phoneDigits]);

      for (let i = 1; i <= 3; i++) {
        if (phoneDigits.length > i + 6) variants.add(phoneDigits.slice(i));
      }

      [8, 9, 10, 11, 12].forEach((len) => {
        if (phoneDigits.length >= len) variants.add(phoneDigits.slice(-len));
      });

      return Array.from(variants).filter((p) => p.length >= 8 && p.length <= 15);
    };

    const normalizedIncomingPhone = normalizePhone(phone);
    const phoneLookupVariants = new Set<string>(buildPhoneVariants(normalizedIncomingPhone));

    let profile: any = null;

    // 1) Prefer user_id already persisted by webhook
    if (messageId) {
      const { data: msg } = await supabase
        .from("whatsapp_messages")
        .select("user_id, phone")
        .eq("id", messageId)
        .maybeSingle();

      const msgPhone = normalizePhone(msg?.phone);
      buildPhoneVariants(msgPhone).forEach((v) => phoneLookupVariants.add(v));

      if (msg?.user_id) {
        const { data: profileByMessageUser } = await supabase
          .from("profiles")
          .select("id, nome, whatsapp")
          .eq("id", msg.user_id)
          .eq("whatsapp_verified", true)
          .maybeSingle();

        profile = profileByMessageUser;
      }
    }

    // 2) Fallback by exact/variant phone match
    if (!profile) {
      const { data: profileByPhone } = await supabase
        .from("profiles")
        .select("id, nome, whatsapp")
        .in("whatsapp", Array.from(phoneLookupVariants))
        .eq("whatsapp_verified", true)
        .limit(1)
        .maybeSingle();

      profile = profileByPhone;
    }

    // 3) Fallback by suffix matching for international formats
    if (!profile) {
      const suffixes = Array.from(phoneLookupVariants)
        .filter((p) => p.length >= 9)
        .map((p) => p.slice(-9));

      for (const suffix of new Set(suffixes)) {
        const { data: fallbackProfile } = await supabase
          .from("profiles")
          .select("id, nome, whatsapp")
          .eq("whatsapp_verified", true)
          .like("whatsapp", `%${suffix}`)
          .limit(1)
          .maybeSingle();

        if (fallbackProfile) {
          profile = fallbackProfile;
          break;
        }
      }
    }

    // Keep canonical variants for subsequent context queries
    buildPhoneVariants(normalizePhone(profile?.whatsapp)).forEach((v) => phoneLookupVariants.add(v));
    const phoneVariants = Array.from(phoneLookupVariants);

    if (!profile) {
      if (messageId) {
        await supabase.from("whatsapp_messages").update({
          transcription,
          status: "error",
          action_result: { error: "Usuário não encontrado ou não verificado" },
        }).eq("id", messageId);
      }
      return new Response(
        JSON.stringify({ success: false, error: "Usuário não verificado", transcription }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User found:", profile.id, profile.nome);

    // Fetch user's available stock
    const { data: stockDevices } = await supabase
      .from("devices")
      .select("id, modelo, capacidade, cor, condicao, preco_custo, preco_venda, status")
      .eq("user_id", profile.id)
      .eq("status", "disponivel");

    const stockList = (stockDevices || []).map((d: any) =>
      `- ${d.modelo} | ${d.capacidade} | ${d.cor} | Condição: ${d.condicao} | Custo: R$${d.preco_custo} | Venda: R$${d.preco_venda || 'N/A'} | ID: ${d.id}`
    ).join("\n");

    const stockContext = stockDevices && stockDevices.length > 0
      ? `\n\nESTOQUE ATUAL DO USUÁRIO (${stockDevices.length} aparelhos disponíveis):\n${stockList}`
      : "\n\nESTOQUE ATUAL: Vazio (nenhum aparelho disponível)";

    // Check for pending context (user was asked for missing data)
    let pendingQuery = supabase
      .from("whatsapp_messages")
      .select("id, action_result, created_at")
      .eq("user_id", profile.id)
      .in("phone", phoneVariants)
      .order("created_at", { ascending: false })
      .limit(20);

    if (messageId) pendingQuery = pendingQuery.neq("id", messageId);

    const { data: recentMessages } = await pendingQuery;

    const latestNeedInfo = (recentMessages || []).find((msg: any) => {
      const ar = msg?.action_result;
      return ar?.action === "need_info" && !!ar?.pending_context?.partial_action;
    });

    let pendingContext = latestNeedInfo?.action_result?.pending_context || null;

    const normalizedTranscription = normalize(transcription || "");
    const pendingMissingFields: string[] = Array.isArray(pendingContext?.missing_fields)
      ? pendingContext.missing_fields
      : [];

    const fieldHints: Record<string, string[]> = {
      modelo: ["modelo", "iphone", "samsung", "motorola", "xiaomi", "galaxy", "redmi"],
      capacidade: ["capacidade", "gb", "giga"],
      cor: ["cor", "preto", "branco", "azul", "prata", "grafite", "dourado"],
      condicao: ["condicao", "condição", "lacrado", "novo", "seminovo", "usado", "pecas", "peças"],
      preco_custo: ["compra", "custo", "paguei"],
      preco_venda: ["preco de venda", "preço de venda", "valor de venda"],
      cliente: ["cliente", "nome", "joao", "joão", "maria"],
    };

    const mentionsPendingField = pendingMissingFields.some((field) => {
      const hints = fieldHints[field] || [field];
      return hints.some((hint) => normalizedTranscription.includes(normalize(hint)));
    });

    const explicitRestart = /^(novo comando|cancelar|cancela|reiniciar|resetar|esquece( isso)?|ignorar anterior)/.test(normalizedTranscription);
    const startsLikeNewCommand = /^(cadastr|registr|adicion|vend|consult|mostr|quant)/.test(normalizedTranscription)
      && normalizedTranscription.split(" ").length >= 2;

    // If it starts like a new command, ALWAYS treat as fresh regardless of field hints
    const pendingAgeMs = latestNeedInfo?.created_at ? Date.now() - new Date(latestNeedInfo.created_at).getTime() : null;
    const isStalePending = typeof pendingAgeMs === "number" && pendingAgeMs > 15 * 60 * 1000;
    const looksLikeFreshCommand = explicitRestart || startsLikeNewCommand;

    if (pendingContext && (looksLikeFreshCommand || isStalePending)) {
      console.log("Ignoring pending context (fresh command or stale):", JSON.stringify({
        sourceMessageId: latestNeedInfo?.id, looksLikeFreshCommand, isStalePending, pendingAgeMs, mentionsPendingField,
      }));
      pendingContext = null;
    }

    // Build GPT prompt with context
    let gptContextPrefix = "";
    let combinedTranscription = transcription;
    if (pendingContext) {
      console.log("Pending context recovered:", JSON.stringify(pendingContext));
      const collected = pendingContext.collected_data || {};
      const collectedStr = Object.entries(collected)
        .filter(([, v]) => isFieldPresent(v))
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
      const missingStr = (pendingContext.missing_fields || []).join(", ");
      const origTranscription = pendingContext.original_transcription || "";
      
      // Concatenate original + new transcription so GPT has ALL data
      if (origTranscription) {
        combinedTranscription = `${origTranscription}. Complemento: ${transcription}`;
        console.log("Combined transcription:", combinedTranscription);
      }
      
      gptContextPrefix = `\n\nCONTEXTO PENDENTE: O usuário estava completando uma ação "${pendingContext.partial_action}".
Dados já coletados: {${collectedStr}}
Campos que faltavam: [${missingStr}]
A mensagem atual COMPLETA (original + complemento) contém TODOS os dados. 
IMPORTANTE: Se a ação pendente é "register_device", retorne action "register_device" com todos os campos preenchidos. NÃO retorne "stock_mismatch" para cadastros.
Extraia TODOS os campos e complete a ação.\n`;
    }

    // ALWAYS interpret with GPT (single-pass, no field-by-field logic)
    const systemPrompt = `Você é um assistente de uma loja de celulares. Interprete o comando do usuário e retorne um JSON com a ação a ser executada.

REGRAS CRÍTICAS PARA VENDAS:
1. Você SÓ pode registrar venda de aparelhos que EXISTEM no estoque do usuário (listado abaixo).
2. Se o modelo mencionado NÃO existe no estoque, retorne action "stock_mismatch" com uma explicação.
3. Se existem MÚLTIPLOS aparelhos do mesmo modelo com capacidades/cores diferentes, liste TODOS os campos ambíguos em missing_fields.
4. O preço de venda DEVE SER o preço cadastrado no estoque (preco_venda). IGNORE qualquer preço mencionado pelo usuário.
5. SEMPRE exija o nome do cliente. Se não foi mencionado, inclua "cliente" em missing_fields.
6. Ao registrar venda, SEMPRE inclua o "device_id" do aparelho do estoque.
7. Se faltam dados, liste TODOS os campos faltantes de uma vez em missing_fields. NÃO peça um campo de cada vez.

REGRAS CRÍTICAS PARA CADASTRO DE APARELHO (register_device):
1. Cadastro é ADICIONAR um aparelho NOVO ao estoque. NÃO confunda com venda.
2. SÓ inclua campos que o usuário EXPLICITAMENTE mencionou. NÃO invente valores.
3. Campos obrigatórios: modelo, capacidade, cor, condicao, preco_custo, preco_venda.
4. Se QUALQUER campo obrigatório não foi mencionado, retorne action "need_info" com TODOS os campos faltantes em missing_fields. INCLUA TAMBÉM os campos já coletados no JSON (ex: "modelo": "iPhone 14 Pro").
5. Campos não mencionados devem ser "" (string vazia) ou null (número).
6. NUNCA retorne "stock_mismatch" para cadastro. O aparelho está sendo ADICIONADO, não vendido.

Ações possíveis:
1. "register_device" - Cadastrar/adicionar aparelho ao estoque
   Campos: { action: "register_device", modelo, capacidade, cor, condicao, preco_custo, preco_venda, notas? }

2. "register_sale" - Registrar venda (SÓ se aparelho está no estoque E todos dados completos)
   Campos: { action: "register_sale", device_id, modelo, capacidade, cor, condicao, preco_venda, preco_custo, cliente, tipo? }

3. "query_stock" - Consultar estoque
   Campos: { action: "query_stock", filtro?: string }

4. "need_info" - Faltam dados. LISTE TODOS de uma vez. INCLUA os campos já extraídos no JSON.
   Campos: { action: "need_info", missing_fields: string[], partial_action: string, modelo?: string, capacidade?: string, cor?: string, condicao?: string, preco_custo?: number, preco_venda?: number, cliente?: string }

5. "stock_mismatch" - Aparelho não está no estoque (SÓ para vendas, NUNCA para cadastro)
   Campos: { action: "stock_mismatch", message: string }

6. "unknown" - Não conseguiu interpretar
   Campos: { action: "unknown", message: "explicação" }

Condições válidas: novo_lacrado, usado_a, usado_b, para_pecas
Tipos de venda: venda, troca
${gptContextPrefix}
${stockContext}

Sempre responda APENAS com o JSON, sem markdown.`;

    const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: combinedTranscription },
        ],
        temperature: 0.1,
      }),
    });

    if (!gptRes.ok) {
      const errText = await gptRes.text();
      throw new Error(`GPT error: ${errText}`);
    }

    const gptData = await gptRes.json();
    const interpretedText = gptData.choices[0].message.content;
    console.log("GPT interpretation:", interpretedText);

    let interpretedAction: any;
    try {
      interpretedAction = JSON.parse(interpretedText);
    } catch {
      interpretedAction = { action: "unknown", message: interpretedText };
    }

    // POST-GPT OVERRIDE: ONLY override stock_mismatch when pending context is register_device (never override register_sale)
    if (pendingContext?.partial_action === "register_device" && 
        interpretedAction.action === "stock_mismatch") {
      console.log("Override: GPT returned", interpretedAction.action, "but pending context is register_device. Forcing register_device.");
      // Merge collected data from pending context with whatever GPT extracted
      const merged = { ...pendingContext.collected_data };
      const allFields = ["modelo", "capacidade", "cor", "condicao", "preco_custo", "preco_venda"];
      for (const f of allFields) {
        if (isFieldPresent(interpretedAction[f])) merged[f] = interpretedAction[f];
      }
      interpretedAction = { action: "register_device", ...merged };
      console.log("Merged register_device:", JSON.stringify(interpretedAction));
    }

    // SELF-HEALING: para cadastro, recalcule campos faltantes com base no que já foi extraído + contexto pendente + transcrição
    const shouldRepairRegisterDevice =
      interpretedAction.action === "register_device" ||
      (interpretedAction.action === "need_info" &&
        ((interpretedAction.partial_action || pendingContext?.partial_action) === "register_device"));

    if (shouldRepairRegisterDevice) {
      const repaired = coerceRegisterDevicePayload(interpretedAction, pendingContext, combinedTranscription);
      const recalculatedMissing = requiredFieldsByAction.register_device.filter(
        (field) => !isFieldPresent(repaired[field])
      );

      if (recalculatedMissing.length === 0) {
        interpretedAction = {
          action: "register_device",
          ...repaired,
        };
      } else {
        interpretedAction = {
          action: "need_info",
          partial_action: "register_device",
          missing_fields: recalculatedMissing,
          ...repaired,
        };
      }

      console.log("Repaired register_device interpretation:", JSON.stringify({
        action: interpretedAction.action,
        missing_fields: interpretedAction.missing_fields || [],
        modelo: interpretedAction.modelo,
        capacidade: interpretedAction.capacidade,
        cor: interpretedAction.cor,
        condicao: interpretedAction.condicao,
        preco_custo: interpretedAction.preco_custo,
        preco_venda: interpretedAction.preco_venda,
      }));
    }

    // Execute action
    let actionResult: any = { success: false };
    let replyMessage = "";

    if (interpretedAction.action === "register_device") {
      const normalizedCondicao = normalizeDeviceCondition(interpretedAction.condicao, combinedTranscription);
      interpretedAction.condicao = normalizedCondicao || interpretedAction.condicao;

      const missingFields = requiredFieldsByAction.register_device.filter((field) => !isFieldPresent(interpretedAction[field]));
      if (missingFields.length > 0) {
        const need = buildAllQuestionsMessage("register_device", missingFields, interpretedAction, combinedTranscription);
        interpretedAction = need.interpretedAction;
        actionResult = need.actionResult;
        replyMessage = need.replyMessage;
      } else {
        const { error } = await supabase.from("devices").insert({
          user_id: profile.id,
          modelo: interpretedAction.modelo,
          capacidade: interpretedAction.capacidade,
          cor: interpretedAction.cor,
          cor_hex: "#000000",
          condicao: normalizedCondicao,
          preco_custo: interpretedAction.preco_custo,
          preco_venda: interpretedAction.preco_venda || null,
          notas: interpretedAction.notas || "Cadastrado via WhatsApp",
          status: "disponivel",
          imei: "",
        });

        if (error) {
          actionResult = { success: false, error: error.message };
          replyMessage = `❌ Erro ao cadastrar: ${error.message}`;
        } else {
          actionResult = { success: true, action: "device_registered" };
          replyMessage = `✅ Aparelho cadastrado!\n📱 ${interpretedAction.modelo} ${interpretedAction.capacidade} ${interpretedAction.cor}\n💰 Custo: R$ ${interpretedAction.preco_custo}${interpretedAction.preco_venda ? `\n💵 Venda: R$ ${interpretedAction.preco_venda}` : ""}`;
        }
      }
    } else if (interpretedAction.action === "register_sale") {
      const deviceId = interpretedAction.device_id;
      if (!deviceId) {
        // Try to find device from model name in transcription
        const matches = (stockDevices || []).filter((d: any) =>
          normalize(transcription).includes(normalize(d.modelo))
        );

        if (matches.length === 1) {
          interpretedAction.device_id = matches[0].id;
          interpretedAction.modelo = matches[0].modelo;
          interpretedAction.capacidade = matches[0].capacidade;
          interpretedAction.cor = matches[0].cor;
          interpretedAction.condicao = matches[0].condicao;
          interpretedAction.preco_custo = matches[0].preco_custo;
          interpretedAction.preco_venda = matches[0].preco_venda;
        } else {
          // Can't determine device — ask for all missing
          const missingForSale = ["cliente"];
          if (matches.length === 0) missingForSale.unshift("modelo");
          if (matches.length > 1) missingForSale.unshift("capacidade", "cor");
          const need = buildAllQuestionsMessage("register_sale", missingForSale, interpretedAction, combinedTranscription);
          interpretedAction = need.interpretedAction;
          actionResult = need.actionResult;
          replyMessage = need.replyMessage;
        }
      }

      // Re-check after potential device inference
      if (interpretedAction.action === "register_sale" && interpretedAction.device_id) {
        const { data: device } = await supabase
          .from("devices")
          .select("*")
          .eq("id", interpretedAction.device_id)
          .eq("user_id", profile.id)
          .eq("status", "disponivel")
          .single();

        if (!device) {
          actionResult = { success: false, action: "stock_mismatch" };
          replyMessage = `⚠️ Este aparelho não está mais disponível no estoque.`;
        } else {
          const cliente = (interpretedAction.cliente || "").trim();
          if (invalidClients.includes(normalize(cliente))) {
            const need = buildAllQuestionsMessage("register_sale", ["cliente"], {
              ...interpretedAction,
              device_id: device.id,
              modelo: device.modelo,
              capacidade: device.capacidade,
              cor: device.cor,
            }, combinedTranscription);
            interpretedAction = need.interpretedAction;
            actionResult = need.actionResult;
            replyMessage = `📱 Encontrei: *${device.modelo} ${device.capacidade} ${device.cor}*\n💰 Preço: *R$ ${device.preco_venda || 0}*\n\n${need.replyMessage}`;
          } else {
            const precoVenda = (device.preco_venda && device.preco_venda > 0)
              ? device.preco_venda
              : (interpretedAction.preco_venda || 0);

            // Detect if user mentioned a different price
            const userMentionedPrice = interpretedAction.preco_venda_mencionado || interpretedAction.preco_venda || null;
            let priceWarning = "";
            if (userMentionedPrice && device.preco_venda && device.preco_venda > 0 && userMentionedPrice !== device.preco_venda) {
              priceWarning = `\n⚠️ _Você mencionou R$ ${userMentionedPrice}, mas o preço do estoque é R$ ${device.preco_venda}. Usei o preço oficial._`;
            }

            const { error } = await supabase.from("sales").insert({
              user_id: profile.id,
              device_id: device.id,
              modelo: device.modelo,
              capacidade: device.capacidade,
              cor: device.cor,
              condicao: device.condicao,
              preco_custo: device.preco_custo,
              preco_venda: precoVenda,
              cliente,
              tipo: interpretedAction.tipo || "venda",
              status: "concluida",
            });

            if (!error) {
              await supabase.from("devices").update({ status: "vendido" }).eq("id", device.id);
              actionResult = { success: true, action: "sale_registered" };
              replyMessage = `✅ Venda registrada!\n📱 ${device.modelo} ${device.capacidade} ${device.cor}\n💰 R$ ${precoVenda}\n👤 ${cliente}${priceWarning}`;
            } else {
              actionResult = { success: false, error: error.message };
              replyMessage = `❌ Erro ao registrar venda: ${error.message}`;
            }
          }
        }
      }
    } else if (interpretedAction.action === "need_info") {
      const partialAction = interpretedAction.partial_action || pendingContext?.partial_action || "register_sale";
      const requiredFields = requiredFieldsByAction[partialAction] || ["modelo"];

      // Merge any data GPT already extracted
      const collectedData: Record<string, any> = {};
      const allFields = [...requiredFields, "device_id", "modelo", "capacidade", "cor", "condicao", "preco_custo", "preco_venda", "cliente"];
      for (const f of allFields) {
        if (isFieldPresent(interpretedAction[f])) collectedData[f] = interpretedAction[f];
      }
      // Merge with pending context data
      if (pendingContext?.collected_data) {
        for (const [k, v] of Object.entries(pendingContext.collected_data)) {
          if (!collectedData[k] && isFieldPresent(v)) collectedData[k] = v;
        }
      }

      let missingFields = Array.isArray(interpretedAction.missing_fields) && interpretedAction.missing_fields.length > 0
        ? interpretedAction.missing_fields
        : requiredFields;

      if (partialAction === "register_device") {
        const repaired = coerceRegisterDevicePayload(collectedData, pendingContext, combinedTranscription);
        Object.assign(collectedData, repaired);
        missingFields = requiredFieldsByAction.register_device.filter((field) => !isFieldPresent(collectedData[field]));
      }

      const need = buildAllQuestionsMessage(partialAction, missingFields, collectedData, combinedTranscription);
      interpretedAction = need.interpretedAction;
      actionResult = need.actionResult;
      replyMessage = need.replyMessage;
    } else if (interpretedAction.action === "stock_mismatch") {
      replyMessage = `⚠️ ${interpretedAction.message}`;
      actionResult = { success: false, action: "stock_mismatch" };
    } else if (interpretedAction.action === "query_stock") {
      let query = supabase
        .from("devices")
        .select("modelo, capacidade, cor, preco_venda, status")
        .eq("user_id", profile.id)
        .eq("status", "disponivel");

      if (interpretedAction.filtro) {
        query = query.ilike("modelo", `%${interpretedAction.filtro}%`);
      }

      const { data: devices } = await query;

      if (!devices || devices.length === 0) {
        replyMessage = "📦 Nenhum aparelho disponível no estoque.";
      } else {
        const list = devices.map((d: any) => `• ${d.modelo} ${d.capacidade} ${d.cor} - R$ ${d.preco_venda || "N/A"}`).join("\n");
        replyMessage = `📦 *Estoque disponível (${devices.length}):*\n\n${list}`;
      }
      actionResult = { success: true, action: "stock_queried", count: devices?.length || 0 };
    } else {
      replyMessage = `🤔 Não entendi o comando. Tente algo como:\n• "Cadastra um iPhone 15 Pro 256GB preto, paguei 4500"\n• "Vendi o iPhone 15 Pro pro João"\n• "Quantos iPhones tenho no estoque?"`;
      actionResult = { success: false, action: "unknown" };
    }

    // Update message log
    if (messageId) {
      await supabase.from("whatsapp_messages").update({
        user_id: profile.id,
        transcription,
        interpreted_action: interpretedAction,
        action_result: actionResult,
        status: actionResult.success ? "completed" : "error",
      }).eq("id", messageId);
    }

    // Send reply via Uazapi
    if (uazapiUrl && uazapiToken && replyMessage) {
      const baseUrl = uazapiUrl.replace(/\/$/, "");
      const res = await fetch(`${baseUrl}/send/text`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "token": uazapiToken },
        body: JSON.stringify({ number: phone, text: replyMessage }),
      });
      const resData = await res.json().catch(() => ({}));
      console.log("Reply sent:", JSON.stringify({ status: res.status, resData }));
    }

    return new Response(
      JSON.stringify({ success: true, transcription, interpretedAction, actionResult, replyMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Process-audio error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
