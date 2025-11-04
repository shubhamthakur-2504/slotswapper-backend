import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;
const MONGO_URL = process.env.MONGO_URL;

export { PORT, CLIENT_URL, MONGO_URL };