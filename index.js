import cors from "cors";
import { PORT, CLIENT_URL } from "./const.js";
import express from "express";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: CLIENT_URL,
}));


app.get("/api/health", (req, res) => {
    res.status(200).send("Server is healthy");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});