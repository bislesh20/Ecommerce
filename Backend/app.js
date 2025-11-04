import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "path";
import mongoSanitize from "express-mongo-sanitize";
import { connectDB } from "./config/db";
import { timeStamp } from "console";
import {
  apiLimiter,
  authLimiter,
  passwordResetLimit,
} from "./middleware/rateLimiter";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" }));
app.use(mongoSanitize());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "*",
  })
);

app.get("/health", (req, res) => {
  res.status(200).send("ok");
});

app.use("/api/", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);
app.use("/api/auth/password-reset", passwordResetLimit);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `${req.originalUrl} not Found!`,
  });
});

app.use((err, req, res, next) => {
  console.log("Error: ", err.message);
  res.status(err.status || 5000).json({
    success: false,
    message: err.message || "Something went Wrong!",
  });
});

app.listen(process.env.PORT || 5000, async () => {
  console.log(`Server Running on Port ${PORT}`);
  try {
    await connectDB();
    console.log("Database Connected");
  } catch (err) {
    console.log("Database Connection Failed");
    process.exit(1);
  }
});

export default app;
