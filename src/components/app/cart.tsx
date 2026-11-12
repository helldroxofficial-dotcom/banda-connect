import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BadgeIndianRupee, Clock3, ShieldCheck, ShoppingBag, Tag, Timer, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { computeCouponDiscount, rupees, useApp, type Section } from "@/lib/app-store";
import { deliverySlots, FEES, looseItems } from "@/lib/local-data";
import { img } from "@/lib/images";
import { buildUpiUri, UPI_CONFIG } from "@/lib/payment-config";
import { QtyButton } from "@/components/app/qty-button";
import { LooseWeightControl } from "@/components/app/loose-weight-control";
import { Button } from "@/components/ui/button";

const SECTIONS: Section[] = ["market", "food", "services"];

function useCartSummary() {
  const { carts } = useApp();
  const count = SECTIONS.reduce((s, k) => s + carts[k].totals.count, 0);
  const grand = SECTIONS.reduce((s, k) => s + carts[k].totals.grand, 0);
  return { count, grand };
}

export function useCartCount() {
  return useCartSummary().count;
}

export function CartBar() {
  const { setCartOpen, cartOpen, t } = useApp();
  const { count, grand } = useCartSummary();
  if (count === 0 || cartOpen) return null;
  return (
    <div className="fixed inset-x-0 bottom-14 z-40 px-3 pb-2">
      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className="animate-cart-bar press mx-auto flex w-full max-w-3xl items-center justify-between rounded-2xl bg-primary px-4 py-3 text-primary-foreground shadow-[var(--shadow-float)]"
      >
        <span className="flex items-center gap-2 text-sm font-bold">
          <ShoppingBag className="h-5 w-5" aria-hidden="true" />
          {count} {t("items", "आइटम")} · {rupees(grand)}
        </span>
        <span className="text-sm font-bold">{t("View cart", "कार्ट देखें")} →</span>
      </button>
    </div>
  );
}

export function CartSheet() {
  const app = useApp();
  const { cartOpen, setCartOpen, t, carts } = app;
  const nonEmpty = SECTIONS.filter((s) => carts[s].items.length > 0);
  const [picked, setPicked] = useState<Section | null>(null);

  if (!cartOpen) return null;

  const active: Section = picked && nonEmpty.includes(picked) ? picked : (nonEmpty[0] ?? "market");
  const label = (s: Section) =>
    s === "market"
      ? t("Market", "मार्केट")
      : s === "food"
        ? t("Food", "खाना")
        : t("Services", "सेवाएं");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40"
      onClick={() => setCartOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("Your cart", "आपका कार्ट")}
        className="animate-slide-up flex max-h-[92vh] w-full max-w-3xl flex-col rounded-t-3xl bg-background"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-base font-bold">{t("Your cart", "आपका कार्ट")}</h2>
          <button
            type="button"
            aria-label="Close cart"
            onClick={() => setCartOpen(false)}
            className="press rounded-full p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {nonEmpty.length > 1 && (
          <div className="flex gap-2 border-b border-border px-4 py-2" role="tablist">
            {nonEmpty.map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={active === s}
                onClick={() => setPicked(s)}
                className={`press rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                  active === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {label(s)} · {carts[s].totals.count}
              </button>
            ))}
          </div>
        )}

        {nonEmpty.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            {t("Cart is empty. Add something tasty!", "कार्ट खाली है। कुछ जोड़िए!")}
          </div>
        ) : (
          <SectionCheckout key={active} section={active} />
        )}
      </div>
    </div>
  );
}

function SectionCheckout({ section }: { section: Section }) {
  const { carts, setCartOpen, t, area, profile, user, marketSlot, setMarketSlot } = useApp();
  const cart = carts[section];
  const { items, totals, remove, clear, coupon, setCoupon, toggleExpress } = cart;
  const [payment, setPayment] = useState<"cod" | "upi" | "wallet">("cod");
  const [upiIntent, setUpiIntent] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [code, setCode] = useState("");
  const [applying, setApplying] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const hasStreet = items.some((i) => i.kind === "street");

  const applyCoupon = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setApplying(true);
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", trimmed)
      .eq("active", true)
      .maybeSingle();
    setApplying(false);
    if (error || !data) {
      toast.error(t("Invalid or expired coupon", "कूपन मान्य नहीं है"));
      return;
    }
    if (data.applies_to !== "all" && data.applies_to !== section) {
      toast.error(t("This coupon is not valid for this cart", "यह कूपन इस कार्ट पर लागू नहीं है"));
      return;
    }
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      toast.error(t("This coupon has expired", "कूपन की अवधि समाप्त"));
      return;
    }
    const discount = computeCouponDiscount(data, totals.itemTotal);
    if (discount <= 0) {
      toast.error(
        t(
          `Add items worth ${rupees(Number(data.min_order))} to use this coupon`,
          `${rupees(Number(data.min_order))} का सामान जोड़ें`,
        ),
      );
      return;
    }
    setCoupon({
      ...data,
      code: data.code,
      description_en: data.description_en,
      description_hi: data.description_hi,
      merchant_name: data.merchant_name,
      discount,
    });
    setCode("");
    toast.success(
      t(`Coupon applied! You save ${rupees(discount)}`, `कूपन लगा! ${rupees(discount)} की बचत`),
    );
  };

  const placeOrder = async () => {
    if (!user) {
      setCartOpen(false);
      toast.error(t("Please sign in to place an order", "ऑर्डर करने के लिए साइन इन करें"));
      void navigate({ to: "/auth" });
      return;
    }
    if (payment === "wallet" && (profile?.wallet_balance ?? 0) < totals.grand) {
      toast.error(t("Not enough wallet balance", "वॉलेट में पर्याप्त बैलेंस नहीं है"));
      return;
    }
    setPlacing(true);
    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        section,
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          qty: i.qty,
          price: i.loose ? Math.round(i.loose.perKg * (i.loose.grams / 1000)) : i.price,
          unit: i.loose ? `${i.loose.grams}g` : i.unit,
          image_key: i.imageKey,
          kind: i.kind ?? "grocery",
          stall_name: i.stallName ?? null,
          restaurant_name: i.restaurantName ?? null,
          express_delivery: i.expressDelivery ?? false,
          runner: i.runner ?? null,
          loose: i.loose ?? null,
        })),
        item_total: totals.itemTotal,
        packaging_fee: totals.packaging,
        delivery_fee: totals.delivery + totals.expressFee + totals.stallCharge,
        platform_fee: totals.platformFee,
        discount: totals.discount,
        coupon_code: coupon?.code ?? null,
        delivery_slot: section === "market" ? marketSlot : null,
        runner_details:
          section === "services"
            ? {
                tasks: items.filter((item) => item.runner).map((item) => ({
                  steps: item.runner?.steps ?? [],
                  total_km: item.runner?.steps.reduce((sum, step) => sum + Math.max(0, step.km), 0) ?? 0,
                  fee: item.price,
                })),
              }
            : null,
        savings: totals.savings + totals.discount,
        total: totals.grand,
        payment_method: payment,
        area,
        address: profile?.address ?? null,
        status: "placed",
      })
      .select("id")
      .single();
    setPlacing(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    void qc.invalidateQueries({ queryKey: ["orders"] });
    if (payment === "upi") {
      setUpiIntent(buildUpiUri(totals.grand, "Banda Bazaar order", data.id));
      toast.success(
        t(
          "Order saved. Continue to your UPI app to pay.",
          "ऑर्डर सेव हो गया। भुगतान के लिए UPI ऐप खोलें।",
        ),
      );
      return;
    }
    clear();
    setCartOpen(false);
    toast.success(t("Order placed! Track it live.", "ऑर्डर हो गया! लाइव ट्रैक करें।"));
    void navigate({ to: "/orders", search: { order: data.id } });
  };

  return (
    <>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        <div className="rounded-2xl bg-card p-2 shadow-card">
          {items.map((i) => (
            <div
              key={i.id}
              className="flex items-center gap-3 border-b border-border p-2 last:border-0"
            >
              <img
                src={img(i.imageKey)}
                alt=""
                loading="lazy"
                className="h-12 w-12 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{i.name}</p>
                <p className="text-xs text-muted-foreground">
                  {i.loose
                    ? `${i.loose.grams}g · ${rupees(i.loose.perKg)}/kg`
                    : `${i.unit} · ${rupees(i.price)}`}
                </p>
              </div>
              {i.loose ? (
                (() => {
                  const looseItem = looseItems.find((item) => item.id === i.id);
                  return looseItem ? (
                    <div className="w-44 shrink-0">
                      <LooseWeightControl item={looseItem} initialGrams={i.loose.grams} mode="cart" />
                    </div>
                  ) : null;
                })()
              ) : !i.runner ? (
                <div className="w-24 shrink-0">
                  <QtyButton size="sm" section={section} item={i} />
                </div>
              ) : null}
              {section === "market" && (
                <Button
                  type="button"
                  size="sm"
                  variant={i.expressDelivery ? "default" : "outline"}
                  aria-pressed={Boolean(i.expressDelivery)}
                  onClick={() => toggleExpress(i.id)}
                  className="shrink-0 px-2 text-[10px]"
                >
                  <Clock3 className="h-3 w-3" />
                  {t("Express", "एक्सप्रेस")}
                </Button>
              )}
              <button
                type="button"
                aria-label={`Remove ${i.name}`}
                onClick={() => remove(i.id)}
                className="press p-1 text-muted-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {hasStreet && (
          <p className="rounded-2xl bg-amber-soft p-3 text-xs font-semibold text-amber-foreground">
            {t(
              `Street food: flat ${rupees(FEES.streetDelivery)} delivery, no packaging fee, minimum 2 plates per item.`,
              `स्ट्रीट फूड: फ्लैट ${rupees(FEES.streetDelivery)} डिलीवरी, पैकेजिंग फीस नहीं, हर आइटम की कम से कम 2 प्लेट।`,
            )}
          </p>
        )}

        {section === "market" && (
          <fieldset className="rounded-2xl bg-card p-3 shadow-card">
            <legend className="mb-2 text-sm font-bold">{t("Delivery slot", "डिलीवरी स्लॉट")}</legend>
            <div className="grid gap-2">
              {deliverySlots.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={marketSlot === s.id}
                  onClick={() => setMarketSlot(s.id)}
                  className={`press flex items-center justify-between rounded-xl border p-2.5 text-left transition-colors ${
                    marketSlot === s.id ? "border-primary bg-primary-soft" : "border-border"
                  }`}
                >
                  <span>
                    <span className="block text-sm font-semibold">{t(s.en, s.hi)}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {t(s.subEn, s.subHi)}
                    </span>
                  </span>
                  <span className="text-[10px] font-bold text-primary">{t("Combined", "एक साथ")}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <div className="rounded-2xl bg-card p-3 shadow-card">
          {coupon ? (
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Tag className="h-4 w-4" aria-hidden="true" />
                {coupon.code} · −{rupees(totals.discount)}
              </span>
              <button
                type="button"
                onClick={() => setCoupon(null)}
                className="press text-xs font-bold text-muted-foreground"
              >
                {t("Remove", "हटाएं")}
              </button>
            </div>
          ) : (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void applyCoupon();
              }}
            >
              <label htmlFor={`coupon-${section}`} className="sr-only">
                {t("Coupon code", "कूपन कोड")}
              </label>
              <input
                id={`coupon-${section}`}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={t("Coupon code", "कूपन कोड")}
                className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm uppercase outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={applying || !code.trim()}
                className="press rounded-xl bg-foreground px-4 text-xs font-bold text-background disabled:opacity-50"
              >
                {applying ? "…" : t("Apply", "लगाएं")}
              </button>
            </form>
          )}
        </div>

        <div className="rounded-2xl bg-card p-4 text-sm shadow-card">
          <p className="mb-2 font-bold">{t("Bill details", "बिल विवरण")}</p>
          <Row label={t("Item total", "आइटम कुल")} value={rupees(totals.itemTotal)} />
          {section === "market" && (
            <Row
              label={t("Eco & safety packaging", "इको पैकेजिंग")}
              value={totals.packaging === 0 ? t("FREE", "फ्री") : rupees(totals.packaging)}
              highlight={totals.packaging === 0}
            />
          )}
          {totals.platformFee > 0 && (
            <Row
              label={t("Platform fee", "प्लेटफ़ॉर्म शुल्क")}
              value={rupees(totals.platformFee)}
            />
          )}
          {totals.stallCharge > 0 && (
            <Row
              label={t("Specific stall pickup", "स्पेशल स्टॉल पिकअप")}
              value={rupees(totals.stallCharge)}
            />
          )}
          {section !== "services" && (
            <Row
              label={t("Delivery", "डिलीवरी")}
              value={totals.delivery === 0 ? t("FREE", "फ्री") : rupees(totals.delivery)}
              highlight={totals.delivery === 0}
            />
          )}
          {totals.expressFee > 0 && (
            <Row
              label={t("Express items", "एक्सप्रेस आइटम")}
              value={rupees(totals.expressFee)}
            />
          )}
          {totals.discount > 0 && (
            <Row
              label={t("Coupon discount", "कूपन छूट")}
              value={`−${rupees(totals.discount)}`}
              highlight
            />
          )}

          <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-bold">
            <span>{t("To pay", "देना है")}</span>
            <span>{rupees(totals.grand)}</span>
          </div>
          {section === "market" &&
            totals.itemTotal > 0 &&
            totals.itemTotal < FEES.freeDeliveryAbove && (
              <p className="mt-2 text-xs text-muted-foreground">
                {t(
                  `Add ${rupees(FEES.freeDeliveryAbove - totals.itemTotal)} more for FREE delivery`,
                  `फ्री डिलीवरी के लिए ${rupees(FEES.freeDeliveryAbove - totals.itemTotal)} और जोड़ें`,
                )}
              </p>
            )}
          {totals.savings + totals.deliverySaved + totals.discount > 0 && (
            <p className="mt-2 rounded-lg bg-primary-soft p-2 text-xs font-semibold text-accent-foreground">
              {t("You saved", "आपने बचाए")}{" "}
              {rupees(totals.savings + totals.deliverySaved + totals.discount)}{" "}
              {t("on this order", "इस ऑर्डर पर")}
            </p>
          )}
          {section === "market" && (
            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Timer className="h-3.5 w-3.5" aria-hidden="true" />
              {t(
                deliverySlots.find((s) => s.id === marketSlot)?.en ?? "Evening Batch (4-8 PM)",
                deliverySlots.find((s) => s.id === marketSlot)?.hi ?? "शाम की बैच (4-8 बजे)",
              )}
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-card p-4 shadow-card">
          <p className="mb-2 text-sm font-bold">{t("Payment method", "भुगतान")}</p>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: "cod", label: t("Cash", "कैश") },
                { id: "upi", label: "UPI" },
                {
                  id: "wallet",
                  label: `${t("Wallet", "वॉलेट")} ${rupees(profile?.wallet_balance ?? 0)}`,
                },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={payment === p.id}
                onClick={() => {
                  setPayment(p.id);
                  setUpiIntent(null);
                }}
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
              {t(
                `Pay securely to ${UPI_CONFIG.merchantName} (${UPI_CONFIG.merchantId}) in your UPI app.`,
                `अपने UPI ऐप में ${UPI_CONFIG.merchantName} (${UPI_CONFIG.merchantId}) को सुरक्षित भुगतान करें।`,
              )}
            </p>
          )}
          <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {t(
              "7-day return/replacement · Free cancellation before dispatch",
              "7-दिन रिटर्न/बदलाव · डिस्पैच से पहले फ्री कैंसिल",
            )}
          </p>
        </div>
      </div>

      <div className="border-t border-border bg-card p-3">
        {upiIntent ? (
          <a
            href={upiIntent}
            onClick={() => {
              clear();
              setCartOpen(false);
              setUpiIntent(null);
            }}
            className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground"
          >
            <BadgeIndianRupee className="h-5 w-5" aria-hidden="true" />
            {t("Continue to UPI app", "UPI ऐप पर जाएं")}
          </a>
        ) : (
          <button
            type="button"
            disabled={placing}
            onClick={() => void placeOrder()}
            className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            <BadgeIndianRupee className="h-5 w-5" aria-hidden="true" />
            {placing
              ? t("Placing…", "हो रहा है…")
              : `${t("Place order", "ऑर्डर करें")} · ${rupees(totals.grand)}`}
          </button>
        )}
      </div>
    </>
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
