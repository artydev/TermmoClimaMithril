import m from "mithril";
import { Notification as N } from "../models/notification.js";

export const NotificationComponent = {
  view() {
    const n = N.current();
    if (!n) return null;
    const i = n.type === "error" ? "❌" : n.type === "info" ? "ℹ️" : "✅";
    return m("div.notification", { class: n.type, role: "alert" }, [
      m("span", i),
      m("span", n.message),
    ]);
  },
};
