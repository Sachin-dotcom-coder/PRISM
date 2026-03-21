/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import { getMatchModel } from "../../../models/Match";

// Helper to normalize innings from both old and new DB formats
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeInnings(innings: any[]) {
  if (!Array.isArray(innings)) return [];
  return innings.map((inn) => {
    const team = inn.team || inn.batting_team || "";
    const runs = inn.runs ?? inn.score?.runs ?? 0;
    const wickets = inn.wickets ?? inn.score?.wickets ?? 0;
    const overs = inn.overs ?? inn.score?.overs ?? 0;
    const batters = inn.batters?.length
      ? inn.batters
      : (inn.batting_scorecard || []).map((b: any) => ({
          batter: b.name, runs: b.runs || 0, balls: b.balls || 0, fours: b.fours || 0,
          sixes: b.sixes || 0, strikeRate: b.strike_rate || 0, status: b.dismissal || "not out",
        }));
    const bowlers = inn.bowlers?.length
      ? inn.bowlers
      : (inn.bowling_scorecard || []).map((b: any) => ({
          bowler: b.name, overs: b.overs || 0, maidens: b.maidens || 0, runs: b.runs || 0,
          wickets: b.wickets || 0, economyRates: String(b.economy || "0.0"),
        }));
    return { ...inn, team, runs, wickets, overs, batters, bowlers };
  });
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const gender = (searchParams.get("gender") as "m" | "f") || "m";
    const Match = getMatchModel(gender);
    const id = searchParams.get("id");

    if (id) {
      const match = await Match.findOne({ match_id: id }).lean();
      if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
      const m = match as any;
      m.innings = normalizeInnings(m.innings || []);
      return NextResponse.json(m);
    }

    const matches = await Match.find({}).sort({ createdAt: -1 }).lean();
    const normalized = matches.map((m: any) => ({ ...m, innings: normalizeInnings(m.innings || []) }));
    return NextResponse.json(normalized);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const gender = (searchParams.get("gender") as "m" | "f") || "m";
    const Match = getMatchModel(gender);
    
    const body = await req.json();
    const newMatch = await Match.create(body);
    return NextResponse.json(newMatch, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const gender = (searchParams.get("gender") as "m" | "f") || "m";
    const Match = getMatchModel(gender);

    const body = await req.json();
    const { match_id, ...updateData } = body;

    if (!match_id) return NextResponse.json({ error: "match_id is required" }, { status: 400 });

    const updatedMatch = await Match.findOneAndUpdate(
      { match_id },
      { $set: updateData },
      { new: true, upsert: false }
    ).lean();

    if (!updatedMatch) return NextResponse.json({ error: `Match '${match_id}' not found in DB` }, { status: 404 });

    const m = updatedMatch as any;
    m.innings = normalizeInnings(m.innings || []);
    return NextResponse.json(m);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
