import m from "mithril";
import { State } from "../state";

export default {
  view: () => {
    if (State.loading()) return m(".loader", "Loading items...");
    
    return m(".grid", State.products().map(p => 
      m(".card", { onclick: () => m.route.set(`/product/${p.id}`) }, [
        m("img", { src: p.image, alt: p.title }),
        m("h3", p.title),
        m("p.price", `$${p.price.toFixed(2)}`)
      ])
    ));
  }
};