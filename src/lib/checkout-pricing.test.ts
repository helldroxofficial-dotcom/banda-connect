import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { marketDeliveryFees, measuredPrice, measuredSavings } from "@/lib/checkout-pricing";

describe("Banda Bazaar checkout pricing", () => {
  it("charges one combined scheduled delivery fee for a ₹149 market order", () => {
    assert.equal(marketDeliveryFees(149, 149, false).delivery, 25);
  });

  it("makes combined scheduled delivery free when the cart exceeds ₹149", () => {
    assert.equal(marketDeliveryFees(150, 150, false).delivery, 0);
  });

  it("adds express only when the customer explicitly selects an express item", () => {
    assert.equal(marketDeliveryFees(120, 80, false).expressFee, 0);
    assert.equal(marketDeliveryFees(120, 80, true).expressFee, 25);
  });

  it("prices 250g and 750g at the per-kilogram rate", () => {
    assert.equal(measuredPrice(155, 250), 39);
    assert.equal(measuredPrice(155, 750), 116);
  });

  it("calculates loose-item savings using matching measured weights", () => {
    assert.equal(measuredSavings(185, 155, 250), 8);
  });
});