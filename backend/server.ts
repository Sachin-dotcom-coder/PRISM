import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from './src/config/db';
import matchRoutes from "./src/routers/matchrouter";
import volleyballMatchRoutes from "./src/routers/volleyball_router";
import badmintonRoutes from "./src/routes/badminton_routes";
import TTRoutes from "./src/routers/TT.router";

import handballRoutes from "./src/routers/handball_router";
import athleticsRoutes from "./src/routers/athletics_router";
import basketballRoutes from "./src/routers/basketball_router";
import powerSportsRoutes from "./src/routers/powersports_router";

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/matches", matchRoutes);
app.use("/api/volleyball", volleyballMatchRoutes);
app.use("/api/badminton", badmintonRoutes);
app.use("/api/tabletennis", TTRoutes);
app.use("/api/handball", handballRoutes);
app.use("/api/athletics", athleticsRoutes);
app.use("/api/basketball", basketballRoutes);
app.use("/api/powersports", powerSportsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});