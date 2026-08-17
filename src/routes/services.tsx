import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, MapPin, Phone, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useApp, rupees } from "@/lib/app-store";
import {
  doctors,
  labTests,
  pros,
  rentListings,
  skills,
  tradeCategories,
  tutorListings,
  FEES,
} from "@/lib/local-data";
import { img } from "@/lib/images";
import { demandPostsQuery } from "@/lib/queries";

type Tab = "workers" | "skills" | "health" | "rooms" | "tutors" | "demand";
const TABS: Tab[] = ["workers", "skills", "health", "rooms", "tutors", "demand"];

export const Route = createFileRoute("/services")({
  validateSearch: (search: Record<string, unknown>): { tab: Tab } => ({
    tab: TABS.includes(search["tab"] as Tab) ? (search["tab"] as Tab) : "workers",
  }),
  head: () => ({
    meta: [
      { title: "Services — Plumbers, Doctors, Rooms & Tutors in Banda | Banda Bazaar" },
      {
        name: "description",
        content:
          "Book verified plumbers, electricians, bike mechanics and carpenters, consult Banda doctors, find rooms on rent and home tutors — all in one place.",
      },
      { property: "og:title", content: "Banda Services — Verified Workers, Doctors, Rooms, Tutors" },
      {
        property: "og:description",
        content: "Fixed-rate local services with ratings, home visits and a demand board for anything else.",
      },
    ],
  }),
  component: Services;
});

function Services() {
  return null;
}
