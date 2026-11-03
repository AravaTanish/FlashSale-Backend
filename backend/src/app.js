import express from "express";
import cookieParser from "cookie-parser";

import globalErrorMiddleware from "./middlewares/globalError.middleware.js";
import globalRateLimiter from "./middlewares/globalRateLimiter.middleware.js";

import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(globalRateLimiter);

app.use("/backend/user", userRoutes);
app.use("/backend/product", productRoutes);
app.use("/backend/order", orderRoutes);

app.use(globalErrorMiddleware);

export default app;
