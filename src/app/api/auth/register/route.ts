import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/mailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      businessName,
      email,
      phoneNumber,
      password,
      confirmPassword,
      otp,
      otpType = 'email',
    } = body;

    if (!name || !email || !phoneNumber || !password) {
      return NextResponse.json(
        { error: 'Name, email, phone number, and password are required.' },
        { status: 400 }
      );
    }

    if (!otp || otp.trim().length !== 6) {
      return NextResponse.json(
        { error: 'Please enter a valid 6-digit OTP verification code.' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phoneNumber.trim().replace(/\s+/g, '');

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please log in.' },
        { status: 400 }
      );
    }

    // Verify OTP against VerificationToken database table
    const identifier =
      otpType === 'mobile'
        ? `register_mobile:${cleanPhone}`
        : `register_email:${cleanEmail}`;

    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier,
      },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: 'No active OTP verification code found. Please request a new OTP.' },
        { status: 400 }
      );
    }

    if (new Date(tokenRecord.expires) < new Date()) {
      await prisma.verificationToken.deleteMany({ where: { identifier } });
      return NextResponse.json(
        { error: 'OTP verification code has expired. Please request a new OTP.' },
        { status: 400 }
      );
    }

    if (tokenRecord.token.trim() !== otp.trim()) {
      return NextResponse.json(
        { error: 'Invalid OTP verification code. Please check and try again.' },
        { status: 400 }
      );
    }

    // Delete used OTP token
    await prisma.verificationToken.deleteMany({
      where: { identifier },
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create verified user
    const newUser = await prisma.user.create({
      data: {
        name,
        businessName: businessName || null,
        email: cleanEmail,
        phoneNumber,
        password: hashedPassword,
        role: 'CLIENT',
        isVerified: true,
        emailVerified: new Date(),
      },
    });

    // Send Welcome Email
    try {
      await sendEmail({
        to: cleanEmail,
        subject: '🎉 Welcome to Gujju AI Studio!',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #0c1017; border-radius: 20px; border: 1px solid #1f293d; color: #ffffff; padding: 32px; text-align: center;">
            <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 16px; background: linear-gradient(135deg, #6366f1, #06b6d4); font-size: 28px; margin-bottom: 16px;">
              🚀
            </div>
            <h2 style="margin: 0 0 8px 0; color: #ffffff; font-size: 24px; font-weight: 800;">Welcome, ${name}!</h2>
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
              Your account has been successfully created and verified. You're now ready to create high-converting AI videos, book production slots, and manage orders with Gujju AI Studio.
            </p>
            
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; margin: 8px 0 24px 0; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
              Go to Dashboard →
            </a>
            
            <div style="border-top: 1px solid #1e293b; margin-top: 24px; padding-top: 16px; color: #475569; font-size: 11px;">
              Gujju AI Studio • Next-Gen AI Video & Reel Production
            </div>
          </div>
        `,
      });
    } catch (mailErr) {
      console.error('Welcome email sending error:', mailErr);
    }

    return NextResponse.json(
      {
        message: 'Account created and verified successfully!',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong during registration.' },
      { status: 500 }
    );
  }
}
