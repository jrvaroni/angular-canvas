interface IorserService {
	id: number;
	customer: number;
	openDate: Date;
	status: boolean;
	totalValue: number;
	anotation: string;
}

interface Iproduct {
	prodId: number;
	cod: string;
	name: string;
	unitPrice: number;
	qtd: number;
}

interface Iservice {
	value: number;
}

export interface OrderService extends Array<IorserService | Iproduct | Iservice> {
	orderService: IorserService;
	product: Array<Iproduct>;
	service: Array<Iservice>
}
