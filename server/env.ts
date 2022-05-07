import {config} from 'dotenv-flow';
config();

function oh_no<T>(): T {
	throw new Error("oh no");
}

export const MongoDB_URI = process.env.MONGODB_URI || oh_no<string>();