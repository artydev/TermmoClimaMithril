import Stream from "mithril-stream";
import { CartStorage } from "../services/cartStorage";

const stream = Stream.bind(this);

export const Cart = {
  products: stream(CartStorage.load()),

  notification: stream(null),

  addProduct(product) {
    
    const existingItem = this.products.find((i) => i.id === product.id);

    this.products(
      existingItem
        ? this.products.map((p) =>
            p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
          )
        : [...this.products, { ...product, quantity: 1 }]
    );

    CartStorage.save(this.products);

    this.notification(`Added ${product.name} to cart.`);

    setTimeout(() => this.notification(null), 1000);
  },

  removeProductById(productId) {
    this.products(this.products.filter((i) => i.id !== productId));
  },

  updateProductsQuantity(productId, quantity) {
    this.products(
      this.products.map((product) =>
        product.id === productId ? { ...product, quantity: quantity } : product
      )
    );
    CartStorage.save(this.products);
  },

  totalPrice() {
    return this.products.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
  },

  totalCount() {
    return this.products.reduce(
      (total, product) => total + product.quantity,
      0
    );
  },

  clearProducts() {
    this.products([]);
    CartStorage.save(this.products);
  },
};
