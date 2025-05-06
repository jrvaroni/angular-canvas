export interface ILogin {
	expiresIn: Date;
	user: IUser;
	token: string;
}

export interface IUser {
	id: number;
	name: string;
	email: string;
	company: string;
	password: string;
	token: string;
}

