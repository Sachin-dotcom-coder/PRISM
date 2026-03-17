import { NextRequest, NextResponse } from "next/server";
import { dbConnectCricket } from "@/lib/mongodb";
import { getTeamModel } from "@/models/Team";

const TEAMS = [
  { name: "Mechanical", shortName: "MECH" },
  { name: "Electronics", shortName: "ECE" },
  { name: "Civil", shortName: "CIVIL" },
  { name: "Electrical", shortName: "EEE" },
  { name: "Computer Sc", shortName: "CSE" },
  { name: "Chemical", shortName: "CHEM" },
  { name: "Science", shortName: "SCI" },
  { name: "AI", shortName: "AI" },
  { name: "MBA", shortName: "MBA" },
];

export async function GET(req: NextRequest) {
  try {
    const conn = await dbConnectCricket();
    const url = new URL(req.url);
    const gender = (url.searchParams.get("gender") as "m" | "f") || "m";
    const Team = getTeamModel(conn, gender);

    const results = [];
    for (const team of TEAMS) {
      const existing = await Team.findOne({ name: team.name });
      if (!existing) {
        const created = await Team.create({ ...team, matches: 0, wins: 0, losses: 0, nrr: 0, points: 0 });
        results.push({ status: "created", name: created.name });
      } else {
        results.push({ status: "exists", name: existing.name });
      }
    }

    return NextResponse.json({ success: true, teams: results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
