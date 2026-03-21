import { NextRequest, NextResponse } from "next/server";
import { dbConnectCricket } from "@/lib/mongodb";
import { getTeamModel } from "@/models/Team";

export async function GET(req: NextRequest) {
  try {
    const conn = await dbConnectCricket();
    const { searchParams } = new URL(req.url);
    const gender = (searchParams.get("gender") as "m" | "f") || "m";
    const Team = getTeamModel(conn, gender);

    // Points system: Win = 2, Loss = 0. Matches = Wins + Losses.
    // Sorted by Points descending, then NRR descending.
    const teams = await Team.find({}).sort({ points: -1, nrr: -1 }).lean();
    return NextResponse.json(teams);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const conn = await dbConnectCricket();
    const { searchParams } = new URL(req.url);
    const gender = (searchParams.get("gender") as "m" | "f") || "m";
    const Team = getTeamModel(conn, gender);

    const body = await req.json();
    const { _id, wins, losses, nrr, group } = body;

    if (!_id) return NextResponse.json({ error: "Team _id is required" }, { status: 400 });

    const totalMatches = (wins || 0) + (losses || 0);
    const totalPoints = (wins || 0) * 2;

    const updated = await Team.findByIdAndUpdate(
      _id,
      { 
        $set: { 
          wins: wins || 0, 
          losses: losses || 0, 
          nrr: nrr || 0, 
          matches: totalMatches, 
          points: totalPoints,
          group: group || "A"
        } 
      },
      { new: true }
    ).lean();

    if (!updated) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const conn = await dbConnectCricket();
    const { searchParams } = new URL(req.url);
    const gender = (searchParams.get("gender") as "m" | "f") || "m";
    const Team = getTeamModel(conn, gender);

    const body = await req.json();
    const { name, shortName, group } = body;

    const newTeam = await Team.create({
      name,
      shortName,
      matches: 0,
      wins: 0,
      losses: 0,
      nrr: 0,
      points: 0,
      group: group || "A"
    });

    return NextResponse.json(newTeam, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
