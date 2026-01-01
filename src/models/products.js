import Stream from "mithril-stream";


const stream = Stream.bind(this);

export const Products = {
    
    productsList: stream([]),
    
    category: stream("All"),
    
    search: stream(""),
    
    loaded: Stream(false),

    async loadProducts () {

        if (this.loaded()) return Promise.resolve(this.productsList());

        try {
            const response = await fetch("/products.json");
            const data = await response.json();
            this.productsList (data);
            this.loaded = true;
            return this.productsList ();
        }
        catch (error) {
            console.error("Error loading products:", error);
            return [];
        }
              
    }
}
