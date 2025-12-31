import m from "mithril";
import { State, Actions } from "../state";


export default {
  view: () => m(".cart-drawer", { class: State.cartOpen() ? "open" : "" }, [
    // Background Overlay
    m(".cart-overlay", { onclick: Actions.toggleCart }),
    
    // Sidebar Content
    m(".cart-sidebar", [
      m(".cart-header", [
        m("h2", "Your Cart"),
        m("button.close-btn", { onclick: Actions.toggleCart }, "✕")
      ]),

      m(".cart-items", 
        State.cart().length === 0 
          ? m(".empty-msg", "Your cart is empty") 
          : State.cart().map(item => 
              m(".cart-item", [
                m("img", { src: item.image }),
                m(".item-info", [
                  m("h4", item.title),
                  m("p", `$${item.price}`),
                  m(".qty-controls", [
                    m("button", { onclick: () => Actions.updateQuantity(item.id, -1) }, "-"),
                    m("span", item.quantity),
                    m("button", { onclick: () => Actions.updateQuantity(item.id, 1) }, "+")
                  ])
                ])
              ])
            )
      ),

      State.cart().length > 0 && m(".cart-footer", [
        m(".total", [
          m("span", "Total:"),
          m("b", `$${Actions.getCartTotal().toFixed(2)}`)
        ]),
        m("button.checkout-btn", "Checkout Now")
      ])
    ])
  ])
};


