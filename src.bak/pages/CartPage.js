import m from "mithril";
import { Cart } from "../models/cart.js";
import { Notification } from "../models/notification.js";
import { CONSTANTS } from "../utils/constants.js";
import { Utils } from "../utils/helpers.js";
import { Header } from "../components/Header.js";
import { NotificationComponent } from "../components/Notification.js";
export const CartPage = {
  view() {
    const i = Cart.items(),
      t = Cart.getTotal(),
      c = Cart.getCount();
    return m("div", [
      m(Header),
      m(NotificationComponent),
      m("main.container", [
        m("h1", "Shopping Cart"),
        i.length === 0
          ? m("div.empty-cart", [
              m(
                "svg",
                {
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": "2",
                },
                [
                  m("circle", { cx: "9", cy: "21", r: "1" }),
                  m("circle", { cx: "20", cy: "21", r: "1" }),
                  m("path", {
                    d: "M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6",
                  }),
                ]
              ),
              m("h2", "Your cart is empty"),
              m("p", "Add some products!"),
              m(
                "a",
                { href: "#!/", oncreate: m.route.link },
                "Continue Shopping"
              ),
            ])
          : m("div", [
              m(
                "div.cart-items",
                i.map((x) =>
                  m("article.cart-item", { key: x.id }, [
                    m("img", { src: x.image, alt: x.name }),
                    m("div.cart-item-info", [
                      m("h3", x.name),
                      m("p.price", Utils.formatPrice(x.price)),
                      x.quantity > x.stock
                        ? m(
                            "p.stock-info.low-stock",
                            `⚠️ Only ${x.stock} available`
                          )
                        : null,
                    ]),
                    m("div.cart-item-actions", [
                      m("div.quantity-controls", [
                        m(
                          "button",
                          {
                            onclick: () =>
                              Cart.updateQuantity(x.id, x.quantity - 1),
                            disabled: x.quantity <= CONSTANTS.MIN_QUANTITY,
                          },
                          "−"
                        ),
                        m("span", x.quantity),
                        m(
                          "button",
                          {
                            onclick: () =>
                              Cart.updateQuantity(x.id, x.quantity + 1),
                            disabled:
                              x.quantity >=
                              Math.min(x.stock, CONSTANTS.MAX_QUANTITY),
                          },
                          "+"
                        ),
                      ]),
                      m(
                        "span",
                        { style: "font-weight:bold" },
                        Utils.formatPrice(x.price * x.quantity)
                      ),
                      m(
                        "button",
                        { onclick: () => Cart.remove(x.id) },
                        "Remove"
                      ),
                    ]),
                  ])
                )
              ),
              m("div.cart-total", [
                m("div.item-count", `${c} ${c === 1 ? "item" : "items"}`),
                m("h2", "Total: " + Utils.formatPrice(t)),
              ]),
              m(
                "button.checkout-btn",
                {
                  onclick: () => {
                    const o = i.filter((x) => x.quantity > x.stock);
                    if (o.length > 0) {
                      Notification.show("Adjust quantities", "error");
                      return;
                    }
                    Notification.show("Checkout demo!", "info");
                  },
                },
                "Proceed to Checkout"
              ),
            ]),
      ]),
    ]);
  },
};
