import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BadgeIndianRupee, ShoppingBag, Timer, Trash2, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { rupees, useApp } from "@/lib/app-store";
import { FEES } from "@/lib/local-data";
import { img } from "@/lib/images";
import { buildUpiUri, UPI_CONFIG } from "@/lib/payment-config";
import { QtyButton } from "@/components/app/qty-button";

export function CartBar() {
  const { totals, setCartOpen, cartOpen, t } = useApp();
  if (totals.count === 0 || cartOpen) return null;
  return (
    <div className="fixed inset-x-0 bottom-14 z-40 px-3 pb-2">
      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className="animate-cart-bar press mx-auto flex w-full max-w-3xl items-center justify-between rounded-2xl bg-primary px-4 py-3 text-primary-foreground shadow-[var(--shadow-float)]"
      >
        <span className="flex items-center gap-2 text-sm font-bold">
          <ShoppingBag className="h-5 w-5" />
          {totals.count} {t("items", "आइटम")} · {rupees(totals.grand)}
        </span>
        <span className="text-sm font-bold">{t("View cart", "कार्ट देखें")} →</span>
      </button>
    </div>
  );
}

export function CartSheet() {
  const {
    cartOpen,
    setCartOpen,
    items,
    totals,
    express,
    setExpress,
    clear,
    remove,
    t,
    area,
    profile,
    user,
  } = useApp();
  const [payment, setPayment] = useState<"cod" | "upi" | "wallet">("cod");
  const [upiIntent, setUpiIntent] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  if (!cartOpen) return null;

  const placeOrder = async () => {
    if (!user) {
      setCartOpen(false);
      toast.error(t("Please sign in to place an order", "ऑर्डर करने के लिए साइन इन करें"));
      void navigate({ to: "/auth" });
      return;
    }
    setPlacing(true);
    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          qty: i.qty,
          price: i.price,
          unit: i.unit,
          image_key: i.imageKey,
          kind: i.kind ?? "grocery",
          stall_name: i.stallName ?? null,
        })),
        item_total: totals.itemTotal,
        packaging_fee: totals.packaging,
        delivery_fee: totals.delivery + totals.expressFee,
        savings: totals.savings,
        total: totals.grand,
        payment_method: payment,
        area,
        address: profile?.address ?? null,
        status: "placed",
        rider_name: "Rider Sonu",
      })
      .select("id")
      .single();
    setPlacing(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (payment === "upi") {
      setUpiIntent(buildUpiUri(totals.grand, "Banda Bazaar order", data.id));
      toast.success(t("Order saved. Continue to your UPI app to pay.", "ऑर्डर सेव हो गया। भुगतान के लिए UPI ऐप खोलें।"));
      return;
    }
    clear();
    setCartOpen(false);
    void qc.invalidateQueries({ queryKey: ["orders"] });
    toast.success(t("Order placed! Track it live.", "ऑर्डर हो गया! लाइव ट्रैक करें।"));
    void navigate({ to: "/orders", search: { order: data.id } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40" onClick={() => setCartOpen(false)}>
      <div
        className="animate-slide-up flex max-h-[92vh] w-full max-w-3xl flex-col rounded-t-3xl bg-background"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-base font-bold">{t("Your cart", "आपका कार्ट")}</h2>
          <button type="button" aria-label="Close cart" onClick={() => setCartOpen(false)} className="press rounded-full p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            {t("Cart is empty. Add something tasty!", "कार्ट खाली है। कुछ जोड़िए!")}
          </div>
        ) : (
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            <div className="rounded-2xl bg-card p-2 shadow-card">
              {items.map((i) => (
                <div key={i.id} className="flex items-center gap-3 border-b border-border p-2 last:border-0">
                  <img src={img(i.imageKey)} alt="" loading="lazy" className="h-12 w-12 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{i.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {i.unit} · {rupees(i.price)}
                    </p>
                  </div>
                  <div className="w-24 shrink-0">
                    <QtyButton size="sm" item={i} />
                  </div>
                  <button type="button" aria-label="Remove" onClick={() => remove(i.id)} className="press p-1 text-muted-foreground">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {totals.streetTotal > 0 && (
              <p className="rounded-2xl bg-amber-soft p-3 text-xs font-semibold text-amber-foreground">
                🛵 {t(
                  "Street food: flat ₹10 delivery, no packaging fee, minimum 2 plates per item.",
                  "स्ट्रीट फूड: फ्लैट ₹10 डिलीवरी, पैकेजिंग फीस नहीं, हर आइटम की कम से कम 2 प्लेट।",
                )}
              </p>
            )}

            <button
              type="button"
              onClick={() => setExpress(!express)}
              className={`press flex w-full items-center justify-between rounded-2xl border p-3 text-left ${
                express ? "border-amber bg-amber-soft" : "border-border bg-card"
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Zap className="h-4 w-4 text-amber-foreground" />
                {t("Express delivery (15 min)", "एक्सप्रेस डिलीवरी (15 मिनट)")}
              </span>
              <span className="text-sm font-bold">+{rupees(FEES.expressFee)}</span>
            </button>

            <div className="rounded-2xl bg-card p-4 text-sm shadow-card">
              <p className="mb-2 font-bold">{t("Bill details", "बिल विवरण")}</p>
              <Row label={t("Item total", "आइटम कुल")} value={rupees(totals.itemTotal)} />
              <Row
                label={t("Packaging", "पैकेजिंग")}
                value={totals.packaging === 0 ? t("FREE", "फ्री") : rupees(totals.packaging)}
                highlight={totals.packaging === 0}
              />
              {totals.stallCharge > 0 && (
                <Row label={t("Specific stall pickup", "स्पेशल स्टॉल पिकअप")} value={rupees(totals.stallCharge)} />
              )}
              <Row
                label={t("Delivery", "डिलीवरी")}
                value={totals.delivery === 0 ? t("FREE", "फ्री") : rupees(totals.delivery)}
                highlight={totals.delivery === 0}
              />
              {totals.expressFee > 0 && (
                <Row label={t("Express delivery (15 min)", "एक्सप्रेस डिलीवरी (15 मिनट)")} value={rupees(totals.expressFee)} />
              )}

              <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-bold">
                <span>{t("To pay", "देना है")}</span>
                <span>{rupees(totals.grand)}</span>
              </div>
              {totals.savings + totals.deliverySaved > 0 && (
                <p className="mt-2 rounded-lg bg-primary-soft p-2 text-xs font-semibold text-accent-foreground">
                  🎉 {t("You saved", "आपने बचाए")} {rupees(totals.savings + totals.deliverySaved)}{" "}
                  {t("on this order", "इस ऑर्डर पर")}
                </p>
              )}
              <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <Timer className="h-3.5 w-3.5" />
                {express ? t("Arrives in ~15 min", "लगभग 15 मिनट में") : t("Arrives in 25-35 min", "25-35 मिनट में")}
              </p>
            </div>

            <div className="rounded-2xl bg-card p-4 shadow-card">
              <p className="mb-2 text-sm font-bold">{t("Payment method", "भुगतान")}</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: "cod", label: t("Cash", "कैश") },
                  { id: "upi", label: "UPI" },
                  { id: "wallet", label: t("Wallet", "वॉलेट") },
                ] as const).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={payment === p.id}
                    onClick={() => setPayment(p.id)}
                    className={`press rounded-xl border p-2 text-xs font-semibold transition-colors ${
                      payment === p.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {payment === "upi" && (
                <p className="animate-fade-in mt-2 text-xs text-muted-foreground">
                  {t(`Pay securely to ${UPI_CONFIG.merchantName} (${UPI_CONFIG.merchantId}) in your UPI app.`, `अपने UPI ऐप में ${UPI_CONFIG.merchantName} (${UPI_CONFIG.merchantId}) को सुरक्षित भुगतान करें।`)}
                </p>
              )}
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="border-t border-border bg-card p-3">
            {upiIntent ? (
              <a
                href={upiIntent}
                onClick={() => {
                  clear();
                  setCartOpen(false);
                }}
                className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground"
              >
                <BadgeIndianRupee className="h-5 w-5" />
                {t("Continue to UPI app", "UPI ऐप पर जाएं")}
              </a>
            ) : (
              <button
                type="button"
                disabled={placing}
                onClick={() => void placeOrder()}
                className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
              >
                <BadgeIndianRupee className="h-5 w-5" />
                {placing ? t("Placing…", "हो रहा है…") : `${t("Place order", "ऑर्डर करें")} · ${rupees(totals.grand)}`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between py-0.5 text-muted-foreground">
      <span>{label}</span>
      <span className={highlight ? "font-bold text-primary" : "text-foreground"}>{value}</span>
    </div>
  );
}
