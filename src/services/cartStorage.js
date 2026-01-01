const key = "mitril-cart_store";

export const CartStorage = {
    load () {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        }
        catch {
            return [];
        }
    },
    save(items) {
        localStorage.setItem(key, JSON.stringify(items));
    }
}