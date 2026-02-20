
import { db } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function getUser() {
    const token = cookies().get("token")?.value;

    if (!token) {
        return null;
    }

    const payload = await verifyToken(token);

    if (!payload) {
        return null;
    }

    const user = await db.user.findUnique({
        where: { id: payload.userId },
    });

    return user;
}
