import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { token, email, otpCode, password, confirmPassword } = await req.json();

    const newPassword = password;
    if (!newPassword) {
      return NextResponse.json({ error: 'Password is required.' }, { status: 400 });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 1. Token-based Reset
    if (token) {
      const resetTokenRecord = await prisma.passwordResetToken.findUnique({
        where: { token },
      });

      if (!resetTokenRecord || resetTokenRecord.expires < new Date()) {
        return NextResponse.json(
          { error: 'Invalid or expired password reset token.' },
          { status: 400 }
        );
      }

      await prisma.user.update({
        where: { email: resetTokenRecord.email },
        data: { password: hashedPassword },
      });

      await prisma.passwordResetToken.delete({ where: { token } });

      return NextResponse.json({ message: 'Password has been reset successfully. You can now login.' });
    }

    // 2. OTP-based Reset
    if (email && otpCode) {
      const cleanEmail = email.toLowerCase().trim();
      const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

      if (!user || !user.otpCode || !user.otpExpires) {
        return NextResponse.json({ error: 'Invalid or expired OTP code.' }, { status: 400 });
      }

      if (user.otpCode !== otpCode.trim()) {
        return NextResponse.json({ error: 'Incorrect OTP code.' }, { status: 400 });
      }

      if (new Date() > new Date(user.otpExpires)) {
        return NextResponse.json({ error: 'OTP code has expired. Please request a new one.' }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          otpCode: null,
          otpExpires: null,
        },
      });

      return NextResponse.json({ message: 'Password has been reset successfully. You can now login.' });
    }

    return NextResponse.json({ error: 'Token or OTP code is required to reset password.' }, { status: 400 });
  } catch (error: any) {
    console.error('Reset password API error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
