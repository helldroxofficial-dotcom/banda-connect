import { describe, expect, it } from "bun:test";
import { marketDeliveryFees, measuredPrice, measuredSavings } from "@/lib/checkout-pricing";

describe("Banda Bazaar checkout pricing", () => {
  it("charges one combined scheduled delivery fee for a ₹149 market order", () => {
    expect(marketDeliveryFees(149, 149, false).delivery).toBe(25);
  });

  it("makes combined scheduled delivery free when the cart exceeds ₹149", () => {
    expect(marketDeliveryFees(150, 150, false).delivery).toBe(0);
  });

  it("adds express only when the customer explicitly selects an express item", () => {
    expect(marketDeliveryFees(120, 80, false).expressFee).toBe(0);
    expect(marketDeliveryFees(120, 80, true).expressFee).toBe(25);
  });

  it("prices 250g and 750g at the per-kilogram rate", () => {
    expect(measuredPrice(155, 250)).toBe(39);
    expect(measuredPrice(155, 750)).toBe(116);
  });

  it("calculates loose-item savings using matching measured weights", () => {
    expect(measuredSavings(185, 155, 250)).toBe(8);
  });
});