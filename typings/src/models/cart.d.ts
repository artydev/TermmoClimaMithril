
declare interface CartType {
	static items: any[];

	add(p: any): boolean;

	remove(id: any): void;

	updateQuantity(id: any, q: any): null;

	clear(): void;

	getTotal(): Function;

	getCount(): Function;

	save(): void;

	load(): void;
}
