import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete('auth_token');
        return NextResponse.json({ success: true, message: 'Logged out successfully' });
    } catch (error: any) {
        console.error('Clinician logout route error:', error);
        return NextResponse.json({ error: { message: 'Internal server error' } }, { status: 500 });
    }
}
