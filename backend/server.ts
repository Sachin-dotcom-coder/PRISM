import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from './src/config/db';
import matchRoutes from "./src/routers/matchrouter";

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/matches", matchRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});