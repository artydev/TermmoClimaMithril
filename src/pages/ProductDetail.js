import m from 'mithril';
import { Product } from '../models/product.js';
import { Cart } from '../models/cart.js';
import { CONSTANTS } from '../utils/constants.js';
import { Utils } from '../utils/helpers.js';
import { Layout } from '../components/Layout.js';
import { Loading } from '../components/Loading.js';

export const ProductDetail = {
  /**
   * Initialize component
   * Checks cache first, then fetches from API if needed
   */
  oninit(vnode) {
    const productId = parseInt(vnode.attrs.id, 10);
    
    // Check if product is already in the cached list
    const cachedProduct = Product.getById(productId);
    
    if (!cachedProduct) {
      // If not in cache, fetch from API
      Product.loadById(productId).catch(() => {
        // Error is already handled in Product.loadById
        // Just trigger a redraw to show error message
        m.redraw();
      });
    }
  },

  /**
   * Render product detail view
   */
  view(vnode) {
    const productId = parseInt(vnode.attrs.id, 10);
    const product = Product.getById(productId);
    const loading = Product.loading();
    const error = Product.error();

    // Show loading spinner while fetching
    if (loading && !product) {
      return m(Layout, [m(Loading)]);
    }

    // Show error message if API failed
    if (error && !product) {
      return m(Layout, [
        m('div.error-message', { role: 'alert' }, error),
        m('a.back-link', { 
          href: '#!/', 
          oncreate: m.route.link 
        }, '← Back to Products')
      ]);
    }

    // Show not found message if product doesn't exist
    if (!product) {
      return m(Layout, [
        m('div.error-message', { role: 'alert' }, 'Product not found'),
        m('a.back-link', { 
          href: '#!/', 
          oncreate: m.route.link 
        }, '← Back to Products')
      ]);
    }

    // Calculate stock status
    const isOutOfStock = product.stock === 0;
    const isLowStock = product.stock <= CONSTANTS.LOW_STOCK_THRESHOLD && product.stock > 0;

    // Render product detail page
    return m(Layout, [
      // Back navigation link
      m('a.back-link', { 
        href: '#!/', 
        oncreate: m.route.link 
      }, '← Back to Products'),
      
      // Product detail content
      m('article.product-detail', [
        // Product image
        m('div', [
          m('img', { 
            src: product.image, 
            alt: product.name,
            onerror: function(e) {
              // Fallback image if main image fails to load
              e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
            }
          })
        ]),
        
        // Product information
        m('div.product-info', [
          // Product name
          m('h1', product.name),
          
          // Price
          m('div.price', Utils.formatPrice(product.price)),
          
          // Stock status
          m('div.stock-info', {
            class: isLowStock ? 'low-stock' : ''
          }, 
            isOutOfStock ? '⚠️ Out of Stock' :
            isLowStock ? `⚠️ Only ${product.stock} left in stock!` :
            `✅ In Stock (${product.stock} available)`
          ),
          
          // Description
          m('p.description', product.description),
          
          // Features list
          m('div', [
            m('h3', { style: 'margin-bottom: 1rem;' }, 'Features'),
            m('ul.features',
              product.features.map(feature => 
                m('li', { key: feature }, feature)
              )
            )
          ]),
          
          // Action buttons
          m('div.product-actions', [
            // Add to Cart button
            m('button.add-to-cart-btn', {
              onclick: () => Cart.add(product),
              disabled: isOutOfStock,
              'aria-label': `Add ${product.name} to cart`
            }, isOutOfStock ? 'Out of Stock' : 'Add to Cart'),
            
            // Buy Now button (adds to cart and navigates to cart page)
            m('button.buy-now-btn', {
              onclick: () => {
                if (Cart.add(product)) {
                  m.route.set('/cart');
                }
              },
              disabled: isOutOfStock,
              'aria-label': `Buy ${product.name} now`
            }, isOutOfStock ? 'Out of Stock' : 'Buy Now')
          ])
        ])
      ])
    ]);
  }
};