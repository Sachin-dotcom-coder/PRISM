/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import dbConnectFootball from "../../../../lib/mongodb-football";
import { getFootballMatchModel } from "../../../../models/FootballMatch";

async function getModel(req: NextRequest) {
  const conn = await dbConnectFootball();
  const { searchParams } = new URL(req.url);
  const gender = (searchParams.get("gender") as "m" | "f") || "m";
  return getFootballMatchModel(conn as any, gender);
}

export async function GET(req: NextRequest) {
  try {
    const FootballMatch = await getModel(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const match = await FootballMatch.findOne({ match_id: id }).lean();
      if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
      return NextResponse.json(match);
    }

    const matches = await FootballMatch.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(matches);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const FootballMatch = await getModel(req);
    const body = await req.json();
    const match = await FootballMatch.create(body);
    return NextResponse.json(match, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const FootballMatch = await getModel(req);
    const body = await req.json();
    const { match_id, ...updateData } = body;

    if (!match_id) return NextResponse.json({ error: "match_id is required" }, { status: 400 });

    const updated = await FootballMatch.findOneAndUpdate(
      { match_id },
      { $set: updateData },
      { new: true, upsert: false }
    ).lean();

    if (!updated) return NextResponse.json({ error: `Match '${match_id}' not found` }, { status: 404 });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
