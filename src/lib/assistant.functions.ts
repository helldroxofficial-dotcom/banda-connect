import { createServerFn } from "@tanstack/react-start";

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
