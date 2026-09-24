import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import connectDB from "./db/connectDB.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

connectDB();

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});