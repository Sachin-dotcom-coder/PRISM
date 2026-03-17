import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from './src/config/db';
import matchRoutes from "./src/routers/matchrouter";
import volleyballMatchRoutes from "./src/routers/volleyball_router";
import volleyballLeadRoutes from "./src/routers/volley_leade_router";
import tennisMatchRoutes from "./src/routers/tennis_router";

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/matches", matchRoutes);
app.use("/api/volleyball", volleyballMatchRoutes);
app.use("/api/volleylead",volleyballLeadRoutes);
app.use("/api/tennis", tennisMatchRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});