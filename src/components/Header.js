import m from "mithril";
import { Cart } from "../models/cart.js";

/*
export const Header = {
  view() {
    const c = Cart.getCount();
    return m(
      "nav",
      { role: "navigation" },
      m(
        "div.logo",
        m("span", "🛍️"),
        m("a", { href: "#!/", oncreate: m.route.link }, "Galaxy Store")
      ),
      m(
        "div",
        m("a", { href: "#!/", oncreate: m.route.link }, "Products"),
        m("a", { href: "#!/cart", oncreate: m.route.link }, [
          "🛒 Cart ",
          c > 0 ? m("span.cart-badge", c) : null,
        ])
      )
    );
  },
};
*/

export const Header = {
  view() {
    return m("header", { class: "header", id: "header" }, [
      m(
        "div",
        { class: "left" },
        m("img", {
          class: "logo",
          src: "https://termoclimavite.vercel.app/assets/logo.jpg",
          alt: "Logo",
        })
      ),
      m("nav", { class: "center", id: "mainMenu" }, [
        m("a", { href: "#home" }, "Home"),
        m("a", { href: "#products" }, "Products"),
        m("a", { href: "#services" }, "Services"),
        m("a", { href: "#contact" }, "Contact"),
      ]),
      m("div", { class: "right" }, [
        m("button", { class: "search", "aria-label": "Search" }, "🔍"),
        m(
          "button",
          { class: "burger", id: "burger", "aria-label": "Menu" },
          "☰"
        ),
      ]),
    ]);
  },
};
