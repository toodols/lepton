import {config} from 'dotenv-flow';
config();
function oh_no<T>(v: string): T {
	throw new Error(`you forgot to put in the environment variables "${v}" in .env/.env.local and now this program refuses to run.`);
}

export const jwt_secret = process.env.JWT_SECRET?process.env.JWT_SECRET:(console.warn("PLEASE PUT SOMETHING FOR JWT_SECRET"),"afejoifajiofeaioafewijofeajoifeawiojfaewijo");
	
export const MongoDB_URI = process.env.MONGODB_URI || oh_no<string>("MONGODB_URI");
export const REDIS_URI = process.env.REDIS_URI
if (!REDIS_URI) {
	console.warn("PLEASE ADD REDIS_URI TO ENV VARS THX")
}