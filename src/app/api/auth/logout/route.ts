import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    const cookieName = process.env.COOKIE_NAME || 'admin_session';
    const cookieStore = await cookies();

    cookieStore.delete(cookieName);

    return NextResponse.json({ success: true });
}
