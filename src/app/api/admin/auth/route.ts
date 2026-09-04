import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Check credentials against database or default admin credentials
    if ((email === 'admin@gujjuai.com' || email === 'admin') && (password === 'admin123' || password === 'admin')) {
      return NextResponse.json({
        success: true,
        user: { email: 'admin@gujjuai.com', name: 'Gujju AI Admin', role: 'ADMIN' },
        token: 'admin-session-token-gujju-ai-studio'
      });
    }

    const user = await prisma.user.findFirst({
      where: { email, password, role: 'ADMIN' }
    });

    if (user) {
      return NextResponse.json({
        success: true,
        user: { email: user.email, name: user.name, role: user.role },
        token: 'admin-session-token-gujju-ai-studio'
      });
    }

    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
