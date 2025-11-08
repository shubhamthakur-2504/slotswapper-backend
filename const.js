import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;
const MONGO_URL = process.env.MONGO_URL;
const db_name = "slotswapperdb";

// jwt
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET
const JWT_ACCESS_TOKEN_EXPIRY = Number(process.env.JWT_ACCESS_TOKEN_EXPIRY)
const JWT_REFRESH_TOKEN_EXPIRY = Number(process.env.JWT_REFRESH_TOKEN_EXPIRY)

export { PORT, CLIENT_URL, MONGO_URL, db_name, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_TOKEN_EXPIRY, JWT_REFRESH_TOKEN_EXPIRY };