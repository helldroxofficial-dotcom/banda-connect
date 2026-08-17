import { Link } from "@tanstack/react-router";
import { Home, LifeBuoy, ShoppingBasket, User, Wrench } from "lucide-react";
import { useApp } from "@/lib/app-store";

export function BottomNav() {
  const { t } = useApp();
  const tabs = [
    { to: "/", icon: Home, label: t("Home", "होम"), exact: true },
    { to: "/market", icon: ShoppingBasket, label: t("Market", "बाज़ार"), exact: false },
    { to: "/services", icon: Wrench, label: t("Services", "सेवाएं"), exact: false },
    { to: "/orders", icon: LifeBuoy, label: t("Orders", "ऑर्डर"), exact: false },
    { to: "/profile", icon: User, label: t("Profile", "प्रोफ़ाइल"), exact: false },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
      <div className="mx-auto grid max-w-3xl grid-cols-5">
        {tabs.map(({ to, icon: Icon, label, exact }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact }}
            className="press flex flex-col items-center gap-0.5 py-2 text-[11px] text-muted-foreground data-[status=active]:text-primary"
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
