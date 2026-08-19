export const PAYMENT_TRANSITIONS = {
  pending: [
    "paid",
    "failed",
  ],

  paid: [
    "refunded",
  ],

  failed: [],

  refunded: [],
};