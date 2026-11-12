import { CalendarDays, Home, LifeBuoy, ShoppingBag, Soup, Wrench } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useApp } from "@/lib/app-store";

export function BottomNav() {
  const { t } = useApp();
  const tabs = [
    { to: "/", icon: Home, label: t("Home", "होम"), exact: true },
    { to: "/food", icon: Soup, label: t("Food", "फूड"), exact: false },
    { to: "/market", icon: ShoppingBag, label: t("Market", "बाज़ार"), exact: false },
    { to: "/services", icon: Wrench, label: t("Services", "सेवाएं"), exact: false },
    { to: "/orders", icon: LifeBuoy, label: t("Orders", "ऑर्डर"), exact: false },
    { to: "/profile", icon: CalendarDays, label: t("Profile", "प्रोफ़ाइल"), exact: false },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-3xl grid-cols-6 px-1">
        {tabs.map(({ to, icon: Icon, label, exact }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact }}
            className="press group relative flex flex-col items-center gap-1 pb-2 pt-2.5 text-[10px] font-semibold text-muted-foreground transition-colors data-[status=active]:text-primary"
          >
            <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-primary opacity-0 transition-opacity group-data-[status=active]:opacity-100" />
            <span className="grid h-8 w-10 place-items-center rounded-full transition-colors group-data-[status=active]:bg-primary-soft">
              <Icon className="h-[17px] w-[17px]" strokeWidth={2.2} />
            </span>
            <span className="tracking-tight">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
