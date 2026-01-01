
declare interface ProductType {
	static list: any[];

	static loading: any;

	static error: any;

	static searchTerm: any;

	static sortBy: any;

	static filterCategory: any;

	loadAll(): null;

	getById(id: any): Function;

	getFiltered(): any;

	getCategories(): any[];
}
