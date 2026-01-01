import m from "mithril";
import Stream from "mithril-stream";
const mockProducts = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 79.99,
    category: "audio",
    stock: 15,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop",
    description: "Premium wireless headphones with active noise cancellation.",
    features: [
      "Active noise cancellation",
      "30-hour battery",
      "Bluetooth 5.0",
      "Comfortable design",
      "Built-in microphone",
    ],
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 199.99,
    category: "wearables",
    stock: 8,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop",
    description: "Feature-rich smartwatch with health tracking.",
    features: [
      "Heart rate monitoring",
      "GPS tracking",
      "Water resistant",
      "7-day battery",
      "Customizable faces",
    ],
  },
  {
    id: 3,
    name: "Laptop Stand",
    price: 49.99,
    category: "accessories",
    stock: 25,
    image:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=400&fit=crop",
    description: "Ergonomic aluminum laptop stand.",
    features: [
      "Adjustable height",
      "Aluminum construction",
      "Compatible 10-17 inches",
      "Improved airflow",
      "Non-slip pads",
    ],
  },
  {
    id: 4,
    name: "Mechanical Keyboard",
    price: 129.99,
    category: "peripherals",
    stock: 12,
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=400&fit=crop",
    description: "RGB mechanical keyboard with custom switches.",
    features: [
      "Hot-swappable switches",
      "RGB backlighting",
      "N-key rollover",
      "Detachable cable",
      "Programmable macros",
    ],
  },
  {
    id: 5,
    name: "USB-C Hub",
    price: 39.99,
    category: "accessories",
    stock: 30,
    image:
      "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=600&h=400&fit=crop",
    description: "Multi-port USB-C hub with fast charging.",
    features: [
      "4K HDMI output",
      "100W power delivery",
      "3x USB 3.0 ports",
      "SD card reader",
      "Compact design",
    ],
  },
  {
    id: 6,
    name: "LED Desk Lamp",
    price: 34.99,
    category: "accessories",
    stock: 20,
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=400&fit=crop",
    description: "LED desk lamp with adjustable brightness.",
    features: [
      "5 brightness levels",
      "3 color modes",
      "Touch controls",
      "USB charging port",
      "Flexible arm",
    ],
  },
  {
    id: 7,
    name: "Wireless Mouse",
    price: 29.99,
    category: "peripherals",
    stock: 3,
    image:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=400&fit=crop",
    description: "Ergonomic wireless mouse with precision tracking.",
    features: [
      "Ergonomic design",
      "4000 DPI sensor",
      "6 programmable buttons",
      "18 months battery",
      "Multi-OS compatible",
    ],
  },
  {
    id: 8,
    name: "Portable SSD",
    price: 89.99,
    category: "storage",
    stock: 0,
    image:
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&h=400&fit=crop",
    description: "Ultra-fast portable SSD with 1TB storage.",
    features: [
      "1TB capacity",
      "1050 MB/s read speed",
      "USB 3.2 Gen 2",
      "Shock-resistant",
      "Multi-platform compatible",
    ],
  },
];
export const Product = {
  list: Stream([]),
  loading: Stream(false),
  error: Stream(null),
  searchTerm: Stream(""),
  sortBy: Stream("name"),
  filterCategory: Stream("all"),
  loadAll() {
    Product.loading(true);
    Product.error(null);
    return new Promise((r) => {
      setTimeout(() => {
        try {
          Product.list(mockProducts);
          Product.loading(false);
          m.redraw();
          r(mockProducts);
        } catch (e) {
          Product.error("Failed to load");
          Product.loading(false);
        }
      }, 500);
    });
  },
  getById(id) {
    return Product.list().find((p) => p.id === parseInt(id, 10));
  },
  getFiltered() {
    let p = Product.list();
    const s = Product.searchTerm().toLowerCase().trim();
    if (s) {
      p = p.filter(
        (x) =>
          x.name.toLowerCase().includes(s) ||
          x.description.toLowerCase().includes(s) ||
          x.category.toLowerCase().includes(s)
      );
    }
    const c = Product.filterCategory();
    if (c !== "all") {
      p = p.filter((x) => x.category === c);
    }
    const sb = Product.sortBy();
    p = [...p].sort((a, b) => {
      switch (sb) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });
    return p;
  },
  getCategories() {
    const c = new Set(Product.list().map((p) => p.category));
    return ["all", ...Array.from(c)];
  },
};
