import m from "mithril";
import { Products } from "../models/products.js";
import { Utils } from "../utils/helpers.js";

const handleInput = Utils.debounce((value) => {
  Products.searchTerm(value);
  m.redraw(); 
}, 30);

export const SearchBar = {
  view() {
    return m(
      "div.search-container",
      m("input.search-input[type=search]", {
        placeholder: "Search products...",
        value: Products.searchTerm(),
        oninput: (e) => handleInput(e.target.value),
      }),
      m("span.search-icon", "🔍")
    );
  },
};
