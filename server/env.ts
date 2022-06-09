import {config} from 'dotenv-flow';
config();

function oh_no<T>(): T {
	throw new Error("you forgot to put the environment variables in .env/.env.local and now this program refuses to run.");
}

export const jwt_secret = process.env.JWT_SECRET || oh_no<string>();
export const MongoDB_URI = process.env.MONGODB_URI || oh_no<string>();