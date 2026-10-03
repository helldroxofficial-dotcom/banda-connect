import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products">;
export type Category = Tables<"categories">;
export type Order = Tables<"orders">;
export type ServiceListing = Tables<"service_listings">;
export type DemandPost = Tables<"demand_posts">;
export type AtmRequest = Tables<"mini_atm_requests">;

const FALLBACK_CATEGORIES: Category[] = [
  { id: "fallback-atta", slug: "atta", name: "Aata & Flours", hindi: "आटा", sort_order: 1 },
  { id: "fallback-rice", slug: "rice-dal", name: "Rice & Dals", hindi: "चावल व दाल", sort_order: 2 },
  { id: "fallback-oils", slug: "oils-ghee", name: "Oils & Ghee", hindi: "तेल व घी", sort_order: 3 },
  { id: "fallback-spices", slug: "spices", name: "Spices & Cooking", hindi: "मसाले", sort_order: 4 },
  { id: "fallback-tea", slug: "tea-sugar", name: "Tea & Sugar", hindi: "चाय व चीनी", sort_order: 5 },
  { id: "fallback-dairy", slug: "dairy", name: "Dairy & Bakery", hindi: "डेयरी", sort_order: 6 },
  { id: "fallback-snacks", slug: "snacks", name: "Snacks & Namkeen", hindi: "स्नैक्स", sort_order: 7 },
];

const FALLBACK_PRODUCTS: Product[] = [
  { id: "fallback-atta", name: "Fortune Chakki Fresh Atta", hindi: "चक्की आटा", price: 245, mrp: 270, unit: "5 kg", image_key: "grocery-atta", category_slug: "atta", tag: "Bestseller", stock: 50, active: true, created_at: "2026-01-01T00:00:00.000Z" },
  { id: "fallback-rice", name: "Premium Basmati Rice", hindi: "बासमती चावल", price: 520, mrp: 610, unit: "5 kg", image_key: "grocery-rice", category_slug: "rice-dal", tag: "Bestseller", stock: 50, active: true, created_at: "2026-01-01T00:00:01.000Z" },
  { id: "fallback-dal", name: "Arhar / Toor Dal", hindi: "अरहर दाल", price: 148, mrp: 175, unit: "1 kg", image_key: "grocery-pulses", category_slug: "rice-dal", tag: null, stock: 50, active: true, created_at: "2026-01-01T00:00:02.000Z" },
  { id: "fallback-oil", name: "Mustard Oil", hindi: "सरसों तेल", price: 162, mrp: 185, unit: "1 L", image_key: "grocery-mustard-oil", category_slug: "oils-ghee", tag: "Bestseller", stock: 50, active: true, created_at: "2026-01-01T00:00:03.000Z" },
  { id: "fallback-spices", name: "Everest Garam Masala", hindi: "गरम मसाला", price: 78, mrp: 90, unit: "100 g", image_key: "grocery-spices", category_slug: "spices", tag: null, stock: 50, active: true, created_at: "2026-01-01T00:00:04.000Z" },
  { id: "fallback-tea", name: "Red Label Tea", hindi: "चाय पत्ती", price: 142, mrp: 160, unit: "250 g", image_key: "grocery-tea", category_slug: "tea-sugar", tag: null, stock: 50, active: true, created_at: "2026-01-01T00:00:05.000Z" },
  { id: "fallback-milk", name: "Amul Taaza Toned Milk", hindi: "अमूल दूध", price: 33, mrp: 35, unit: "500 ml", image_key: "grocery-milk", category_slug: "dairy", tag: "10 min", stock: 50, active: true, created_at: "2026-01-01T00:00:06.000Z" },
  { id: "fallback-eggs", name: "Farm Fresh Eggs", hindi: "अंडे", price: 84, mrp: 95, unit: "Tray of 12", image_key: "grocery-eggs", category_slug: "dairy", tag: null, stock: 50, active: true, created_at: "2026-01-01T00:00:07.000Z" },
  { id: "fallback-biscuits", name: "Parle-G Biscuits", hindi: "बिस्किट", price: 40, mrp: 48, unit: "Pack of 4", image_key: "grocery-biscuits", category_slug: "snacks", tag: "Combo", stock: 50, active: true, created_at: "2026-01-01T00:00:08.000Z" },
  { id: "fallback-namkeen", name: "Masala Namkeen Mix", hindi: "नमकीन", price: 48, mrp: 55, unit: "400 g", image_key: "grocery-namkeen", category_slug: "snacks", tag: null, stock: 50, active: true, created_at: "2026-01-01T00:00:09.000Z" },
];

export const categoriesQuery = () =>
  queryOptions({
    queryKey: ["categories"],
    initialData: FALLBACK_CATEGORIES,
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error || !data?.length) return FALLBACK_CATEGORIES;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

export const productsQuery = () =>
  queryOptions({
    queryKey: ["products"],
    initialData: FALLBACK_PRODUCTS,
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: true });
      if (error || !data?.length) return FALLBACK_PRODUCTS;
      return data;
    },
    staleTime: 60 * 1000,
  });

export const adminProductsQuery = () =>
  queryOptions({
    queryKey: ["admin-products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

export const myOrdersQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["orders", userId ?? "anon"],
    queryFn: async (): Promise<Order[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(userId),
  });

export const allOrdersQuery = (enabled: boolean) =>
  queryOptions({
    queryKey: ["all-orders"],
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
    enabled,
  });

export const listingsQuery = (kind?: string) =>
  queryOptions({
    queryKey: ["listings", kind ?? "all"],
    queryFn: async (): Promise<ServiceListing[]> => {
      let q = supabase.from("service_listings").select("*").order("created_at", { ascending: false });
      if (kind) q = q.eq("kind", kind);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

export const demandPostsQuery = () =>
  queryOptions({
    queryKey: ["demand-posts"],
    queryFn: async (): Promise<DemandPost[]> => {
      const { data, error } = await supabase
        .from("demand_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

export const myDemandPostsQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["my-demand-posts", userId ?? "anon"],
    queryFn: async (): Promise<DemandPost[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("demand_posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(userId),
  });

export const atmRequestsQuery = (enabled: boolean) =>
  queryOptions({
    queryKey: ["atm-requests"],
    queryFn: async (): Promise<AtmRequest[]> => {
      const { data, error } = await supabase
        .from("mini_atm_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
    enabled,
  });

export const myListingsQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["my-listings", userId ?? "anon"],
    queryFn: async (): Promise<ServiceListing[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("service_listings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(userId),
  });

export const adminListingsQuery = (enabled: boolean) =>
  queryOptions({
    queryKey: ["admin-listings"],
    queryFn: async (): Promise<ServiceListing[]> => {
      if (!enabled) return [];
      const { data, error } = await supabase
        .from("service_listings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
    enabled,
  });
