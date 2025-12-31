
declare interface StateType {
	static products: any[];

	static cart: any[];

	static cartOpen: any;

	static loading: any;
}

declare interface ActionsType {
	fetchProducts(): Promise<null>;

	static toggleCart: Function;

	addToCart(product: any): void;

	updateQuantity(id: any, delta: any): any;

	getCartCount(): Function;

	static getCartTotal: Function;
}
