import "../styles/store.css";
import m from 'mithril';
import stream from 'mithril-stream';

m.stream = m.stream || ((typeof stream !== 'undefined') ? stream : null);

'use strict';

/* ========================================
    SECTION 1: APPLICATION CONSTANTS
    ======================================== */

// Global configuration constants for the application
const CONSTANTS = {
    NOTIFICATION_DURATION: 3000,      // Duration to display notifications (ms)
    MAX_QUANTITY: 99,                 // Maximum quantity per product in cart
    MIN_QUANTITY: 1,                  // Minimum quantity per product
    LOW_STOCK_THRESHOLD: 5,           // Threshold to show low stock warning
    STORAGE_KEY: 'galaxy_store_cart', // Key for localStorage
    STORAGE_VERSION: '1.0'            // Version for data migration
};

/* ========================================
    SECTION 2: UTILITY FUNCTIONS
    ======================================== */

// Collection of helper functions used throughout the application
const Utils = {
    // Format number as USD currency
    formatPrice: function(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
    },

    // Debounce function to limit how often a function can fire
    debounce: function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
        clearTimeout(timeout);
        func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
    },

    // Sanitize user input to prevent XSS attacks
    sanitizeInput: function(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
    },

    // Validate and clamp quantity within acceptable range
    validateQuantity: function(quantity) {
    const num = parseInt(quantity, 10);
    if (isNaN(num)) return CONSTANTS.MIN_QUANTITY;
    return Math.max(CONSTANTS.MIN_QUANTITY, Math.min(CONSTANTS.MAX_QUANTITY, num));
    }
};

/* ========================================
    SECTION 3: LOCAL STORAGE MANAGER
    ======================================== */

// Handles all localStorage operations with error handling and versioning
const Storage = {
    // Save data to localStorage with version and timestamp metadata
    save: function(key, data) {
    try {
        const payload = {
        version: CONSTANTS.STORAGE_VERSION,
        timestamp: Date.now(),
        data: data
        };
        localStorage.setItem(key, JSON.stringify(payload));
        return true;
    } catch (e) {
        console.error('Storage save failed:', e);
        // Handle storage quota exceeded error
        if (e.name === 'QuotaExceededError') {
        Notification.show('Storage quota exceeded. Please clear some space.', 'error');
        }
        return false;
    }
    },

    // Load data from localStorage with version checking
    load: function(key) {
    try {
        const item = localStorage.getItem(key);
        if (!item) return null;

        const payload = JSON.parse(item);

        // Check if stored data version matches current version
        if (payload.version !== CONSTANTS.STORAGE_VERSION) {
        console.warn('Storage version mismatch, clearing data');
        this.remove(key);
        return null;
        }

        return payload.data;
    } catch (e) {
        console.error('Storage load failed:', e);
        this.remove(key);
        return null;
    }
    },

    // Remove item from localStorage
    remove: function(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (e) {
        console.error('Storage remove failed:', e);
        return false;
    }
    }
};

/* ========================================
    SECTION 4: NOTIFICATION SYSTEM
    ======================================== */

// Manages temporary notification messages to user
const Notification = {
    current: m.stream(null), // Current notification object

    // Display a notification for a set duration
    show: function(message, type = 'success') {
    Notification.current({ message, type });
    // Auto-hide notification after duration
    setTimeout(() => {
        Notification.current(null);
        m.redraw();
    }, CONSTANTS.NOTIFICATION_DURATION);
    }
};

/* ========================================
    SECTION 5: SHOPPING CART MODEL
    ======================================== */

// Manages shopping cart state and operations
const Cart = {
    items: m.stream([]), // Array of cart items with reactive updates

    // Add product to cart or increment quantity if already exists
    add: function(product) {
    // Validate product object
    if (!product || !product.id) {
        Notification.show('Invalid product', 'error');
        return false;
    }

    // Check if product is in stock
    if (product.stock <= 0) {
        Notification.show('Product is out of stock', 'error');
        return false;
    }

    const currentItems = Cart.items();
    const existingItem = currentItems.find(item => item.id === product.id);

    if (existingItem) {
        // Validate against stock and max quantity limits
        if (existingItem.quantity >= product.stock) {
        Notification.show('Cannot add more items than available in stock', 'error');
        return false;
        }

        if (existingItem.quantity >= CONSTANTS.MAX_QUANTITY) {
        Notification.show(`Maximum quantity is ${CONSTANTS.MAX_QUANTITY}`, 'error');
        return false;
        }

        // Immutably update quantity
        Cart.items(currentItems.map(item => 
        item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
    } else {
        // Add new item to cart immutably
        Cart.items([...currentItems, { ...product, quantity: 1 }]);
    }

    Cart.save();
    Notification.show(`${product.name} added to cart!`);
    return true;
    },

    // Remove product from cart by ID
    remove: function(productId) {
    const item = Cart.items().find(i => i.id === productId);
    if (item) {
        Cart.items(Cart.items().filter(item => item.id !== productId));
        Cart.save();
        Notification.show(`${item.name} removed from cart`);
    }
    },

    // Update quantity of specific cart item
    updateQuantity: function(productId, quantity) {
    const validQuantity = Utils.validateQuantity(quantity);
    const item = Cart.items().find(i => i.id === productId);

    if (!item) return;

    // Validate against available stock
    if (validQuantity > item.stock) {
        Notification.show(`Only ${item.stock} items available in stock`, 'error');
        return;
    }

    // Immutably update cart item quantity
    Cart.items(Cart.items().map(item => 
        item.id === productId 
        ? { ...item, quantity: validQuantity }
        : item
    ));

    Cart.save();
    },

    // Remove all items from cart
    clear: function() {
    Cart.items([]);
    Cart.save();
    Notification.show('Cart cleared');
    },

    // Calculate total price of all items in cart
    getTotal: function() {
    return Cart.items().reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
    },

    // Get total number of items in cart (sum of quantities)
    getCount: function() {
    return Cart.items().reduce((count, item) => {
        return count + item.quantity;
    }, 0);
    },

    // Persist cart to localStorage
    save: function() {
    Storage.save(CONSTANTS.STORAGE_KEY, Cart.items());
    },

    // Load cart from localStorage
    load: function() {
    const saved = Storage.load(CONSTANTS.STORAGE_KEY);
    if (saved && Array.isArray(saved)) {
        Cart.items(saved);
    }
    }
};

/* ========================================
    SECTION 6: PRODUCT MODEL
    ======================================== */

// Manages product data and filtering operations
const Product = {
    list: m.stream([]),           // All products
    loading: m.stream(false),     // Loading state
    error: m.stream(null),        // Error message
    searchTerm: m.stream(''),     // Search filter
    sortBy: m.stream('name'),     // Sort criteria
    filterCategory: m.stream('all'), // Category filter

    // Load all products (simulates API call)
    loadAll: function() {
    Product.loading(true);
    Product.error(null);

    // Simulate async API call with timeout
    return new Promise((resolve) => {
        setTimeout(() => {
        try {
            // Mock product data
            const mockProducts = [
            {
                id: 1,
                name: "Wireless Headphones",
                price: 79.99,
                category: "audio",
                stock: 15,
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop",
                description: "Premium wireless headphones with active noise cancellation technology. Experience crystal-clear audio quality and immersive sound for music, calls, and entertainment.",
                features: [
                "Active noise cancellation with ambient mode",
                "30-hour battery life with quick charge",
                "Bluetooth 5.0 connectivity with multipoint pairing",
                "Comfortable over-ear design with memory foam",
                "Built-in microphone for crystal-clear calls"
                ]
            },
            {
                id: 2,
                name: "Smart Watch",
                price: 199.99,
                category: "wearables",
                stock: 8,
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop",
                description: "Feature-rich smartwatch with comprehensive health tracking capabilities. Stay connected and monitor your fitness goals with advanced sensors and intuitive interface.",
                features: [
                "Heart rate monitoring with ECG capability",
                "GPS tracking for outdoor activities",
                "Water resistant up to 50m for swimming",
                "7-day battery life with power saving mode",
                "Customizable watch faces and bands"
                ]
            },
            {
                id: 3,
                name: "Laptop Stand",
                price: 49.99,
                category: "accessories",
                stock: 25,
                image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=400&fit=crop",
                description: "Ergonomic aluminum laptop stand designed to improve posture and reduce neck strain during extended work sessions. Compatible with all laptop sizes.",
                features: [
                "Adjustable height and angle for optimal viewing",
                "Premium aluminum construction for durability",
                "Compatible with laptops 10-17 inches",
                "Improved airflow for better cooling",
                "Non-slip rubber pads for stability"
                ]
            },
            {
                id: 4,
                name: "Mechanical Keyboard",
                price: 129.99,
                category: "peripherals",
                stock: 12,
                image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=400&fit=crop",
                description: "RGB mechanical keyboard with custom switches for the ultimate typing experience. Perfect for gaming, programming, and productivity with programmable keys.",
                features: [
                "Cherry MX compatible hot-swappable switches",
                "RGB backlighting with 16.8M colors",
                "N-key rollover and anti-ghosting technology",
                "Detachable braided USB-C cable",
                "Programmable macros with onboard memory"
                ]
            },
            {
                id: 5,
                name: "USB-C Hub",
                price: 39.99,
                category: "accessories",
                stock: 30,
                image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=600&h=400&fit=crop",
                description: "Multi-port USB-C hub with fast charging support. Expand your connectivity options with this compact adapter featuring multiple ports for all your devices.",
                features: [
                "4K HDMI output at 60Hz",
                "100W power delivery pass-through",
                "3x USB 3.0 ports for data transfer",
                "SD/microSD card reader",
                "Compact aluminum design with LED indicator"
                ]
            },
            {
                id: 6,
                name: "LED Desk Lamp",
                price: 34.99,
                category: "accessories",
                stock: 20,
                image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=400&fit=crop",
                description: "LED desk lamp with adjustable brightness and color temperature. Perfect lighting for any task or mood with energy-efficient LED technology.",
                features: [
                "5 brightness levels for any environment",
                "3 color temperature modes (warm/neutral/cool)",
                "Touch controls with memory function",
                "USB charging port for devices",
                "Flexible arm with 360° rotation"
                ]
            },
            {
                id: 7,
                name: "Wireless Mouse",
                price: 29.99,
                category: "peripherals",
                stock: 3,
                image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=400&fit=crop",
                description: "Ergonomic wireless mouse with precision tracking and long battery life. Designed for comfort during extended use with customizable buttons.",
                features: [
                "Ergonomic design reduces wrist strain",
                "Precision optical sensor up to 4000 DPI",
                "6 programmable buttons",
                "Up to 18 months battery life",
                "Compatible with Windows, Mac, and Linux"
                ]
            },
            {
                id: 8,
                name: "Portable SSD",
                price: 89.99,
                category: "storage",
                stock: 0,
                image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&h=400&fit=crop",
                description: "Ultra-fast portable SSD with 1TB storage capacity. Perfect for backing up files, transferring large media, and expanding your storage on the go.",
                features: [
                "1TB storage capacity",
                "Read speeds up to 1050 MB/s",
                "USB 3.2 Gen 2 interface",
                "Shock-resistant and durable design",
                "Compatible with PC, Mac, and gaming consoles"
                ]
            }
            ];

            Product.list(mockProducts);
            Product.loading(false);
            m.redraw();
            resolve(mockProducts);
        } catch (e) {
            Product.error('Failed to load products');
            Product.loading(false);
            console.error('Product load error:', e);
        }
        }, 500);
    });
    },

    // Get single product by ID
    getById: function(id) {
    return Product.list().find(p => p.id === parseInt(id, 10));
    },

    // Get filtered and sorted product list based on current filters
    getFiltered: function() {
    let products = Product.list();

    // Apply search filter
    const search = Product.searchTerm().toLowerCase().trim();
    if (search) {
        products = products.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search)
        );
    }

    // Apply category filter
    const category = Product.filterCategory();
    if (category !== 'all') {
        products = products.filter(p => p.category === category);
    }

    // Apply sorting
    const sortBy = Product.sortBy();
    products = [...products].sort((a, b) => {
        switch(sortBy) {
        case 'price-low':
            return a.price - b.price;
        case 'price-high':
            return b.price - a.price;
        case 'name':
        default:
            return a.name.localeCompare(b.name);
        }
    });

    return products;
    },

    // Get unique list of all product categories
    getCategories: function() {
    const categories = new Set(Product.list().map(p => p.category));
    return ['all', ...Array.from(categories)];
    }
};

/* ========================================
    SECTION 7: INITIALIZATION
    ======================================== */

// Load saved cart data on application start
Cart.load();

/* ========================================
    SECTION 8: UI COMPONENTS - SHARED
    ======================================== */

// Navigation header component
const Header = {
    view: function() {
    const cartCount = Cart.getCount();

    return m("nav", { role: "navigation", "aria-label": "Main navigation" },
        m("div.logo", 
        m("span", "🛍️"),
        m("a", { 
            href: "#!/", 
            onclick: function(e) {
            e.preventDefault();
            m.route.set('/');
            }
        }, "Galaxy Store")
        ),
        m("div",
        m("a", { 
            href: "#!/",
            onclick: function(e) {
            e.preventDefault();
            m.route.set('/');
            }
        }, "Products"),
        m("a", { 
            href: "#!/cart",
            onclick: function(e) {
            e.preventDefault();
            m.route.set('/cart');
            },
            "aria-label": `Shopping cart with ${cartCount} items`
        }, [
            "🛒 Cart ",
            cartCount > 0 ? m("span.cart-badge", cartCount) : null
        ])
        )
    );
    }
};

// Toast notification component
const NotificationComponent = {
    view: function() {
    const notification = Notification.current();
    if (!notification) return null;

    // Select icon based on notification type
    const icon = notification.type === 'error' ? '❌' : 
                    notification.type === 'info' ? 'ℹ️' : '✅';

    return m("div.notification", {
        class: notification.type,
        role: "alert",
        "aria-live": "polite"
    }, [
        m("span", icon),
        m("span", notification.message)
    ]);
    }
};

// Loading spinner component
const Loading = {
    view: function() {
    return m("div.loading", { "aria-label": "Loading" },
        m("div.spinner")
    );
    }
};

// Search bar component with debounced input
const SearchBar = {
    view: function() {
    return m("div.search-container",
        m("input.search-input[type=search]", {
        placeholder: "Search products...",
        value: Product.searchTerm(),
        // Debounce search input to avoid excessive filtering
        oninput: Utils.debounce(function(e) {
            Product.searchTerm(e.target.value);
        }, 300),
        "aria-label": "Search products"
        }),
        m("span.search-icon", "🔍")
    );
    }
};

// Filter and sort controls component
const FilterControls = {
    view: function() {
    const categories = Product.getCategories();

    return m("div.filter-controls",
        // Sort dropdown
        m("select", {
        value: Product.sortBy(),
        onchange: function(e) {
            Product.sortBy(e.target.value);
        },
        "aria-label": "Sort products"
        }, [
        m("option[value=name]", "Sort by Name"),
        m("option[value=price-low]", "Price: Low to High"),
        m("option[value=price-high]", "Price: High to Low")
        ]),
        // Category filter dropdown
        m("select", {
        value: Product.filterCategory(),
        onchange: function(e) {
            Product.filterCategory(e.target.value);
        },
        "aria-label": "Filter by category"
        }, 
        categories.map(cat => 
            m("option", { 
            value: cat,
            key: cat
            }, cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1))
        )
        )
    );
    }
};

/* ========================================
    SECTION 9: PAGE COMPONENTS - PRODUCT LIST
    ======================================== */

// Main product listing page
const ProductList = {
    // Initialize products on page load
    oninit: function() {
    if (Product.list().length === 0) {
        Product.loadAll();
    }
    },

    view: function() {
    const loading = Product.loading();
    const error = Product.error();
    const products = Product.getFiltered();

    return m("div", [
        m(Header),
        m(NotificationComponent),
        m("main#main-content.container", { role: "main" }, [
        m("h1", "Our Products"),
        m(SearchBar),
        m(FilterControls),

        // Show error message if products failed to load
        error ? m("div.error-message", { role: "alert" }, error) : null,

        // Show loading spinner while fetching products
        loading ? m(Loading) : 
        // Show message if no products match filters
        products.length === 0 ? m("div.no-results", [
            m("h3", "No products found"),
            m("p", "Try adjusting your search or filters")
        ]) :
        // Render product grid
        m("div.products-grid",
            products.map(product => 
            m("article.product-card", { 
                key: product.id,
                tabindex: 0,
                role: "button",
                "aria-label": `View details for ${product.name}`,
                // Navigate to product detail on click
                onclick: function() {
                m.route.set("/product/" + product.id);
                },
                // Handle keyboard navigation
                onkeypress: function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    m.route.set("/product/" + product.id);
                }
                }
            }, [
                m("img", { 
                src: product.image, 
                alt: product.name,
                loading: "lazy"
                }),
                m("h3", product.name),
                m("p.description", product.description.substring(0, 100) + "..."),
                m("div.price", Utils.formatPrice(product.price)),
                // Display stock status with appropriate styling
                m("div.stock-info", {
                class: product.stock <= CONSTANTS.LOW_STOCK_THRESHOLD && product.stock > 0 ? 'low-stock' : ''
                }, 
                product.stock === 0 ? "Out of Stock" :
                product.stock <= CONSTANTS.LOW_STOCK_THRESHOLD ? `Only ${product.stock} left!` :
                `In Stock (${product.stock})`
                ),
                // Add to cart button
                m("button", {
                onclick: function(e) {
                    e.stopPropagation(); // Prevent card click event
                    Cart.add(product);
                },
                disabled: product.stock === 0,
                "aria-label": `Add ${product.name} to cart`
                }, product.stock === 0 ? "Out of Stock" : "Add to Cart")
            ])
            )
        )
        ]),
        // Footer
        m("footer", [
        m("p", "© 2026 Galaxy Store. All rights reserved."),
        m("div", [
            m("a", { href: "#" }, "Privacy Policy"),
            m("a", { href: "#" }, "Terms of Service"),
            m("a", { href: "#" }, "Contact Us")
        ])
        ])
    ]);
    }
};

/* ========================================
    SECTION 10: PAGE COMPONENTS - PRODUCT DETAIL
    ======================================== */

// Individual product detail page
const ProductDetail = {
    // Load products if not already loaded
    oninit: function(vnode) {
    if (Product.list().length === 0) {
        Product.loadAll();
    }
    },

    view: function(vnode) {
    const productId = parseInt(vnode.attrs.id, 10);
    const product = Product.getById(productId);
    const loading = Product.loading();

    // Show loading state
    if (loading) {
        return m("div", [
        m(Header),
        m("main.container", m(Loading))
        ]);
    }

    // Show error if product not found
    if (!product) {
        return m("div", [
        m(Header),
        m("main.container", { role: "main" }, [
            m("div.error-message", { role: "alert" }, "Product not found"),
            m("a", { 
            href: "#!/",
            onclick: function(e) {
                e.preventDefault();
                m.route.set('/');
            }
            }, "← Back to products")
        ])
        ]);
    }

    const isOutOfStock = product.stock === 0;
    const isLowStock = product.stock <= CONSTANTS.LOW_STOCK_THRESHOLD && product.stock > 0;

    return m("div", [
        m(Header),
        m(NotificationComponent),
        m("main.container", { role: "main" }, [
        // Back navigation link
        m("a.back-link", { 
            href: "#!/",
            onclick: function(e) {
            e.preventDefault();
            m.route.set('/');
            }
        }, "← Back to Products"),
        // Product detail layout
        m("article.product-detail", [
            // Product image
            m("div", [
            m("img", { 
                src: product.image, 
                alt: product.name
            })
            ]),
            // Product information
            m("div.product-info", [
            m("h1", product.name),
            m("div.price", Utils.formatPrice(product.price)),
            // Stock availability indicator
            m("div.stock-info", {
                class: isLowStock ? 'low-stock' : ''
            }, 
                isOutOfStock ? "⚠️ Out of Stock" :
                isLowStock ? `⚠️ Only ${product.stock} left in stock!` :
                `✅ In Stock (${product.stock} available)`
            ),
            m("p.description", product.description),
            // Product features list
            m("div", [
                m("h3", { style: "margin-bottom: 1rem;" }, "Features"),
                m("ul.features",
                product.features.map(feature => 
                    m("li", { key: feature }, feature)
                )
                )
            ]),
            // Action buttons
            m("div.product-actions", [
                // Add to cart button
                m("button.add-to-cart-btn", {
                onclick: function() {
                    Cart.add(product);
                },
                disabled: isOutOfStock,
                "aria-label": `Add ${product.name} to cart`
                }, isOutOfStock ? "Out of Stock" : "Add to Cart"),
                // Buy now button (adds to cart and navigates to cart page)
                m("button.buy-now-btn", {
                onclick: function() {
                    if (Cart.add(product)) {
                    m.route.set("/cart");
                    }
                },
                disabled: isOutOfStock,
                "aria-label": `Buy ${product.name} now`
                }, isOutOfStock ? "Out of Stock" : "Buy Now")
            ])
            ])
        ])
        ])
    ]);
    }
};

/* ========================================
    SECTION 11: PAGE COMPONENTS - SHOPPING CART
    ======================================== */

// Shopping cart page
const CartPage = {
    view: function() {
    const items = Cart.items();
    const total = Cart.getTotal();
    const itemCount = Cart.getCount();

    return m("div", [
        m(Header),
        m(NotificationComponent),
        m("main.container", { role: "main" }, [
        m("h1", "Shopping Cart"),
        // Empty cart state
        items.length === 0 
            ? m("div.empty-cart", [
                // Shopping cart icon
                m("svg", { 
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": "2"
                }, [
                m("circle", { cx: "9", cy: "21", r: "1" }),
                m("circle", { cx: "20", cy: "21", r: "1" }),
                m("path", { d: "M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" })
                ]),
                m("h2", "Your cart is empty"),
                m("p", "Add some products to get started!"),
                m("a", { 
                href: "#!/",
                onclick: function(e) {
                    e.preventDefault();
                    m.route.set('/');
                }
                }, "Continue Shopping")
            ])
            // Cart with items
            : m("div", [
                // Cart items list
                m("div.cart-items",
                items.map(item => 
                    m("article.cart-item", { 
                    key: item.id,
                    role: "group",
                    "aria-label": `${item.name} in cart`
                    }, [
                    m("img", { 
                        src: item.image, 
                        alt: item.name
                    }),
                    // Item information
                    m("div.cart-item-info", [
                        m("h3", item.name),
                        m("p.price", Utils.formatPrice(item.price)),
                        // Warning if quantity exceeds available stock
                        item.quantity > item.stock ? 
                        m("p.stock-info.low-stock", `⚠️ Only ${item.stock} available`) : null
                    ]),
                    // Item actions (quantity controls and remove button)
                    m("div.cart-item-actions", [
                        // Quantity adjustment controls
                        m("div.quantity-controls", [
                        // Decrease quantity button
                        m("button", {
                            onclick: function() {
                            Cart.updateQuantity(item.id, item.quantity - 1);
                            },
                            disabled: item.quantity <= CONSTANTS.MIN_QUANTITY,
                            "aria-label": "Decrease quantity"
                        }, "−"),
                        // Current quantity display
                        m("span", { "aria-label": `Quantity: ${item.quantity}` }, item.quantity),
                        // Increase quantity button
                        m("button", {
                            onclick: function() {
                            Cart.updateQuantity(item.id, item.quantity + 1);
                            },
                            disabled: item.quantity >= Math.min(item.stock, CONSTANTS.MAX_QUANTITY),
                            "aria-label": "Increase quantity"
                        }, "+")
                        ]),
                        // Item subtotal
                        m("span", { 
                        style: "font-weight: bold;",
                        "aria-label": `Subtotal: ${Utils.formatPrice(item.price * item.quantity)}`
                        }, 
                        Utils.formatPrice(item.price * item.quantity)
                        ),
                        // Remove item button
                        m("button", {
                        onclick: function() {
                            Cart.remove(item.id);
                        },
                        "aria-label": `Remove ${item.name} from cart`
                        }, "Remove")
                    ])
                    ])
                )
                ),
                // Cart total summary
                m("div.cart-total", [
                m("div.item-count", `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`),
                m("h2", "Total: " + Utils.formatPrice(total))
                ]),
                // Checkout button
                m("button.checkout-btn", {
                onclick: function() {
                    // Validate stock availability before checkout
                    const outOfStock = items.filter(item => item.quantity > item.stock);
                    if (outOfStock.length > 0) {
                    Notification.show('Some items exceed available stock. Please adjust quantities.', 'error');
                    return;
                    }

                    // Demo notification (in production, redirect to payment)
                    Notification.show('Checkout functionality would process payment here!', 'info');
                },
                "aria-label": `Proceed to checkout with total ${Utils.formatPrice(total)}`
                }, "Proceed to Checkout")
            ])
        ])
    ]);
    }
};

/* ========================================
    SECTION 12: ROUTER CONFIGURATION
    ======================================== */

// Initialize Mithril router with route definitions
m.route(document.getElementById("app"), "/", {
    "/": ProductList,                  // Home page - product listing
    "/product/:id": ProductDetail,     // Product detail page
    "/cart": CartPage                  // Shopping cart page
});

/* ========================================
    SECTION 13: PROGRESSIVE WEB APP (PWA)
    ======================================== */

// Service worker registration for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
    // Uncomment to enable service worker
    // navigator.serviceWorker.register('/sw.js');
    });
}