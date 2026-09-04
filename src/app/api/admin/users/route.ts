import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const roleFilter = searchParams.get('role');

    const whereClause: any = {
      OR: [
        { name: { contains: query } },
        { email: { contains: query } },
        { businessName: { contains: query } },
        { username: { contains: query } },
        { phoneNumber: { contains: query } },
      ],
    };

    if (roleFilter && roleFilter !== 'ALL') {
      whereClause.role = roleFilter;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { orders: true, bookings: true },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, role, businessName, phoneNumber, isVerified, image } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name || 'Client User',
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role || 'CLIENT',
        businessName: businessName || null,
        phoneNumber: phoneNumber || null,
        image: image || null,
        isVerified: Boolean(isVerified),
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role, isBlocked, isVerified, name, email, businessName, phoneNumber, password, image } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email.toLowerCase().trim();
    if (role !== undefined) updateData.role = role;
    if (businessName !== undefined) updateData.businessName = businessName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (image !== undefined) updateData.image = image;
    if (isBlocked !== undefined) updateData.isBlocked = Boolean(isBlocked);
    if (isVerified !== undefined) updateData.isVerified = Boolean(isVerified);

    if (password && password.trim().length > 0) {
      updateData.password = await bcrypt.hash(password.trim(), 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({ user: updatedUser, message: 'User updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete user' }, { status: 500 });
  }
}
