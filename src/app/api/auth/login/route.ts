import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { token } = await request.json();
        const adminToken = process.env.ADMIN_ACCESS_TOKEN;
        const cookieName = process.env.COOKIE_NAME || 'admin_session';

        if (!adminToken) {
            console.error("ADMIN_ACCESS_TOKEN is not defined in environment variables");
            return NextResponse.json({ success: false, message: "Server configuration error" }, { status: 500 });
        }

        if (token === adminToken) {
            // Valid token. Set cookie.
            // Awaiting cookies() in Next.js 15+ / recent versions if needed, 
            // but in 14 it's standard. The type defs suggest it's async or sync depending on version.
            // Safe to await if it returns a promise.
            const cookieStore = await cookies();

            cookieStore.set(cookieName, 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7, // 1 week
                path: '/',
                sameSite: 'lax',
            });

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, message: "Invalid access token" }, { status: 401 });
        }
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
