import {config} from 'dotenv-flow';
config();
function oh_no<T>(v: string): T {
	throw new Error(`you forgot to put in the environment variables "${v}" in .env/.env.local and now this program refuses to run.`);
}

export const jwt_secret = process.env.JWT_SECRET || oh_no<string>("JWT_SECRET");
export const MongoDB_URI = process.env.MONGODB_URI || oh_no<string>("MONGODB_URI");