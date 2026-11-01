import { createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqs, FEES } from "@/lib/local-data";
import { useApp, rupees } from "@/lib/app-store";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & Policies — Delivery, Warranty, Mini-ATM | Banda Bazaar" },
      {
        name: "description",
        content:
          "Understand Banda Bazaar delivery charges, free delivery above ₹149, 7-day warranty, no-overcharging promise and Mini-ATM cash at home.",
      },
      { property: "og:title", content: "Banda Bazaar Help & Policies" },
      { property: "og:description", content: "Delivery fees, 7-day warranty, Mini-ATM and stall pickup explained." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Help,
});

function Help() {
  const { t } = useApp();
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-black">{t("Help & policies", "मदद और नीतियां")}</h1>

      <div className="grid grid-cols-2 gap-2">
        <Stat label={t("Free delivery above", "फ्री डिलीवरी")} value={rupees(FEES.freeDeliveryAbove)} />
        <Stat label={t("Express (15 min)", "एक्सप्रेस (15 मिनट)")} value={rupees(FEES.expressFee)} />
        <Stat label={t("Packaging", "पैकेजिंग")} value={rupees(FEES.packaging)} />
        <Stat label={t("Mini-ATM fee", "मिनी-एटीएम फीस")} value={rupees(FEES.atmFee)} />
      </div>

      <Accordion type="single" collapsible className="rounded-2xl bg-card px-4 shadow-card">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`i${i}`}>
            <AccordionTrigger className="text-left text-sm font-semibold">{f.q}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="rounded-2xl bg-primary-soft p-4 text-xs text-accent-foreground">
        {t(
          "Support: 7 AM – 11 PM daily. Call the number in your order screen or ask Banda Mitra AI.",
          "सपोर्ट: रोज़ सुबह 7 से रात 11 बजे तक। ऑर्डर स्क्रीन पर दिए नंबर पर कॉल करें या बांदा मित्र AI से पूछें।",
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-3 shadow-card">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-base font-black">{value}</p>
    </div>
  );
}
