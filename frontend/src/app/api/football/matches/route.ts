import { NextRequest, NextResponse } from "next/server";
import { dbConnectFootball } from "@/lib/mongodb";
import { getFootballMatchModel } from "@/models/FootballMatch";

export async function GET(req: NextRequest) {
  try {
    console.log("[API/Football/Matches] Connecting to DB...");
    const conn = await dbConnectFootball();
    console.log(`[API/Football/Matches] DB Connected. ReadyState: ${conn.readyState}`);
    
    const { searchParams } = new URL(req.url);
    const gender = (searchParams.get("gender") as "m" | "f") || "m";
    const Match = getFootballMatchModel(conn, gender);
    const id = searchParams.get("id");

    console.log(`[API/Football/Matches] Fetching for gender: ${gender}, collection: ${Match.collection.name}`);

    if (id) {
      const match = await Match.findOne({ match_id: id }).lean();
      if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
      return NextResponse.json(match);
    }

    const matches = await Match.find({}).sort({ createdAt: -1 }).lean();
    console.log(`[API/Football/Matches] Found ${matches.length} matches.`);
    return NextResponse.json(matches);
  } catch (error: any) {
    console.error("[API/Football/Matches] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const conn = await dbConnectFootball();
    const { searchParams } = new URL(req.url);
    const gender = (searchParams.get("gender") as "m" | "f") || "m";
    const Match = getFootballMatchModel(conn, gender);
    
    const body = await req.json();
    const newMatch = await Match.create(body);
    return NextResponse.json(newMatch, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const conn = await dbConnectFootball();
    const { searchParams } = new URL(req.url);
    const gender = (searchParams.get("gender") as "m" | "f") || "m";
    const Match = getFootballMatchModel(conn, gender);

    const body = await req.json();
    const { match_id, ...updateData } = body;

    if (!match_id) return NextResponse.json({ error: "match_id is required" }, { status: 400 });

    const updated = await Match.findOneAndUpdate(
      { match_id },
      { $set: updateData },
      { new: true }
    ).lean();

    if (!updated) return NextResponse.json({ error: "Match not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const conn = await dbConnectFootball();
    const { searchParams } = new URL(req.url);
    const gender = (searchParams.get("gender") as "m" | "f") || "m";
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const Match = getFootballMatchModel(conn, gender);
    const deleted = await Match.findOneAndDelete({ match_id: id });

    if (!deleted) return NextResponse.json({ error: "Match not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Match deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
