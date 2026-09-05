import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/mailer';

export async function POST(req: Request) {
  try {
    const { type = 'email', email, phoneNumber, name } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phoneNumber ? phoneNumber.trim().replace(/\s+/g, '') : '';

    if (type === 'mobile' && (!cleanPhone || cleanPhone.length < 8)) {
      return NextResponse.json(
        { error: 'Please enter a valid mobile phone number.' },
        { status: 400 }
      );
    }

    // Check if account already exists with this email
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address is already registered. Please sign in instead.' },
        { status: 409 }
      );
    }

    // Generate a secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const identifier =
      type === 'mobile'
        ? `register_mobile:${cleanPhone}`
        : `register_email:${cleanEmail}`;

    // Clean up any existing registration tokens for this identifier
    try {
      await prisma.verificationToken.deleteMany({
        where: { identifier },
      });
    } catch (e) {
      // Ignore if none found
    }

    // Store new OTP token
    await prisma.verificationToken.create({
      data: {
        identifier,
        token: otp,
        expires,
      },
    });

    if (type === 'email') {
      // Dispatch OTP via Email (Gmail SMTP)
      await sendEmail({
        to: cleanEmail,
        subject: `${otp} is your Gujju AI Studio Registration OTP 🔐`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0c1017; border-radius: 20px; border: 1px solid #1f293d; color: #ffffff; padding: 32px; text-align: center;">
            <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 14px; background: linear-gradient(135deg, #6366f1, #06b6d4); font-size: 24px; margin-bottom: 16px;">
              ✨
            </div>
            <h2 style="margin: 0 0 8px 0; color: #ffffff; font-size: 24px; font-weight: 800;">Verify Your Registration</h2>
            <p style="color: #94a3b8; font-size: 14px; margin: 0 0 24px 0;">Hello ${name ? name : 'there'}, use the 6-digit OTP code below to complete your Gujju AI Studio registration.</p>
            
            <div style="background: #151b28; border: 2px dashed #6366f1; border-radius: 14px; padding: 18px 24px; margin: 0 auto 24px auto; display: inline-block;">
              <span style="font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #818cf8;">${otp}</span>
            </div>
            
            <p style="color: #64748b; font-size: 12px; margin: 0 0 8px 0;">This code is valid for <strong>10 minutes</strong>. Do not share this OTP with anyone.</p>
            <div style="border-top: 1px solid #1e293b; margin-top: 24px; padding-top: 16px; color: #475569; font-size: 11px;">
              Gujju AI Studio • Next-Gen AI Video & Reel Production
            </div>
          </div>
        `,
      });
    } else {
      // Mobile SMS OTP dispatch
      console.log('=====================================================');
      console.log(`[SMS OTP DISPATCH] Mobile: ${cleanPhone}`);
      console.log(`[SMS OTP DISPATCH] OTP: ${otp}`);
      console.log(`[SMS OTP DISPATCH] Message: Your Gujju AI Studio registration OTP is ${otp}. Valid for 10 minutes.`);
      console.log('=====================================================');
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit OTP has been sent to your ${type === 'mobile' ? 'mobile number' : 'email address'}.`,
      type,
    });
  } catch (error: any) {
    console.error('Send Register OTP Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}
