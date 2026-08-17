import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Send, X } from "lucide-react";
import { useApp } from "@/lib/app-store";
import { askAssistant } from "@/lib/assistant.functions";

type Msg = { role: "user" | "assistant"; content: string };

export function AiAssistant() {
  const { t, lang, cartOpen } = useApp();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      content: "Namaste! Main Banda Mitra hoon. Grocery, mistri, doctor ya kamre ke baare me poochhiye.",
    },
  ]);
  const ask = useServerFn(askAssistant);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const next = [...msgs, { role: "user" as const, content: text }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const res = await ask({ data: { messages: next, lang } });
      setMsgs([...next, { role: "assistant", content: res.reply }]);
    } catch {
      setMsgs([...next, { role: "assistant", content: "Network issue. Dobara try kijiye." }]);
    }
    setBusy(false);
  };

  if (cartOpen) return null;

  return (
    <>
      {!open && (
        <button
          type="button"
          aria-label="Open assistant"
          onClick={() => setOpen(true)}
          className="press animate-pulse-ring fixed bottom-28 right-4 z-40 grid h-13 w-13 place-items-center rounded-full bg-amber p-3.5 text-amber-foreground shadow-[var(--shadow-float)]"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40" onClick={() => setOpen(false)}>
          <div
            className="animate-slide-up flex h-[80vh] w-full max-w-3xl flex-col rounded-t-3xl bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="flex items-center gap-2 text-base font-bold">
                <Bot className="h-5 w-5 text-primary" /> Banda Mitra AI
              </p>
              <button type="button" aria-label="Close assistant" onClick={() => setOpen(false)} className="press p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {msgs.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-card text-foreground shadow-card"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {busy && <p className="text-xs text-muted-foreground">{t("Typing…", "लिख रहा है…")}</p>}
            </div>
            <div className="flex items-center gap-2 border-t border-border p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void send();
                }}
                placeholder={t("Ask anything about Banda…", "बांदा के बारे में कुछ भी पूछें…")}
                className="h-11 flex-1 rounded-xl bg-card px-3 text-sm outline-none shadow-card"
              />
              <button
                type="button"
                aria-label="Send"
                onClick={() => void send()}
                className="press grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
