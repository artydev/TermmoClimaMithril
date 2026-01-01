import m from "mithril";
import { Products } from "../models/products.js";
import { Utils } from "../utils/helpers.js";
export const SearchBar = {
  view() {
    return m(
      "div.search-container",
      m("input.search-input[type=search]", {
        placeholder: "Search products...",
        value: Products.searchTerm(),
        oninput: Utils.debounce((e) => Products.searchTerm(e.target.value), 300),
      }),
      m("span.search-icon", "🔍")
    );
  },
};
