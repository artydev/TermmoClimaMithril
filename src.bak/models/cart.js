import m from "mithril";
import Stream from "mithril-stream";
import { CONSTANTS } from "../utils/constants.js";
import { Utils } from "../utils/helpers.js";
import { Storage } from "../utils/storage.js";
import { Notification } from "./notification.js";
export const Cart = {
  items: Stream([]),
  add(p) {
    if (!p || !p.id || p.stock <= 0) {
      Notification.show("Product unavailable", "error");
      return false;
    }
    const c = Cart.items();
    const e = c.find((i) => i.id === p.id);
    if (e) {
      if (e.quantity >= p.stock || e.quantity >= CONSTANTS.MAX_QUANTITY) {
        Notification.show("Cannot add more", "error");
        return false;
      }
      Cart.items(
        c.map((i) => (i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i))
      );
    } else {
      Cart.items([...c, { ...p, quantity: 1 }]);
    }
    Cart.save();
    Notification.show(`${p.name} added!`);
    return true;
  },
  remove(id) {
    const i = Cart.items().find((x) => x.id === id);
    if (i) {
      Cart.items(Cart.items().filter((x) => x.id !== id));
      Cart.save();
      Notification.show(`${i.name} removed`);
    }
  },
  updateQuantity(id, q) {
    const v = Utils.validateQuantity(q);
    const i = Cart.items().find((x) => x.id === id);
    if (!i) return;
    if (v > i.stock) {
      Notification.show(`Only ${i.stock} available`, "error");
      return;
    }
    Cart.items(
      Cart.items().map((x) => (x.id === id ? { ...x, quantity: v } : x))
    );
    Cart.save();
  },
  clear() {
    Cart.items([]);
    Cart.save();
    Notification.show("Cart cleared");
  },
  getTotal() {
    return Cart.items().reduce((t, i) => t + i.price * i.quantity, 0);
  },
  getCount() {
    return Cart.items().reduce((c, i) => c + i.quantity, 0);
  },
  save() {
    Storage.save(CONSTANTS.STORAGE_KEY, Cart.items());
  },
  load() {
    const s = Storage.load(CONSTANTS.STORAGE_KEY);
    if (s && Array.isArray(s)) Cart.items(s);
  },
};
