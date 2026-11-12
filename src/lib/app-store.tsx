import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AREAS, FEES, FOOD_FEES, RUNNER_FEES, runnerQuote } from "@/lib/local-data";
import type { RunnerStep } from "@/lib/local-data";
import { marketDeliveryFees, measuredPrice, measuredSavings } from "@/lib/checkout-pricing";

export type Section = "food" | "market" | "services";

export type CartItem = {
  id: string;
  name: string;
  hindi?: string | null;
  price: number;
  mrp?: number | null;
  unit: string;
  imageKey: string;
  qty: number;
  /** "street" items follow Local Bites rules: min 2 plates, no packaging, flat ₹10 delivery. */
  kind?: "grocery" | "street" | "restaurant";
  /** Minimum plates/packs per order (street food = 2). */
  minQty?: number;
  /** Set when the user picked one specific stall (extra ₹10). */
  stallId?: string | null;
  stallName?: string | null;
  /** Premium Food Club restaurant item (₹9 platform fee + restaurant delivery). */
  restaurantId?: string | null;
  restaurantName?: string | null;
  /** Loose, open-measured grocery: price per kg with a custom weight. */
  loose?: { perKg: number; grams: number } | null;
  /** Banda Runner task: ordered multi-point steps. */
  runner?: { steps: RunnerStep[] } | null;
  /** Explicitly requested immediate fulfillment for a Market item. */
  expressDelivery?: boolean;
};

export type AppliedCoupon = {
  code: string;
  description_en: string;
  description_hi: string;
  merchant_name: string | null;
  discount: number;
};

export function computeCouponDiscount(
  coupon: { discount_type: string; discount_value: number | string; min_order: number | string; max_discount: number | string | null },
  itemTotal: number,
): number {
  const min = Number(coupon.min_order) || 0;
  if (itemTotal < min) return 0;
  const pct = Number(coupon.discount_value) || 0;
  const raw =
    coupon.discount_type === "percent"
      ? Math.round((itemTotal * pct) / 100)
      : pct;
  const cap = coupon.max_discount != null ? Number(coupon.max_discount) : Infinity;
  return Math.min(raw, cap, itemTotal);
}

export type Lang = "en" | "hi";

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  phone_verified: boolean;
  area: string | null;
  address: string | null;
  address_verified: boolean;
  lat: number | null;
  lng: number | null;
  wallet_balance: number;
  language: string;
};

export type SectionTotals = {
  count: number;
  itemTotal: number;
  savings: number;
  packaging: number;
  delivery: number;
  deliverySaved: number;
  stallCharge: number;
  expressFee: number;
  platformFee: number;
  discount: number;
  grand: number;
};

type SectionCart = {
  items: CartItem[];
  qtyOf: (id: string) => number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  addLoose: (item: Omit<CartItem, "qty"> & { loose: { perKg: number; grams: number } }) => void;
  dec: (id: string) => void;
  remove: (id: string) => void;
  toggleExpress: (id: string) => void;
  clear: () => void;
  totals: SectionTotals;
  coupon: AppliedCoupon | null;
  setCoupon: (c: AppliedCoupon | null) => void;
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (en: string, hi: string) => string;
  area: string;
  setArea: (a: string) => void;

  carts: Record<Section, SectionCart>;
  food: SectionCart;
  market: SectionCart;
  services: SectionCart;

  marketSlot: "instant" | "evening" | "tomorrow";
  setMarketSlot: (s: "instant" | "evening" | "tomorrow") => void;

  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  assistantOn: boolean;
  setAssistantOn: (v: boolean) => void;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isRider: boolean;
  authReady: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AppCtx = createContext<Ctx | null>(null);
const CART_KEY = "banda.carts.v2";
const LANG_KEY = "banda.lang";
const AREA_KEY = "banda.area";
const AI_KEY = "banda.ai.on";

const emptyTotals: SectionTotals = {
  count: 0, itemTotal: 0, savings: 0, packaging: 0, delivery: 0, deliverySaved: 0,
  stallCharge: 0, expressFee: 0, platformFee: 0, discount: 0, grand: 0,
};

function linePrice(item: CartItem): number {
  if (item.loose) return measuredPrice(item.loose.perKg, item.loose.grams);
  return item.price;
}
function lineTotal(item: CartItem): number {
  return linePrice(item) * item.qty;
}

function calculateTotals(
  section: Section,
  items: CartItem[],
  applied: AppliedCoupon | null,
  marketSlot: "instant" | "evening" | "tomorrow",
): SectionTotals {
  const count = items.reduce((s, i) => s + i.qty, 0);
  const itemTotal = items.reduce((s, i) => s + lineTotal(i), 0);
  const savings = items.reduce((s, i) => {
    const saved = i.loose
      ? measuredSavings(i.mrp ?? i.price, i.loose.perKg, i.loose.grams)
      : Math.max(0, (i.mrp ?? i.price) - linePrice(i));
    return s + saved * i.qty;
  }, 0);

  if (section === "food") {
    const streetTotal = items.filter((i) => i.kind === "street").reduce((s, i) => s + lineTotal(i), 0);
    const restaurantTotal = items.filter((i) => i.kind === "restaurant").reduce((s, i) => s + lineTotal(i), 0);
    const platformFee = restaurantTotal > 0 ? FOOD_FEES.platformFee : 0;
    const delivery = (streetTotal > 0 ? FEES.streetDelivery : 0) + (restaurantTotal > 0 ? FOOD_FEES.restaurantDelivery : 0);
    const stallCharge = items.some((i) => i.stallId) ? FEES.stallPickupExtra : 0;
    const discount = applied ? computeCouponDiscount(applied as never, itemTotal) : 0;
    return {
      ...emptyTotals, count, itemTotal, savings, delivery, stallCharge, platformFee, discount,
      grand: Math.max(0, itemTotal + platformFee + delivery + stallCharge - discount),
    };
  }

  if (section === "market") {
    const hasPackaged = items.some((i) => !i.loose);
    const packaging = hasPackaged ? FEES.packaging : 0;
    const { delivery, expressFee } = marketDeliveryFees(
      itemTotal,
      itemTotal,
      items.some((item) => item.expressDelivery),
    );
    const discount = applied ? computeCouponDiscount(applied as never, itemTotal) : 0;
    return {
      ...emptyTotals, count, itemTotal, savings, packaging, delivery, expressFee, discount,
      deliverySaved: delivery === 0 && itemTotal > FEES.freeDeliveryAbove ? FEES.standardFee : 0,
      grand: Math.max(0, itemTotal + packaging + delivery + expressFee - discount),
    };
  }

  const discount = applied ? computeCouponDiscount(applied as never, itemTotal) : 0;
  return { ...emptyTotals, count, itemTotal, savings, discount, grand: Math.max(0, itemTotal - discount) };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [cartsState, setCartsState] = useState<Record<Section, CartItem[]>>({ food: [], market: [], services: [] });
  const [coupons, setCoupons] = useState<Record<Section, AppliedCoupon | null>>({ food: null, market: null, services: null });
  const [lang, setLangState] = useState<Lang>("en");
  const [area, setAreaState] = useState<string>(AREAS[0]);
  const [marketSlot, setMarketSlotState] = useState<"instant" | "evening" | "tomorrow">("evening");
  const [cartOpen, setCartOpen] = useState(false);
  const [assistantOn, setAssistantOnState] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRider, setIsRider] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Record<Section, CartItem[]>>;
        setCartsState({ food: parsed.food ?? [], market: parsed.market ?? [], services: parsed.services ?? [] });
      }
      const l = localStorage.getItem(LANG_KEY);
      if (l === "hi" || l === "en") setLangState(l);
      const a = localStorage.getItem(AREA_KEY);
      if (a) setAreaState(a);
      const ai = localStorage.getItem(AI_KEY);
      if (ai === "0") setAssistantOnState(false);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cartsState));
    } catch {
      /* ignore */
    }
  }, [cartsState]);

  const loadRoleAndProfile = useCallback(async (uid: string) => {
    const [{ data: prof }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setProfile((prof as Profile) ?? null);
    setIsAdmin(Boolean(roles?.some((r) => r.role === "admin")));
    setIsRider(Boolean(roles?.some((r) => r.role === "rider")));
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setAuthReady(true);
      if (s?.user) {
        setTimeout(() => void loadRoleAndProfile(s.user.id), 0);
      } else {
        setProfile(null);
        setIsAdmin(false);
        setIsRider(false);
      }
    });
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
      if (data.session?.user) void loadRoleAndProfile(data.session.user.id);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadRoleAndProfile]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const setArea = useCallback((a: string) => {
    setAreaState(a);
    try {
      localStorage.setItem(AREA_KEY, a);
    } catch {
      /* ignore */
    }
  }, []);

  const setAssistantOn = useCallback((v: boolean) => {
    setAssistantOnState(v);
    try {
      localStorage.setItem(AI_KEY, v ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const add = useCallback((section: Section, item: Omit<CartItem, "qty">, qty = 1) => {
    const min = Math.max(1, item.minQty ?? 1);
    setCartsState((prev) => {
      const list = prev[section];
      const found = list.find((i) => i.id === item.id);
      let next: CartItem[];
      if (found) {
        next = list.map((i) => (i.id === item.id ? { ...i, qty: i.qty + Math.max(1, qty) } : i));
      } else {
        next = [...list, { ...item, qty: Math.max(min, qty) }];
      }
      return { ...prev, [section]: next };
    });
  }, []);

  const addLoose = useCallback((section: Section, item: Omit<CartItem, "qty"> & { loose: { perKg: number; grams: number } }) => {
    setCartsState((prev) => {
      const list = prev[section];
      const found = list.find((i) => i.id === item.id);
      let next: CartItem[];
      if (found) {
        next = list.map((i) => (i.id === item.id ? { ...i, loose: item.loose } : i));
      } else {
        next = [...list, { ...item, qty: 1 }];
      }
      return { ...prev, [section]: next };
    });
  }, []);

  const dec = useCallback((section: Section, id: string) => {
    setCartsState((prev) => {
      const list = prev[section];
      const next = list.flatMap((i) => {
        if (i.id !== id) return [i];
        const min = Math.max(1, i.minQty ?? 1);
        return i.qty - 1 >= min ? [{ ...i, qty: i.qty - 1 }] : [];
      });
      return { ...prev, [section]: next };
    });
  }, []);

  const remove = useCallback((section: Section, id: string) => {
    setCartsState((prev) => ({ ...prev, [section]: prev[section].filter((i) => i.id !== id) }));
  }, []);

  const toggleExpress = useCallback((section: Section, id: string) => {
    setCartsState((prev) => ({
      ...prev,
      [section]: prev[section].map((item) =>
        item.id === id ? { ...item, expressDelivery: !item.expressDelivery } : item,
      ),
    }));
  }, []);

  const clear = useCallback((section: Section) => {
    setCartsState((prev) => ({ ...prev, [section]: [] }));
    setCoupons((prev) => ({ ...prev, [section]: null }));
  }, []);

  const setCoupon = useCallback((section: Section, c: AppliedCoupon | null) => {
    setCoupons((prev) => ({ ...prev, [section]: c }));
  }, []);

  const setMarketSlot = useCallback((s: "instant" | "evening" | "tomorrow") => setMarketSlotState(s), []);

  const makeCart = useCallback(
    (section: Section): SectionCart => {
      const items = cartsState[section];
      const applied = coupons[section];
      const totals = calculateTotals(section, items, applied, marketSlot);

      return {
        items,
        qtyOf: (id: string) => items.find((i) => i.id === id)?.qty ?? 0,
        add: (item, qty = 1) => add(section, item, qty),
        addLoose: (item) => addLoose(section, item),
        dec: (id) => dec(section, id),
        remove: (id) => remove(section, id),
        toggleExpress: (id) => toggleExpress(section, id),
        clear: () => clear(section),
        totals,
        coupon: applied,
        setCoupon: (c) => setCoupon(section, c),
      };
    },
    [cartsState, coupons, add, addLoose, dec, remove, toggleExpress, clear, setCoupon, marketSlot],
  );

  const food = useMemo(() => makeCart("food"), [makeCart]);
  const market = useMemo(() => makeCart("market"), [makeCart]);
  const services = useMemo(() => makeCart("services"), [makeCart]);

  const t = useCallback((en: string, hi: string) => (lang === "hi" ? hi : en), [lang]);

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadRoleAndProfile(session.user.id);
  }, [session, loadRoleAndProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setIsAdmin(false);
  }, []);

  const value: Ctx = {
    lang,
    setLang,
    t,
    area,
    setArea,
    carts: { food, market, services },
    food,
    market,
    services,
    marketSlot,
    setMarketSlot,
    cartOpen,
    setCartOpen,
    assistantOn,
    setAssistantOn,
    session,
    user: session?.user ?? null,
    profile,
    isAdmin,
    isRider,
    authReady,
    refreshProfile,
    signOut,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

export const rupees = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export { RUNNER_FEES };
