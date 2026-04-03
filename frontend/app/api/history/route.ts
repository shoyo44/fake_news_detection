import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import { UserHistoryItem } from "@/lib/history";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface StoredUserDocument {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  history: UserHistoryItem[];
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const db = await getMongoDb();
    const users = db.collection<StoredUserDocument>("users");
    const user = await users.findOne(
      { uid: userId },
      { projection: { _id: 0, history: 1 } }
    );

    return NextResponse.json({ history: user?.history || [] });
  } catch (error) {
    console.error("History GET error:", error);
    return NextResponse.json({ error: "Failed to load history" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, item } = body as {
      userId?: string;
      item?: UserHistoryItem;
    };

    if (!userId || !item) {
      return NextResponse.json({ error: "userId and item are required" }, { status: 400 });
    }

    const db = await getMongoDb();
    const users = db.collection<StoredUserDocument>("users");
    const existing = await users.findOne({ uid: userId });
    const nextHistory = [item, ...(existing?.history || []).filter((entry) => entry.id !== item.id)].slice(0, 20);
    const now = new Date().toISOString();

    await users.updateOne(
      { uid: userId },
      {
        $set: {
          history: nextHistory,
          updatedAt: now,
        },
        $setOnInsert: {
          uid: userId,
          createdAt: now,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ history: nextHistory });
  } catch (error) {
    console.error("History POST error:", error);
    return NextResponse.json({ error: "Failed to save history" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const db = await getMongoDb();
    const users = db.collection<StoredUserDocument>("users");
    const now = new Date().toISOString();

    await users.updateOne(
      { uid: userId },
      {
        $set: {
          history: [],
          updatedAt: now,
        },
        $setOnInsert: {
          uid: userId,
          createdAt: now,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("History DELETE error:", error);
    return NextResponse.json({ error: "Failed to clear history" }, { status: 500 });
  }
}
