// Merchant UPI settings. Override via VITE_UPI_MERCHANT_ID / VITE_UPI_MERCHANT_NAME.
export const UPI_CONFIG = {
  merchantId: (import.meta.env["VITE_UPI_MERCHANT_ID"] as string | undefined) || "EXAMPLE_MERCHANT_ID@okaxis",
  merchantName: (import.meta.env["VITE_UPI_MERCHANT_NAME"] as string | undefined) || "Banda SuperApp",
};

export function buildUpiUri(amount?: number, note?: string, ref?: string) {
  const params = new URLSearchParams({ pa: UPI_CONFIG.merchantId, pn: UPI_CONFIG.merchantName, cu: "INR" });
  if (amount && amount > 0) params.set("am", amount.toFixed(2));
  if (note) params.set("tn", note);
  if (ref) params.set("tr", ref);
  return `upi://pay?${params.toString().replace(/\+/g, "%20")}`;
}
