import { db } from "./prisma";
import { verifyToken } from "./jwt";
import { cookies } from "next/headers";

export const checkUser = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  try {
    const user = await db.user.findUnique({
      where: { id: payload.userId },
    });
    return user || null;
  } catch (error) {
    console.log(error.message);
    return null;
  }
};
