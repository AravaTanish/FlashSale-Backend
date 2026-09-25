import express from "express";
import cookieParser from "cookie-parser";
import globalErrorMiddleware from "./middlewares/globalError.middleware.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(globalErrorMiddleware);

export default app;
