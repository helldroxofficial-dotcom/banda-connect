import { Minus, Plus } from "lucide-react";
import { useApp, type CartItem } from "@/lib/app-store";

export function QtyButton({ item, size = "md" }: { item: Omit<CartItem, "qty">; size?: "sm" | "md" }) {
  const { qtyOf, add, dec, t } = useApp();
  const qty = qtyOf(item.id);
  const min = Math.max(1, item.minQty ?? 1);
  const pad = size === "sm" ? "h-8 text-xs" : "h-9 text-sm";

  if (qty === 0) {
    return (
      <button
        type="button"
        onClick={() => add(item)}
        className={`press ${pad} w-full rounded-lg border border-primary bg-primary-soft px-2 font-bold uppercase tracking-wide text-primary transition-colors hover:bg-primary hover:text-primary-foreground`}
      >
        {min > 1 ? `${t("Add", "जोड़ें")} ${min}` : t("Add", "जोड़ें")}
      </button>
    );
  }

  return (
    <div className={`${pad} flex w-full items-center justify-between rounded-lg bg-primary px-1 text-primary-foreground shadow-[var(--shadow-float)]`}>
      <button type="button" aria-label="decrease" onClick={() => dec(item.id)} className="press grid h-full w-8 place-items-center">
        <Minus className="h-4 w-4" />
      </button>
      <span key={qty} className="animate-badge-pop font-bold">{qty}</span>
      <button type="button" aria-label="increase" onClick={() => add(item)} className="press grid h-full w-8 place-items-center">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
