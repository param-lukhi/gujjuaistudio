import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/mailer';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists or create placeholder
    let user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (user && user.isBlocked) {
      return NextResponse.json(
        { error: 'This account has been suspended. Please contact support.' },
        { status: 403 }
      );
    }

    // Generate 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          otpCode: otp,
          otpExpires: otpExpires,
        },
      });
    } else {
      // Auto create new client user account
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: cleanEmail.split('@')[0],
          role: 'CLIENT',
          otpCode: otp,
          otpExpires: otpExpires,
          isVerified: false,
        },
      });
    }

    // Send OTP via Gmail SMTP
    await sendEmail({
      to: cleanEmail,
      subject: `${otp} is your Gujju AI Studio Login OTP 🔐`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0c1017; border-radius: 20px; border: 1px solid #1f293d; color: #ffffff; padding: 32px; text-align: center;">
          <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 14px; background: linear-gradient(135deg, #6366f1, #06b6d4); font-size: 24px; margin-bottom: 16px;">
            ✨
          </div>
          <h2 style="margin: 0 0 8px 0; color: #ffffff; font-size: 24px; font-weight: 800;">Your Login OTP</h2>
          <p style="color: #94a3b8; font-size: 14px; margin: 0 0 24px 0;">Use the 6-digit code below to sign in to your Gujju AI Studio account.</p>
          
          <div style="background: #151b28; border: 2px dashed #6366f1; border-radius: 14px; padding: 18px 24px; margin: 0 auto 24px auto; display: inline-block;">
            <span style="font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #818cf8;">${otp}</span>
          </div>
          
          <p style="color: #64748b; font-size: 12px; margin: 0 0 8px 0;">This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
          <div style="border-top: 1px solid #1e293b; margin-top: 24px; padding-top: 16px; color: #475569; font-size: 11px;">
            Gujju AI Studio • Next-Gen AI Video & Reel Production
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'A 6-digit OTP has been sent to your email address.',
    });
  } catch (error: any) {
    console.error('Send Login OTP error:', error);
    return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 });
  }
}
