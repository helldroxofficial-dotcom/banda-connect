import { img } from "@/lib/images";
import { rupees, useApp } from "@/lib/app-store";
import { QtyButton } from "@/components/app/qty-button";
import type { Product } from "@/lib/queries";

export function ProductCard({ product }: { product: Product }) {
  const { lang } = useApp();
  const mrp = product.mrp ? Number(product.mrp) : null;
  const price = Number(product.price);
  const off = mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <div className="relative flex flex-col rounded-2xl bg-card p-2 shadow-card">
      {off > 0 && (
        <span className="absolute left-2 top-2 z-10 rounded-md bg-amber px-1.5 py-0.5 text-[10px] font-bold text-amber-foreground">
          {off}% OFF
        </span>
      )}
      {product.tag && (
        <span className="absolute right-2 top-2 z-10 rounded-md bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">
          {product.tag}
        </span>
      )}
      <div className="grid aspect-square place-items-center overflow-hidden rounded-xl bg-muted">
        <img
          src={img(product.image_key)}
          alt={product.name}
          loading="lazy"
          width={768}
          height={768}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="mt-2 flex flex-1 flex-col gap-1">
        <p className="line-clamp-2 text-[13px] font-semibold leading-tight">
          {lang === "hi" && product.hindi ? product.hindi : product.name}
        </p>
        <p className="text-[11px] text-muted-foreground">{product.unit}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div>
            <p className="text-sm font-bold">{rupees(price)}</p>
            {mrp && mrp > price && (
              <p className="text-[11px] text-muted-foreground line-through">{rupees(mrp)}</p>
            )}
          </div>
        </div>
        <div className="pt-1">
          <QtyButton
            size="sm"
            item={{
              id: product.id,
              name: product.name,
              hindi: product.hindi,
              price,
              mrp,
              unit: product.unit,
              imageKey: product.image_key,
            }}
          />
        </div>
      </div>
    </div>
  );
}
