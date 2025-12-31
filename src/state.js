import m from "mithril";
import stream from "mithril/stream";

export const State = {
    products: stream([]),
    cart: stream([]),
    cartOpen: stream(false),
    loading: stream(false),
};

export const Actions = {
    // 1. Fetching Logic (Missing in previous step)
    async fetchProducts() {
        if (State.products().length > 0) return;

        State.loading(true);
        try {
            const res = await fetch("https://fakestoreapi.com/products");
            const data = await res.json();
            State.products(data);
        } catch (err) {
            console.error("Fetch failed", err);
        } finally {
            State.loading(false);
            m.redraw();
        }
    },

    // 2. Cart Toggle
    toggleCart: () => State.cartOpen(!State.cartOpen()),

    // 3. Add to Cart (with quantity logic)
    // The "Object Lookup" way (Best for Performance) if too slow, consider using a Map instead of an Array
    addToCart(product) {
        const list = State.cart();
        const isNew = !list.some(i => i.id == product.id);

        const next = isNew 
            ? [...list, { ...product, quantity: 1 }]
            : list.map(i => i.id == product.id ? { ...i, quantity: i.quantity + 1 } : i);

        State.cart(next);
        // m.redraw();
    },

    // 4. Quantity Controls
    updateQuantity(id, delta) {
        const list = State.cart().map(item => {
            if (item.id === id) {
                item.quantity = Math.max(0, item.quantity + delta);
            }
            return item;
        }).filter(item => item.quantity > 0);

        State.cart(list);
    },

    getCartCount() {
        return State.cart().reduce((total, item) => total + item.quantity, 0);
    },
    // 5. Calculations
    getCartTotal: () => {
        return State.cart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
};