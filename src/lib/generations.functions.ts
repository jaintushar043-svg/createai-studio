import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const IMAGE_CREDIT_COST = 2;
const IMAGE_MODEL = "google/gemini-2.5-flash-image";

const generateInput = z.object({
  prompt: z.string().trim().min(3, "Prompt too short").max(2000),
  negativePrompt: z.string().trim().max(500).optional().nullable(),
  style: z.string().trim().max(50).optional().nullable(),
  aspectRatio: z.string().trim().max(10).optional().nullable(),
});

function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; contentType: string; ext: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image data URL from AI gateway");
  const contentType = match[1];
  const b64 = match[2];
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const ext = contentType.split("/")[1]?.split("+")[0] ?? "png";
  return { bytes, contentType, ext };
}

export const generateImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => generateInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI gateway is not configured");

    // 1) Deduct credits first (atomic, fails if insufficient)
    const { data: newBalance, error: deductErr } = await supabase.rpc("deduct_credits", {
      _amount: IMAGE_CREDIT_COST,
      _reason: "image_generation",
      _generation_id: null,
    });
    if (deductErr) {
      if (deductErr.message?.includes("insufficient_credits")) {
        throw new Error("Insufficient credits. Please top up to keep generating.");
      }
      throw new Error(deductErr.message || "Failed to deduct credits");
    }

    // 2) Insert pending generation row
    const styleSuffix = data.style ? `, ${data.style} style` : "";
    const negSuffix = data.negativePrompt ? `\n\nAvoid: ${data.negativePrompt}` : "";
    const fullPrompt = `${data.prompt}${styleSuffix}${negSuffix}`;

    const { data: genRow, error: insertErr } = await supabase
      .from("generations")
      .insert({
        user_id: userId,
        type: "image",
        prompt: data.prompt,
        negative_prompt: data.negativePrompt ?? null,
        style: data.style ?? null,
        aspect_ratio: data.aspectRatio ?? null,
        model: IMAGE_MODEL,
        status: "pending",
        credits_used: IMAGE_CREDIT_COST,
      })
      .select()
      .single();
    if (insertErr || !genRow) {
      throw new Error(insertErr?.message || "Failed to record generation");
    }

    try {
      // 3) Call Lovable AI gateway
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: IMAGE_MODEL,
          messages: [{ role: "user", content: fullPrompt }],
          modalities: ["image", "text"],
        }),
      });

      if (!response.ok) {
        const txt = await response.text();
        if (response.status === 429) throw new Error("Rate limit reached. Please try again shortly.");
        if (response.status === 402) throw new Error("AI workspace is out of credits. Please add funds.");
        console.error("AI gateway error", response.status, txt);
        throw new Error("Image generation failed");
      }

      const json: any = await response.json();
      const imageUrl: string | undefined =
        json?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (!imageUrl) throw new Error("No image returned by AI");

      const { bytes, contentType, ext } = dataUrlToBytes(imageUrl);

      // 4) Upload to storage
      const path = `${userId}/${genRow.id}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("generations")
        .upload(path, bytes, { contentType, upsert: true });
      if (upErr) throw new Error(upErr.message);

      const { data: pub } = supabase.storage.from("generations").getPublicUrl(path);

      // 5) Mark succeeded
      const { error: updErr } = await supabase
        .from("generations")
        .update({ status: "succeeded", output_url: pub.publicUrl })
        .eq("id", genRow.id);
      if (updErr) throw new Error(updErr.message);

      return {
        id: genRow.id,
        outputUrl: pub.publicUrl,
        creditsRemaining: newBalance as number,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await supabase.from("generations").update({ status: "failed", error: msg }).eq("id", genRow.id);
      throw err;
    }
  });

export const listMyGenerations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("generations")
      .select("id, type, prompt, style, aspect_ratio, output_url, status, credits_used, created_at")
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, display_name, avatar_url, credits, created_at")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });
