import m from "mithril";
import Stream from "mithril-stream";

// API Configuration
const API_BASE_URL = "https://dummyjson.com";

export const Product = {
  list: Stream([]),
  loading: Stream(false),
  error: Stream(null),
  searchTerm: Stream(""),
  sortBy: Stream("name"),
  filterCategory: Stream("all"),

  /**
   * Load all products from DummyJSON API
   * Fetches 30 products and transforms them to match our app structure
   */
  loadAll() {
    Product.loading(true);
    Product.error(null);

    return m
      .request({
        method: "GET",
        url: `${API_BASE_URL}/products`,
        params: {
          limit: 30,
          select:
            "id,title,price,category,stock,thumbnail,description,images,brand,rating,warrantyInformation",
        },
      })
      .then((response) => {
        // Transform DummyJSON products to our format
        const transformedProducts = response.products.map((product) => ({
          id: product.id,
          name: product.title,
          price: product.price,
          category: product.category,
          stock: product.stock,
          image:
            product.thumbnail ||
            product.images?.[0] ||
            "https://via.placeholder.com/600x400",
          description: product.description,
          brand: product.brand || "Generic",
          rating: product.rating || 0,
          features: [
            `Brand: ${product.brand || "Generic"}`,
            `Category: ${product.category}`,
            `Rating: ${product.rating || "N/A"}/5`,
            `Stock: ${product.stock} units available`,
            `Warranty: ${product.warrantyInformation || "Standard warranty"}`,
          ],
        }));

        Product.list(transformedProducts);
        Product.loading(false);
        return transformedProducts;
      })
      .catch((error) => {
        console.error("Failed to load products:", error);
        Product.error("Failed to load products. Please try again.");
        Product.loading(false);
        throw error;
      });
  },

  /**
   * Load a single product by ID from DummyJSON API
   * Caches the result in the product list
   */
  loadById(id) {
    Product.loading(true);
    Product.error(null);

    return m
      .request({
        method: "GET",
        url: `${API_BASE_URL}/products/${id}`,
      })
      .then((product) => {
        // Transform single product to our format
        const transformedProduct = {
          id: product.id,
          name: product.title,
          price: product.price,
          category: product.category,
          stock: product.stock,
          image:
            product.thumbnail ||
            product.images?.[0] ||
            "https://via.placeholder.com/600x400",
          description: product.description,
          brand: product.brand || "Generic",
          rating: product.rating || 0,
          features: [
            `Brand: ${product.brand || "Generic"}`,
            `Category: ${product.category}`,
            `Rating: ${product.rating || "N/A"}/5`,
            `Stock: ${product.stock} units available`,
            `Warranty: ${product.warrantyInformation || "Standard warranty"}`,
            `Dimensions: ${product.dimensions?.width || "N/A"} x ${
              product.dimensions?.height || "N/A"
            } x ${product.dimensions?.depth || "N/A"} cm`,
            `Weight: ${product.weight || "N/A"} kg`,
          ],
        };

        // Add to list cache if not already there
        const currentList = Product.list();
        const existingIndex = currentList.findIndex(
          (p) => p.id === transformedProduct.id
        );

        if (existingIndex === -1) {
          // Add new product to list
          Product.list([...currentList, transformedProduct]);
        } else {
          // Update existing product with fresh data
          currentList[existingIndex] = transformedProduct;
          Product.list([...currentList]);
        }

        Product.loading(false);
        return transformedProduct;
      })
      .catch((error) => {
        console.error("Failed to load product:", error);
        Product.error("Failed to load product details. Please try again.");
        Product.loading(false);
        throw error;
      });
  },

  /**
   * Search products by query using DummyJSON API
   * Optional: Can be used for real-time search
   */
  searchProducts(query) {
    if (!query || query.trim() === "") {
      return this.loadAll();
    }

    Product.loading(true);
    Product.error(null);

    return m
      .request({
        method: "GET",
        url: `${API_BASE_URL}/products/search`,
        params: {
          q: query,
          limit: 30,
        },
      })
      .then((response) => {
        const transformedProducts = response.products.map((product) => ({
          id: product.id,
          name: product.title,
          price: product.price,
          category: product.category,
          stock: product.stock,
          image:
            product.thumbnail ||
            product.images?.[0] ||
            "https://via.placeholder.com/600x400",
          description: product.description,
          brand: product.brand || "Generic",
          rating: product.rating || 0,
          features: [
            `Brand: ${product.brand || "Generic"}`,
            `Category: ${product.category}`,
            `Rating: ${product.rating || "N/A"}/5`,
            `Stock: ${product.stock} units available`,
            `Warranty: ${product.warrantyInformation || "Standard warranty"}`,
          ],
        }));

        Product.list(transformedProducts);
        Product.loading(false);
        return transformedProducts;
      })
      .catch((error) => {
        console.error("Search failed:", error);
        Product.error("Search failed. Please try again.");
        Product.loading(false);
        throw error;
      });
  },

  /**
   * Get product by ID from loaded list (cache)
   * Returns null if not found in cache
   */
  getById(id) {
    return Product.list().find((p) => p.id === parseInt(id, 10));
  },

  /**
   * Get filtered and sorted products from current list
   * Applies search term, category filter, and sorting
   */
  getFiltered() {
    let products = Product.list();

    // Apply search filter
    const searchTerm = Product.searchTerm().toLowerCase().trim();
    if (searchTerm) {
      products = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    const category = Product.filterCategory();
    if (category !== "all") {
      products = products.filter((product) => product.category === category);
    }

    // Apply sorting
    const sortBy = Product.sortBy();
    products = [...products].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return products;
  },

  /**
   * Get unique categories from loaded products
   * Returns array with "all" plus all unique categories
   */
  getCategories() {
    const categories = new Set(Product.list().map((p) => p.category));
    return ["all", ...Array.from(categories)];
  },
};
