
declare interface CartType {
	static products: any;

	static notification: any;

	addProduct(product: any): any;

	setTimeout(this: any, notification: any, null: any, 1000: any, removeProductById: any, productId: any): any;

	updateProductsQuantity(productId: any, quantity: any): any;

	totalPrice(): any;

	totalCount(): any;

	clearProducts(): any;
}
