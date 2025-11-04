import mongoose from "mongoose";
import { MONGO_URL, db_name } from "../const.js";

const connectDB = async () => {
    try {
        await mongoose.connect(`${MONGO_URL}/${db_name}?retryWrites=true&w=majority`);
        console.log(`Connected to MongoDB database: ${db_name}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

export default connectDB;