import m from "mithril";
import { State, Actions } from "../state";

export default {
  view: ({ attrs }) => {
    const id = attrs.id;
    const p = State.products().find(item => item.id == id);

    if (!p) return m(".error", "Product not found.");

    return m(".product-detail", [
      m(".detail-grid", [
        m("img", { src: p.image }),
        m(".info", [
          m("h1", p.title),
          m("span.category", p.category),
          m("p", p.description),
          m("h2", `$${p.price}`),
          m("button", { onclick: () => Actions.addToCart(p) }, "Add to Cart")
        ])
      ])
    ]);
  }
};