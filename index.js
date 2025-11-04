import cors from "cors";
import { PORT, CLIENT_URL } from "./const.js";
import connectDB from "./config/db.js";
import express from "express";

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: CLIENT_URL,
}));


app.get("/api/health", (req, res) => {
    res.status(200).send("Server is healthy");
});


// error handler middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        statusCode,
        message: err.message || "Internal Server Error",
        errors: err.errors || [],
    });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});