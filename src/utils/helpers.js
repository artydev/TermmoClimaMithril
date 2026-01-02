import { CONSTANTS } from "./constants.js";
export const Utils = {
  formatPrice(p) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(p);
  },
  debounce(f, w) {
    let t;
    return function (...a) {
      clearTimeout(t);
      t = setTimeout(() => f(...a), w);
    };
  },
  validateQuantity(q) {
    const n = parseInt(q, 10);
    if (isNaN(n)) return CONSTANTS.MIN_QUANTITY;
    return Math.max(
      CONSTANTS.MIN_QUANTITY,
      Math.min(CONSTANTS.MAX_QUANTITY, n)
    );
  },
};
