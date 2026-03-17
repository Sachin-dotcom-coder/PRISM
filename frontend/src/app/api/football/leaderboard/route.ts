import { NextRequest, NextResponse } from "next/server";
import { dbConnectFootball } from "@/lib/mongodb";
import { getFootballTeamModel } from "@/models/FootballTeam";

export async function GET(req: NextRequest) {
  try {
    console.log("[API/Football/Leaderboard] Connecting to DB...");
    const conn = await dbConnectFootball();
    console.log(`[API/Football/Leaderboard] DB Connected. ReadyState: ${conn.readyState}`);
    const { searchParams } = new URL(req.url);
    const gender = (searchParams.get("gender") as "m" | "f") || "m";
    const Team = getFootballTeamModel(conn, gender);

    console.log(`[API/Football/Leaderboard] Fetching teams for gender: ${gender} from collection: ${Team.collection.name}`);
    const teams = await Team.find({}).sort({ points: -1, goalDifference: -1 }).lean();
    console.log(`[API/Football/Leaderboard] Found ${teams.length} teams.`);
    return NextResponse.json(teams);
  } catch (error: any) {
    console.error("[API/Football/Leaderboard] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const conn = await dbConnectFootball();
    const { searchParams } = new URL(req.url);
    const gender = (searchParams.get("gender") as "m" | "f") || "m";
    const Team = getFootballTeamModel(conn, gender);

    const body = await req.json();
    const newTeam = await Team.create({
      ...body,
      matches: (body.wins || 0) + (body.draws || 0) + (body.losses || 0),
      goalDifference: (body.goalsFor || 0) - (body.goalsAgainst || 0),
      points: (body.wins || 0) * 3 + (body.draws || 0)
    });

    return NextResponse.json(newTeam, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const conn = await dbConnectFootball();
    const { searchParams } = new URL(req.url);
    const gender = (searchParams.get("gender") as "m" | "f") || "m";
    const Team = getFootballTeamModel(conn, gender);

    const body = await req.json();
    const { _id, ...updateData } = body;

    if (!_id) return NextResponse.json({ error: "Team _id is required" }, { status: 400 });

    const wins = updateData.wins || 0;
    const draws = updateData.draws || 0;
    const losses = updateData.losses || 0;
    const gf = updateData.goalsFor || 0;
    const ga = updateData.goalsAgainst || 0;

    const updated = await Team.findByIdAndUpdate(
      _id,
      { 
        $set: { 
          ...updateData,
          matches: wins + draws + losses,
          goalDifference: gf - ga,
          points: (wins * 3) + draws
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

export async function DELETE(req: NextRequest) {
  try {
    const conn = await dbConnectFootball();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const gender = (searchParams.get("gender") as "m" | "f") || "m";
    const Team = getFootballTeamModel(conn, gender);

    const deleted = await Team.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
