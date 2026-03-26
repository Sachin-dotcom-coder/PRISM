import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from './src/config/db';
import matchRoutes from "./src/routers/matchrouter";
import volleyballMatchRoutes from "./src/routers/volleyball_router";
import badmintonRoutes from "./src/routers/badminton_routes";
import TTRoutes from "./src/routers/TT.router";
import handballRoutes from "./src/routers/handball_router";
import khoKhoRoutes from "./src/routers/khokho_router";
import athleticsRoutes from "./src/routers/athletics_router";
import basketballRoutes from "./src/routers/basketball_router";
import powerSportsRoutes from "./src/routers/powersports_router";
import tugOfWarRoutes from "./src/routers/tugofwar_router";
import armWrestlingRoutes from "./src/routers/armwrestling_router";
import chessRoutes from "./src/routers/chess_router";
import carromRoutes from "./src/routers/carrom_router";
import volleyballLeadRoutes from "./src/routers/volley_leade_router";
import tennisMatchRoutes from "./src/routers/tennis_router";
import tennisLead from "./src/routers/tennis_lead_router";
import athleticsLead from "./src/routers/athletics_lead_router";
import badmintonLeadRoutes from "./src/routers/badminton_lead_router";
import basketballLeadRoutes from "./src/routers/basketball_lead_router";
import handballLeadRoutes from "./src/routers/handball_lead_router";
import ttLeadRoutes from "./src/routers/TT_lead_router";
import powersportLeadRoutes from "./src/routers/powersports_lead_router";
import kabaddiRoutes from "./src/routers/kabaddi_router";
import kabaddiLeadRoutes from "./src/routers/kabaddi_lead_router";

import khokhoLeadRoutes from "./src/routers/khokho_lead_router";
import tugofwarLeadRoutes from "./src/routers/tugofwar_lead_router";
import chessLeadRoutes from "./src/routers/chess_lead_router";
import armWrestlingLeadRoutes from "./src/routers/armwrestling_lead_router";
import carromLeadRoutes from "./src/routers/carrom_lead_router";

dotenv.config();

const app = express();

connectDB();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

app.use("/api/matches", matchRoutes);
app.use("/api/volleyball", volleyballMatchRoutes);
app.use("/api/tabletennis", TTRoutes);
app.use("/api/handball", handballRoutes);
app.use("/api/kho-kho", khoKhoRoutes);
app.use("/api/athletics", athleticsRoutes);
app.use("/api/basketball", basketballRoutes);
app.use("/api/powersports", powerSportsRoutes);
app.use("/api/tug-of-war", tugOfWarRoutes);
app.use("/api/arm-wrestling", armWrestlingRoutes);
app.use("/api/chess", chessRoutes);
app.use("/api/carrom", carromRoutes);
app.use("/api/volleylead", volleyballLeadRoutes);
app.use("/api/tennis", tennisMatchRoutes);
app.use("/api/badminton", badmintonRoutes);
app.use("/api/tennis-lead",tennisLead);
app.use("/api/athletics-lead",athleticsLead);
app.use("/api/badminton-leaderboard", badmintonLeadRoutes);
app.use("/api/basketball-leaderboard", basketballLeadRoutes);
app.use("/api/handball-leaderboard",handballLeadRoutes);
app.use("/api/tt-lead",ttLeadRoutes);
app.use("/api/powersport-lead",powersportLeadRoutes)
app.use("/api/kabaddi", kabaddiRoutes);
app.use("/api/kabaddi-leaderboard", kabaddiLeadRoutes);
app.use("/api/powersport-lead",powersportLeadRoutes);
app.use("/api/khokho-leaderboard", khokhoLeadRoutes);
app.use("/api/tugofwar-leaderboard", tugofwarLeadRoutes);
app.use("/api/chess-leaderboard", chessLeadRoutes);
app.use("/api/armwrestling-leaderboard", armWrestlingLeadRoutes);
app.use("/api/carrom-leaderboard", carromLeadRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.get("/", (req, res) => {
  res.send("PRISM API running 🚀");
});
