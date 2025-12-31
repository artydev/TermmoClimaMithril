import m from "mithril";
import { State, Actions } from "./state";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import "./style.css";

const root = document.getElementById("app");

m.route(root, "/", {
  "/": {
    onmatch: () => Actions.fetchProducts(),
    render: () => m(Layout, m(Home))
  },
  "/product/:id": {
    onmatch: async (args) => {
      // Logic for deep linking: ensure data exists before rendering
      if (State.products().length === 0) {
        await Actions.fetchProducts();
      }
      // Lazy-load the detail page for better performance
      const module = await import("./pages/ProductDetail");
      return module.default;
    },
    render: (vnode) => m(Layout, vnode)
  }
});