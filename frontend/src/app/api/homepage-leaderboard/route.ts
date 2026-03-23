import { NextRequest, NextResponse } from "next/server";
import { dbConnectHomepage } from "@/lib/mongodb";
import { getHomepageTeamModel } from "@/models/HomepageTeam";

export async function GET(req: NextRequest) {
  try {
    const conn = await dbConnectHomepage();
    const { searchParams } = new URL(req.url);
    const gender = (searchParams.get("gender") as "m" | "f") || "m";
    const Team = getHomepageTeamModel(conn, gender);

    const teams = await Team.find({}).sort({ points: -1 }).lean();
    return NextResponse.json(teams);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const conn = await dbConnectHomepage();
    const { searchParams } = new URL(req.url);
    const gender = (searchParams.get("gender") as "m" | "f") || "m";
    const Team = getHomepageTeamModel(conn, gender);

    const body = await req.json();
    body.points = (Number(body.First) || 0) * 7 + (Number(body.Second) || 0) * 5 + (Number(body.Third) || 0) * 3;
    const newTeam = await Team.create(body);
    return NextResponse.json(newTeam, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const conn = await dbConnectHomepage();
    const { searchParams } = new URL(req.url);
    const gender = (searchParams.get("gender") as "m" | "f") || "m";
    const Team = getHomepageTeamModel(conn, gender);

    const body = await req.json();
    const { _id, ...updateData } = body;

    if (!_id) return NextResponse.json({ error: "Team _id is required" }, { status: 400 });

    const existingTeam = await Team.findById(_id).lean();
    if (!existingTeam) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    const first = updateData.First !== undefined ? Number(updateData.First) : existingTeam.First || 0;
    const second = updateData.Second !== undefined ? Number(updateData.Second) : existingTeam.Second || 0;
    const third = updateData.Third !== undefined ? Number(updateData.Third) : existingTeam.Third || 0;

    updateData.points = first * 7 + second * 5 + third * 3;

    const updated = await Team.findByIdAndUpdate(_id, { $set: updateData }, { new: true }).lean();
    if (!updated) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const conn = await dbConnectHomepage();
    const { searchParams } = new URL(req.url);
    const gender = (searchParams.get("gender") as "m" | "f") || "m";
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const Team = getHomepageTeamModel(conn, gender);
    const deleted = await Team.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Team deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
