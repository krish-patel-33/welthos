import { db } from "@/lib/prisma";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        const user = await db.user.findUnique({
            where: { email },
        });

        if (!user) {
            // We still return 200 to prevent email enumeration attacks
            return NextResponse.json({ message: "If an account exists, a reset link has been sent" });
        }

        // Generate a random reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        await db.user.update({
            where: { email },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });

        // Generate the reset URL
        const protocol = req.headers.get("x-forwarded-proto") || "http";
        const host = req.headers.get("host") || "localhost:3000";
        const resetUrl = `${protocol}://${host}/reset-password?token=${resetToken}`;

        // In a real application, you'd send an email here using Resend, Nodemailer, etc.
        // For development, we'll log it to the console so it can be clicked.
        console.log("\n=======================================================");
        console.log(" PASSWORD RESET LINK GENERATED:");
        console.log(` -> ${resetUrl}`);
        console.log(" (In production, this would be sent via email)");
        console.log("=======================================================\n");

        return NextResponse.json({ message: "If an account exists, a reset link has been sent. (Check terminal for test link)" });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
