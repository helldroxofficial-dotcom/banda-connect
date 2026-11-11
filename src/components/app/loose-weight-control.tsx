import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useApp, rupees } from "@/lib/app-store";
import { measuredPrice } from "@/lib/checkout-pricing";
import { img } from "@/lib/images";
import type { LooseItem } from "@/lib/local-data";

export function LooseWeightControl({
  item,
  initialGrams,
  mode = "catalog",
}: {
  item: LooseItem;
  initialGrams?: number;
  mode?: "catalog" | "cart";
}) {
  const { market, lang, t } = useApp();
  const [grams, setGrams] = useState(initialGrams ?? item.minGrams);

  useEffect(() => {
    setGrams(initialGrams ?? item.minGrams);
  }, [initialGrams, item.minGrams]);

  const amount = measuredPrice(item.perKg, grams);
  const quantityInCart = market.qtyOf(item.id) > 0;
  const selectGrams = (next: number) => {
    const bounded = Math.min(item.maxGrams, Math.max(item.minGrams, next));
    const steps = Math.round((bounded - item.minGrams) / item.stepGrams);
    setGrams(item.minGrams + steps * item.stepGrams);
  };
  const save = () => {
    market.addLoose({
      id: item.id,
      name: item.name,
      hindi: item.hindi,
      price: item.perKg,
      mrp: item.mrpPerKg ?? null,
      unit: t("loose", "खुला"),
      imageKey: item.imageKey,
      kind: "grocery",
      loose: { perKg: item.perKg, grams },
    });
  };

  return (
    <div className={mode === "catalog" ? "surface flex flex-col p-3" : "space-y-2 rounded-lg bg-muted/60 p-2"}>
      {mode === "catalog" && (
        <div className="mb-2 aspect-square overflow-hidden rounded-lg bg-muted">
          <img src={img(item.imageKey)} alt={lang === "hi" ? item.hindi : item.name} loading="lazy" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold">{lang === "hi" ? item.hindi : item.name}</p>
          <p className="text-[11px] text-muted-foreground">{rupees(item.perKg)} / {t("kg", "किलो")}</p>
        </div>
        <p className="shrink-0 text-sm font-extrabold text-primary">{rupees(amount)}</p>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          aria-label={t("Weight in grams", "वज़न ग्राम में")}
          type="number"
          inputMode="numeric"
          min={item.minGrams}
          max={item.maxGrams}
          step={item.stepGrams}
          value={grams}
          onChange={(event) => {
            const value = Number(event.currentTarget.value);
            if (Number.isFinite(value)) selectGrams(value);
          }}
          className="h-9 w-24 rounded-md border border-border bg-background px-2 text-sm font-semibold"
        />
        <span className="text-xs font-semibold text-muted-foreground">g</span>
        <span className="ml-auto text-xs font-semibold text-muted-foreground">{rupees(amount)} {t("total", "कुल")}</span>
      </div>
      <Slider
        aria-label={t("Choose loose-item weight", "खुली वस्तु का वज़न चुनें")}
        value={[grams]}
        min={item.minGrams}
        max={item.maxGrams}
        step={item.stepGrams}
        onValueChange={(value) => {
          const next = value[0];
          if (typeof next === "number") selectGrams(next);
        }}
        className="py-2"
      />
      <Button type="button" variant={quantityInCart ? "default" : "outline"} size="sm" onClick={save} className="mt-1 w-full">
        {mode === "cart"
          ? t("Update weight", "वज़न बदलें")
          : quantityInCart
            ? t("Update in cart", "कार्ट में बदलें")
            : `${t("Add", "जोड़ें")} · ${rupees(amount)}`}
      </Button>
    </div>
  );
}