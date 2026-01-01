import m from "mithril";
import { Products } from "../models/products.js";
import { Cart } from "../models/cart.js";
import { CONSTANTS } from "../utils/constants.js";
import { Utils } from "../utils/helpers.js";
import { Layout } from "../components/Layout.js";
import { Loading } from "../components/Loading.js";
import { SearchBar } from "../components/SearchBar.js";
import { FilterControls } from "../components/FilterControls.js";

export const ProductList = {
  oninit() {
    const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
    const lastFetch = Products.lastFetchTime || 0;
    const now = Date.now();

    if (Products.list().length === 0 || now - lastFetch > CACHE_DURATION_MS) {
        Products.loadAll().then(() => {
            Products.lastFetchTime = Date.now();
        });
    }
  },
  
  view() {
    const l = Products.loading(),
      e = Products.error(),
      p = Products.getFiltered();
    return m(Layout, [
      m("h1", "Our Products"),
      m(SearchBar),
      m(FilterControls),
      e ? m("div.error-message", e) : null,
      l
        ? m(Loading)
        : p.length === 0
        ? m("div.no-results", [
            m("h3", "No products found"),
            m("p", "Try adjusting filters"),
          ])
        : m(
            "div.products-grid",
            p.map((x) =>
              m(
                "article.product-card",
                { key: x.id, onclick: () => m.route.set("/product/" + x.id) },
                [
                  m("img", { src: x.image, alt: x.name }),
                  m("h3", x.name),
                  m("p.description", x.description.substring(0, 100) + "..."),
                  m("div.price", Utils.formatPrice(x.price)),
                  m(
                    "div.stock-info",
                    {
                      class:
                        x.stock <= CONSTANTS.LOW_STOCK_THRESHOLD && x.stock > 0
                          ? "low-stock"
                          : "",
                    },
                    x.stock === 0
                      ? "Out of Stock"
                      : x.stock <= CONSTANTS.LOW_STOCK_THRESHOLD
                      ? `Only ${x.stock} left!`
                      : `In Stock (${x.stock})`
                  ),
                  m(
                    "button",
                    {
                      onclick: (e) => {
                        e.stopPropagation();
                        Cart.add(x);
                      },
                      disabled: x.stock === 0,
                    },
                    x.stock === 0 ? "Out of Stock" : "Add to Cart"
                  ),
                ]
              )
            )
          ),
    ]);
  },
};
