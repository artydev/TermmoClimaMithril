import m from "mithril";
import "./styles/main.css";
import "./styles/header.css";
import { Cart } from "./models/cart.js";
import { ProductList } from "./pages/ProductList.js";
import { ProductDetail } from "./pages/ProductDetail.js";
import { CartPage } from "./pages/CartPage.js";
Cart.load();
m.route(document.getElementById("app"), "/", {
  "/": ProductList,
  "/product/:id": ProductDetail,
  "/cart": CartPage,
});
