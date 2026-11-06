import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createOpenAI } from "@ai-sdk/openai";
import { streamObject, streamText, jsonSchema } from "ai";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { LOVABLE_GATEWAY_URL, createLovableAiGatewayRunIdFetch, getIncomingRunId } from "@/lib/ai-gateway.server";
import {
  restaurants,
  stalls,
  stallMenus,
  streetItems,
  looseItems,
} from "@/lib/local-data";

type Msg = { role: "user" | "assistant"; content: string };

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: { messages: Msg[]; lang: "en" | "hi" }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return { reply: "Assistant is not configured yet. Please try again later." };
    }

    const system = `You are "Banda Mitra", the helpful assistant of Banda Bazaar — a hyper-local super app for Banda, Uttar Pradesh.
You help with: grocery ordering, street food (Local Bites), local shops, trusted workers (plumber, electrician, bike mechanic, carpenter), doctors and lab tests, room rentals, tutors, skill services and Mini-ATM cash-at-home.
Key policies: free delivery above Rs149, packaging Rs5, small order (<Rs100) Rs15, express 15-min Rs25, Mini-ATM Rs500-Rs5000 with Rs20 fee, 7-day warranty on groceries/electronics/repairs, no overcharging above MRP.
Reply in ${data.lang === "hi" ? "simple Hindi (Devanagari)" : "simple English"}, keep it under 90 words, warm and practical.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [{ role: "system", content: system }, ...data.messages.slice(-10)],
      }),
    });

    if (!res.ok) {
      if (res.status === 429) return { reply: "Bahut requests aa gayi hain. Thodi der baad try kijiye." };
      if (res.status === 402) return { reply: "AI credits khatm ho gaye hain. Please workspace me credits add karein." };
      return { reply: "Assistant abhi jawab nahi de paaya. Dobara try kijiye." };
    }

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return { reply: json.choices?.[0]?.message?.content ?? "…" };
  });

// ============ Voice/text command → cart items ============

type CatalogEntry = {
  ref: string;
  label: string;
  price: number;
  hint?: string;
};

type ResolvedCartItem = {
  ref: string;
  section: "food" | "market";
  id: string;
  name: string;
  hindi: string | null;
  price: number;
  mrp: number | null;
  unit: string;
  imageKey: string;
  kind: "grocery" | "street" | "restaurant";
  minQty: number;
  stallId: string | null;
  stallName: string | null;
  restaurantId: string | null;
  restaurantName: string | null;
  loose: { perKg: number; grams: number } | null;
  qty: number;
  grams: number | null;
};

const PARSER_MODEL = "openai/gpt-6-astra";

const FALLBACK_PRODUCTS = [
  { id: "fallback-atta", name: "Fortune Chakki Fresh Atta", hindi: "चक्की आटा", price: 245, mrp: 270, unit: "5 kg", image_key: "grocery-atta" },
  { id: "fallback-rice", name: "Premium Basmati Rice", hindi: "बासमती चावल", price: 520, mrp: 610, unit: "5 kg", image_key: "grocery-rice" },
  { id: "fallback-dal", name: "Arhar / Toor Dal", hindi: "अरहर दाल", price: 148, mrp: 175, unit: "1 kg", image_key: "grocery-pulses" },
  { id: "fallback-oil", name: "Mustard Oil", hindi: "सरसों तेल", price: 162, mrp: 185, unit: "1 L", image_key: "grocery-mustard-oil" },
  { id: "fallback-spices", name: "Everest Garam Masala", hindi: "गरम मसाला", price: 78, mrp: 90, unit: "100 g", image_key: "grocery-spices" },
  { id: "fallback-tea", name: "Red Label Tea", hindi: "चाय पत्ती", price: 142, mrp: 160, unit: "250 g", image_key: "grocery-tea" },
  { id: "fallback-milk", name: "Amul Taaza Toned Milk", hindi: "अमूल दूध", price: 33, mrp: 35, unit: "500 ml", image_key: "grocery-milk" },
  { id: "fallback-eggs", name: "Farm Fresh Eggs", hindi: "अंडे", price: 84, mrp: 95, unit: "Tray of 12", image_key: "grocery-eggs" },
  { id: "fallback-biscuits", name: "Parle-G Biscuits", hindi: "बिस्किट", price: 40, mrp: 48, unit: "Pack of 4", image_key: "grocery-biscuits" },
  { id: "fallback-namkeen", name: "Masala Namkeen Mix", hindi: "नमकीन", price: 48, mrp: 55, unit: "400 g", image_key: "grocery-namkeen" },
];

const resolve = new Map<string, Omit<ResolvedCartItem, "ref" | "qty" | "grams">>();

function registerCatalog() {
  if (resolve.size > 0) return resolve;
  for (const it of streetItems) {
    resolve.set(`sf-${it.id}`, {
      section: "food", id: it.id, name: it.name, hindi: it.hindi, price: it.price, mrp: null,
      unit: it.unit, imageKey: it.imageKey, kind: "street", minQty: it.minQty,
      stallId: null, stallName: null, restaurantId: null, restaurantName: null, loose: null,
    });
  }
  for (const s of stalls) {
    for (const m of stallMenus[s.id] ?? []) {
      const it = streetItems.find((x) => x.id === m.itemId);
      if (!it) continue;
      resolve.set(`stall-${s.id}-${m.itemId}`, {
        section: "food", id: `${s.id}:${it.id}`, name: `${it.name} — ${s.vendor}`, hindi: it.hindi,
        price: m.price ?? it.price, mrp: null, unit: it.unit, imageKey: it.imageKey, kind: "street",
        minQty: it.minQty, stallId: s.id, stallName: s.vendor, restaurantId: null, restaurantName: null, loose: null,
      });
    }
  }
  for (const r of restaurants) {
    for (const d of r.menu) {
      resolve.set(`dish-${r.id}-${d.id}`, {
        section: "food", id: `${r.id}:${d.id}`, name: `${d.name} — ${r.name}`, hindi: d.hindi,
        price: d.price, mrp: null, unit: "1 serving", imageKey: d.imageKey, kind: "restaurant",
        minQty: 1, stallId: null, stallName: null, restaurantId: r.id, restaurantName: r.name, loose: null,
      });
    }
  }
  for (const l of looseItems) {
    resolve.set(l.id, {
      section: "market", id: l.id, name: l.name, hindi: l.hindi, price: l.perKg, mrp: l.mrpPerKg ?? null,
      unit: `per kg · ${l.minGrams}g+`, imageKey: l.imageKey, kind: "grocery", minQty: 1,
      stallId: null, stallName: null, restaurantId: null, restaurantName: null,
      loose: { perKg: l.perKg, grams: l.minGrams },
    });
  }
  for (const p of FALLBACK_PRODUCTS) {
    resolve.set(`prod-${p.id}`, {
      section: "market", id: p.id, name: p.name, hindi: p.hindi, price: p.price, mrp: p.mrp ?? null,
      unit: p.unit, imageKey: p.image_key, kind: "grocery", minQty: 1,
      stallId: null, stallName: null, restaurantId: null, restaurantName: null, loose: null,
    });
  }
  return resolve;
}

async function loadProducts(): Promise<typeof FALLBACK_PRODUCTS> {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return FALLBACK_PRODUCTS;
  try {
    const supa = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
    const { data } = await supa
      .from("products")
      .select("id, name, hindi, price, mrp, unit, image_key")
      .eq("active", true)
      .limit(80);
    if (data?.length) return data as unknown as typeof FALLBACK_PRODUCTS;
  } catch {
    /* fall back to static list */
  }
  return FALLBACK_PRODUCTS;
}

export const parseCartCommand = createServerFn({ method: "POST" })
  .inputValidator((input: { text: string; lang: "en" | "hi" }) => input)
  .handler(async ({ data }): Promise<{ reply: string; items: ResolvedCartItem[] }> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    const empty = { reply: "", items: [] as ResolvedCartItem[] };
    if (!apiKey) return { ...empty, reply: "AI assistant is not configured yet." };

    const catalog = registerCatalog();
    const products = await loadProducts();
    for (const p of products) {
      catalog.set(`prod-${p.id}`, {
        section: "market", id: p.id, name: p.name, hindi: p.hindi ?? null, price: Number(p.price), mrp: p.mrp != null ? Number(p.mrp) : null,
        unit: p.unit, imageKey: p.image_key, kind: "grocery", minQty: 1,
        stallId: null, stallName: null, restaurantId: null, restaurantName: null, loose: null,
      });
    }

    const catalogLines = [...catalog.entries()]
      .map(([ref, e]) => `${ref} | ${e.name}${e.hindi ? ` / ${e.hindi}` : ""} | ₹${e.price} | ${e.section}${e.loose ? " | loose per-kg" : ""}`)
      .join("\n");

    const instructions = `You parse spoken/written shopping commands for Banda Bazaar (Banda, UP). The user speaks Hinglish/Hindi/Bundeli or English.
Match each ordered item to exactly one catalog ref. Rules:
- Street food (sf-/stall- refs) is sold in plates/packs; if the user does not give a count, use 2 (minimum 2 plates rule). Never below 2.
- If the user names a place/stall (e.g. "Kalu Kuan se", "Station Road wale"), prefer the matching stall- ref, otherwise the plain sf- ref.
- Restaurant dishes (dish- refs) when they mention biryani, thali, paneer, noodles, restaurant/hotel.
- Loose per-kg items (loose- refs) for khula/khuli items (sarson tel, ghee, dal, chawal, cheeni, atta). Convert volume/weight to grams: 1L oil ≈ 930 g, 1 kg = 1000 g, 500 g = 500 g, 250 g = 250 g. Put grams in "grams", qty stays 1.
- Packaged products (prod- refs) for branded grocery. qty = count asked (default 1).
- Ignore questions, greetings and everything that is not an order.
- reply: one warm short sentence (max 25 words) in ${data.lang === "hi" ? "simple Hindi (Devanagari)" : "simple English"} confirming what was added; use ₹ for prices.
Return only through the JSON schema.`;

    const schema = jsonSchema<{ reply: string; items: { ref: string; qty: number; grams: number | null }[] }>({
      type: "object",
      additionalProperties: false,
      required: ["reply", "items"],
      properties: {
        reply: { type: "string" },
        items: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["ref", "qty", "grams"],
            properties: {
              ref: { type: "string", enum: [...catalog.keys()] },
              qty: { type: "integer", minimum: 1 },
              grams: { type: ["number", "null"] },
            },
          },
        },
      },
    });

    const runIdFetch = createLovableAiGatewayRunIdFetch(getIncomingRunId(getRequest()));
    const provider = createOpenAI({
      baseURL: LOVABLE_GATEWAY_URL,
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: runIdFetch.fetch,
    });

    try {
      const result = streamObject({
        model: provider.responses(PARSER_MODEL),
        schema,
        temperature: 0.2,
        providerOptions: {
          openai: {
            store: false,
            forceReasoning: true,
            reasoningEffort: "low",
            reasoningSummary: "auto",
            include: ["reasoning.encrypted_content"],
          },
        },
        messages: [
          { role: "system", content: `${instructions}\n\nCATALOG:\n${catalogLines}` },
          { role: "user", content: data.text },
        ],
      });
      const parsed = await result.object;
      const items: ResolvedCartItem[] = [];
      for (const it of parsed.items ?? []) {
        const entry = catalog.get(it.ref);
        if (!entry) continue;
        const grams = it.grams != null && it.grams > 0 ? Math.round(it.grams) : null;
        const minQty = entry.minQty;
        const qty = Math.max(minQty, Math.min(20, Math.round(it.qty) || 1));
        items.push({ ...entry, ref: it.ref, qty, grams: entry.loose ? grams ?? entry.loose.grams : null });
      }
      return { reply: parsed.reply ?? "", items };
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 429) return { ...empty, reply: "Bahut requests aa gayi hain. Thodi der baad try kijiye." };
      if (status === 402) return { ...empty, reply: "AI credits khatm ho gaye hain. Workspace me credits add karein." };
      console.error("parseCartCommand failed", err);
      return { ...empty, reply: "Samajh nahi aaya. Thoda clear boliye ya dobara try kijiye." };
    }
  });
