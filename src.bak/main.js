import m from "mithril";
import "./styles/main.css";
import { Cart } from "./models/cart.js";
import { ProductList } from "./pages/ProductList.js";
import { ProductDetail } from "./pages/ProductDetail.js";
import { CartPage } from "./pages/CartPage.js";
Cart.load();


const mLayout = (vnode) => {
  const view = () => m("div", [
    m("header", [m("h1", "Galaxy Store")]),
    m("main#main-content.container", vnode.children),
    m("footer", [
      m("p", "© 2026 Galaxy Store. All rights reserved."),
      m("div", [
        m("a", { href: "#" }, "Privacy Policy"),
        m("a", { href: "#" }, "Terms of Service"),
        m("a", { href: "#" }, "Contact Us"),
      ]),
    ]),
  ]);
  return { view };
}

m.route(document.getElementById("app"), "/", {
  "/": {view: () => m(mLayout,   m("div", "HELLO")) },
  "/product/:id": ProductDetail,
  "/cart": CartPage,
});
