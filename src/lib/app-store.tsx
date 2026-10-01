import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AREAS, FEES } from "@/lib/local-data";

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
  kind?: "grocery" | "street";
  /** Minimum plates/packs per order (street food = 2). */
  minQty?: number;
  /** Set when the user picked one specific stall (extra ₹10). */
  stallId?: string | null;
  stallName?: string | null;
};

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

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (en: string, hi: string) => string;
  area: string;
  setArea: (a: string) => void;
  items: CartItem[];
  qtyOf: (id: string) => number;
  add: (item: Omit<CartItem, "qty">) => void;
  dec: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  express: boolean;
  setExpress: (v: boolean) => void;
  totals: {
    count: number;
    itemTotal: number;
    savings: number;
    packaging: number;
    delivery: number;
    stallCharge: number;
    streetTotal: number;
    deliverySaved: number;
    expressFee: number;
    grand: number;
  };

  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  assistantOn: boolean;
  setAssistantOn: (v: boolean) => void;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  authReady: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AppCtx = createContext<Ctx | null>(null);
const CART_KEY = "banda.cart.v1";
const LANG_KEY = "banda.lang";
const AREA_KEY = "banda.area";
const AI_KEY = "banda.ai.on";

export function AppProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [lang, setLangState] = useState<Lang>("en");
  const [area, setAreaState] = useState<string>(AREAS[0]);
  const [express, setExpress] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [assistantOn, setAssistantOnState] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
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
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const loadRoleAndProfile = useCallback(async (uid: string) => {
    const [{ data: prof }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setProfile((prof as Profile) ?? null);
    setIsAdmin(Boolean(roles?.some((r) => r.role === "admin")));
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

  const add = useCallback((item: Omit<CartItem, "qty">) => {
    const min = Math.max(1, item.minQty ?? 1);
    setItems((prev) => {
      const found = prev.find((i) => i.id === item.id);
      if (found) return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...item, qty: min }];
    });
  }, []);

  const dec = useCallback((id: string) => {
    setItems((prev) =>
      prev.flatMap((i) => {
        if (i.id !== id) return [i];
        const min = Math.max(1, i.minQty ?? 1);
        return i.qty - 1 >= min ? [{ ...i, qty: i.qty - 1 }] : [];
      }),
    );
  }, []);

  const remove = useCallback((id: string) => setItems((prev) => prev.filter((i) => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const totals = useMemo(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const itemTotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const savings = items.reduce((s, i) => s + Math.max(0, (i.mrp ?? i.price) - i.price) * i.qty, 0);
    const streetTotal = items
      .filter((i) => i.kind === "street")
      .reduce((s, i) => s + i.price * i.qty, 0);
    const groceryTotal = itemTotal - streetTotal;

    let delivery = 0;
    let deliverySaved = 0;
    if (groceryTotal > 0) {
      if (groceryTotal >= FEES.freeDeliveryAbove) {
        delivery = 0;
        deliverySaved = FEES.standardFee;
      } else if (groceryTotal < FEES.smallOrderBelow) {
        delivery = FEES.smallOrderFee;
      } else {
        delivery = FEES.standardFee;
      }
    }
    if (streetTotal > 0) delivery += FEES.streetDelivery;
    // Express is always an add-on charge on top of the delivery fee.
    const expressFee = express && itemTotal > 0 ? FEES.expressFee : 0;


    // Street food has zero packaging fee; packaging applies to grocery only.
    const packaging = groceryTotal > 0 ? FEES.packaging : 0;
    const stallCharge = items.some((i) => i.stallId) ? FEES.stallPickupExtra : 0;

    return {
      count,
      itemTotal,
      savings,
      packaging,
      delivery,
      deliverySaved,
      stallCharge,
      streetTotal,
      expressFee,
      grand: itemTotal + packaging + delivery + stallCharge + expressFee,
    };

  }, [items, express]);

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
    items,
    qtyOf: (id) => items.find((i) => i.id === id)?.qty ?? 0,
    add,
    dec,
    remove,
    clear,
    express,
    setExpress,
    totals,
    cartOpen,
    setCartOpen,
    assistantOn,
    setAssistantOn,
    session,
    user: session?.user ?? null,
    profile,
    isAdmin,
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
