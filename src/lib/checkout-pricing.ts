import { FEES } from "@/lib/local-data";

export function measuredPrice(perKg: number, grams: number): number {
  return Math.round((perKg * grams) / 1000);
}

export function measuredSavings(mrpPerKg: number, perKg: number, grams: number): number {
  return Math.max(0, measuredPrice(mrpPerKg, grams) - measuredPrice(perKg, grams));
}

export function marketDeliveryFees(
  itemTotal: number,
  scheduledItemTotal: number,
  hasExpressItems: boolean,
) {
  const delivery =
    scheduledItemTotal <= 0
      ? 0
      : itemTotal > FEES.freeDeliveryAbove
        ? 0
        : scheduledItemTotal < FEES.smallOrderBelow
          ? FEES.smallOrderFee
          : FEES.standardFee;
  return { delivery, expressFee: hasExpressItems ? FEES.expressFee : 0 };
}