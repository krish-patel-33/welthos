
import { db } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
    const token = cookies().get("token")?.value;

    if (!token) {
        return NextResponse.json({ user: null });
    }

    const payload = await verifyToken(token);

    if (!payload) {
        return NextResponse.json({ user: null });
    }

    const user = await db.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, name: true, imageUrl: true },
    });

    return NextResponse.json({ user });
}
