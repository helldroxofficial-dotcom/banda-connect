import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Move, Send, X } from "lucide-react";
import { useApp } from "@/lib/app-store";
import { askAssistant } from "@/lib/assistant.functions";

type Msg = { role: "user" | "assistant"; content: string };
type Pos = { x: number; y: number };

const POS_KEY = "banda.ai.pos";
const SIZE = 56;

export function AiAssistant() {
  const { t, lang, cartOpen, assistantOn, setAssistantOn } = useApp();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const [dragging, setDragging] = useState(false);
  const movedRef = useRef(false);
  const offsetRef = useRef<Pos>({ x: 0, y: 0 });
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      content: "Namaste! Main Banda Mitra hoon. Grocery, mistri, doctor ya kamre ke baare me poochhiye.",
    },
  ]);
  const ask = useServerFn(askAssistant);

  useEffect(() => {
    const clampInit = () => {
      try {
        const raw = localStorage.getItem(POS_KEY);
        if (raw) {
          const p = JSON.parse(raw) as Pos;
          setPos(clamp(p));
          return;
        }
      } catch {
        /* ignore */
      }
      setPos({ x: window.innerWidth - SIZE - 16, y: window.innerHeight - 190 });
    };
    clampInit();
    const onResize = () => setPos((p) => (p ? clamp(p) : p));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const clamp = (p: Pos): Pos => ({
    x: Math.min(Math.max(8, p.x), Math.max(8, window.innerWidth - SIZE - 8)),
    y: Math.min(Math.max(70, p.y), Math.max(70, window.innerHeight - SIZE - 70)),
  });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pos) return;
    movedRef.current = false;
    setDragging(true);
    offsetRef.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    movedRef.current = true;
    setPos(clamp({ x: e.clientX - offsetRef.current.x, y: e.clientY - offsetRef.current.y }));
  };

  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (pos) {
      try {
        localStorage.setItem(POS_KEY, JSON.stringify(pos));
      } catch {
        /* ignore */
      }
    }
  };

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
      {assistantOn && !open && pos && (
        <div
          style={{ left: pos.x, top: pos.y }}
          className={`fixed z-40 touch-none ${dragging ? "" : "transition-[left,top] duration-150"}`}
        >
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            role="button"
            tabIndex={0}
            aria-label="Open Banda Mitra assistant. Drag to move."
            onClick={() => {
              if (!movedRef.current) setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") setOpen(true);
            }}
            className="press animate-pulse-ring grid h-14 w-14 cursor-grab place-items-center rounded-full bg-gradient-to-br from-amber to-amber-soft text-amber-foreground shadow-[var(--shadow-float)] active:cursor-grabbing"
          >
            <Bot className="pointer-events-none h-6 w-6" />
            <Move className="pointer-events-none absolute -bottom-0.5 -left-0.5 h-4 w-4 rounded-full bg-card p-0.5 text-muted-foreground" />
          </div>
          <button
            type="button"
            aria-label={t("Hide assistant", "असिस्टेंट छिपाएं")}
            onClick={() => setAssistantOn(false)}
            className="press absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-foreground text-background"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {!assistantOn && (
        <button
          type="button"
          onClick={() => setAssistantOn(true)}
          className="press animate-fade-in fixed bottom-16 right-3 z-40 rounded-full bg-card px-3 py-1.5 text-[11px] font-bold text-muted-foreground shadow-card"
        >
          {t("Show AI", "AI दिखाएं")}
        </button>
      )}

      {open && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="animate-slide-up flex h-[80vh] w-full max-w-3xl flex-col rounded-t-3xl bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="flex items-center gap-2 text-base font-bold">
                <Bot className="h-5 w-5 text-primary" /> Banda Mitra AI
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setAssistantOn(false);
                    setOpen(false);
                  }}
                  className="press rounded-lg px-2 py-1 text-[11px] font-bold text-muted-foreground"
                >
                  {t("Hide button", "बटन हटाएं")}
                </button>
                <button type="button" aria-label="Close assistant" onClick={() => setOpen(false)} className="press p-1">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {msgs.map((m, i) => (
                <div
                  key={i}
                  className={`animate-tab-in max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
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
