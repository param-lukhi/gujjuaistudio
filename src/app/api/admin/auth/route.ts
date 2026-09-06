import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: { email: cleanEmail, role: 'ADMIN' }
    });

    if (user && user.password) {
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        return NextResponse.json({
          success: true,
          user: { email: user.email, name: user.name, role: user.role },
          token: 'admin-session-token-gujju-ai-studio'
        });
      }
    }

    return NextResponse.json({ error: 'Invalid admin email or password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
