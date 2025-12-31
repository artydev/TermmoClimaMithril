import m from "mithril";
import { State } from "../state";
import { Actions } from "../state";
import Cart from "./Cart";

export default {
  view: (vnode) => m("main", [
    m("nav.navbar", [
      m(".nav-content", [
        m("a.logo", { href: "/", oncreate: m.route.link }, "⚒️ MITHRIL SHOP"),
        m(".cart-badge", [
          m("span",  { onclick: Actions.toggleCart } ,"🛒 Cart"),
         m("b.count", Actions.getCartCount())
        ])
      ])
    ]),
    m(Cart),
    m("section.container", vnode.children),
    m("footer", "Built with Mithril.js & Vite")
  ])
};