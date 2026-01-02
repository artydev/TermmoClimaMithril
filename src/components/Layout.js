import m from "mithril";
import { Header } from "./Header.js";
import { NotificationComponent } from "./Notification.js";
export const Layout = {
  view(vnode) {
    return m("div", [
      m(Header),
      m(NotificationComponent),
      m("main#main-content.container", vnode.children),
      m("footer", [
        m("p", "© 2026 Galaxy Store. All rights reserved."),
        m("div", [
          m("a", { href: "#" }, "Privacy Policy"),
          m("a", { href: "#" }, "Terms of Service"),
          m("a", { href: "#" }, "Contact Us"),
        ]),
      ]),
    ]);
  },
};
