import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from './src/config/db';
import enquiryRoutes from "./src/routers/enquiryrouter";

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/enquiries", enquiryRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});