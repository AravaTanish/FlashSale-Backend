import express from "express";
import cookieParser from "cookie-parser";
import globalErrorMiddleware from "./middlewares/globalError.middleware.js";

import userRoutes from "./routes/user.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/backend/user", userRoutes);
app.use(globalErrorMiddleware);

export default app;
