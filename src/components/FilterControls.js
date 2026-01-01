import m from "mithril";
import { Products } from "../models/products.js";
export const FilterControls = {
  view() {
    const c = Products.getCategories();
    return m(
      "div.filter-controls",
      m(
        "select",
        {
          value: Products.sortBy(),
          onchange: (e) => Products.sortBy(e.target.value),
        },
        [
          m("option[value=name]", "Sort by Name"),
          m("option[value=price-low]", "Price: Low to High"),
          m("option[value=price-high]", "Price: High to Low"),
        ]
      ),
      m(
        "select",
        {
          value: Products.filterCategory(),
          onchange: (e) => Products.filterCategory(e.target.value),
        },
        c.map((x) =>
          m(
            "option",
            { value: x },
            x === "all"
              ? "All Categories"
              : x.charAt(0).toUpperCase() + x.slice(1)
          )
        )
      )
    );
  },
};
