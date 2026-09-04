import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmail } from '@/lib/mailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, businessName, email, phoneNumber, password, confirmPassword } = body;

    if (!name || !email || !phoneNumber || !password) {
      return NextResponse.json(
        { error: 'Name, email, phone number, and password are required.' },
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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        businessName: businessName || null,
        email: cleanEmail,
        phoneNumber,
        password: hashedPassword,
        role: 'CLIENT',
      },
    });

    // Create Email Verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: cleanEmail,
        token,
        expires,
      },
    });

    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const verifyUrl = `${appUrl}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(cleanEmail)}`;

    await sendEmail({
      to: cleanEmail,
      subject: 'Verify Your Email Address - Gujju AI Studio',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #6366f1;">Welcome to Gujju AI Studio, ${name}!</h2>
          <p>Thank you for registering your account. Please click the button below to verify your email address:</p>
          <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 16px 0;">Verify Email Address</a>
          <p style="font-size: 12px; color: #777;">Link expires in 24 hours.</p>
        </div>
      `,
    });

    return NextResponse.json(
      {
        message: 'Account created successfully! Please check your email to verify your account.',
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
