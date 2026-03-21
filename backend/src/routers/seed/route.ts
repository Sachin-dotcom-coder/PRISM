import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import { getTeamModel } from "../../../models/Team";

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

export async function GET(req: Request) {
  try {
    await dbConnect();

    // Default seed to Mens, can pass ?gender=f to seed women's
    const url = new URL(req.url);
    const gender = (url.searchParams.get("gender") as "m" | "f") || "m";
    const Team = getTeamModel(gender);

    const results = [];
    for (const team of TEAMS) {
      // upsert — insert if not exists, skip if already there
      const existing = await Team.findOne({ name: team.name });
      if (!existing) {
        const created = await Team.create({ ...team, matches: 0, wins: 0, losses: 0, nrr: 0, points: 0 });
        results.push({ status: "created", name: created.name });
      } else {
        results.push({ status: "exists", name: existing.name });
      }
    }

    return NextResponse.json({ success: true, teams: results });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
