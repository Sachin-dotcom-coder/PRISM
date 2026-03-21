/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import dbConnectFootball from "../../../../lib/mongodb-football";
import { getFootballTeamModel } from "../../../../models/FootballTeam";

async function getModel(req: NextRequest) {
  const conn = await dbConnectFootball();
  const { searchParams } = new URL(req.url);
  const gender = (searchParams.get("gender") as "m" | "f") || "m";
  return getFootballTeamModel(conn as any, gender);
}

export async function GET(req: NextRequest) {
  try {
    const Team = await getModel(req);
    const teams = await Team.find({}).sort({ points: -1, goalDifference: -1, goalsFor: -1 }).lean();
    return NextResponse.json(teams);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const Team = await getModel(req);
    const body = await req.json();
    body.matches       = (body.wins || 0) + (body.losses || 0) + (body.draws || 0);
    body.points        = (body.wins || 0) * 3 + (body.draws || 0);
    body.goalDifference = (body.goalsFor || 0) - (body.goalsAgainst || 0);
    const t = await Team.create(body);
    return NextResponse.json(t, { status: 201 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  try {
    const Team = await getModel(req);
    const { _id, ...data } = await req.json();
    data.matches        = (data.wins || 0) + (data.losses || 0) + (data.draws || 0);
    data.points         = (data.wins || 0) * 3 + (data.draws || 0);
    data.goalDifference  = (data.goalsFor || 0) - (data.goalsAgainst || 0);
    const t = await Team.findByIdAndUpdate(_id, data, { new: true }).lean();
    if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(t);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    const Team = await getModel(req);
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await Team.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
