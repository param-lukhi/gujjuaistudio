import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import { sendEmail } from '@/lib/mailer';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user) {
      // Return positive message for security so emails aren't leaked
      return NextResponse.json({
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    }

    // Clear old reset tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { email: cleanEmail } });

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        email: cleanEmail,
        token,
        expires,
      },
    });

    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    await sendEmail({
      to: cleanEmail,
      subject: 'Reset Your Password - Gujju AI Studio',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #6366f1;">Password Reset Request</h2>
          <p>You requested a password reset for your Gujju AI Studio account. Click the button below to set a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 16px 0;">Reset Password</a>
          <p style="font-size: 12px; color: #777;">If you did not request this, please ignore this email. Link expires in 1 hour.</p>
        </div>
      `,
    });

    return NextResponse.json({
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (error: any) {
    console.error('Forgot password API error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
