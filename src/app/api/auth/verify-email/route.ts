import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  if (!token) {
    return NextResponse.redirect(`${appUrl}/login?error=invalid-verification-link`);
  }

  try {
    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record || record.expires < new Date()) {
      return NextResponse.redirect(`${appUrl}/login?error=expired-verification-token`);
    }

    await prisma.user.update({
      where: { email: record.identifier },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.redirect(`${appUrl}/login?verified=true`);
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(`${appUrl}/login?error=verification-failed`);
  }
}
