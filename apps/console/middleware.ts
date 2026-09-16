import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token) return NextResponse.next();

    if (req.nextUrl.pathname.startsWith("/api/"))
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    return NextResponse.redirect(new URL("/auth/log-in", req.url));
}

export const config = {
    matcher: ["/api/company/:path*"],
};
