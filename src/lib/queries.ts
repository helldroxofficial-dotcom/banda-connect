import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products">;
export type Category = Tables<"categories">;
export type Order = Tables<"orders">;
export type ServiceListing = Tables<"service_listings">;
export type DemandPost = Tables<"demand_posts">;
export type AtmRequest = Tables<"mini_atm_requests">;

export const categoriesQuery = () =>
  queryOptions({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

export const productsQuery = () =>
  queryOptions({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
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
