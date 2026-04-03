import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SyncUserPayload {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SyncUserPayload;

    if (!body.uid) {
      return NextResponse.json({ error: "uid is required" }, { status: 400 });
    }

    const db = await getMongoDb();
    const users = db.collection("users");
    const now = new Date().toISOString();

    await users.updateOne(
      { uid: body.uid },
      {
        $set: {
          uid: body.uid,
          email: body.email || null,
          displayName: body.displayName || null,
          photoURL: body.photoURL || null,
          lastLoginAt: now,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
          history: [],
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("User sync error:", error);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
