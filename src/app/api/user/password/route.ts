import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters long' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'User account password not set' }, { status: 404 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);

    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: hashedPassword },
    });

    // Create notification for password change
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Password Changed',
        message: 'Your account password was changed successfully.',
        type: 'PASSWORD_CHANGED',
        link: '/dashboard/settings',
      },
    });

    return NextResponse.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to change password' }, { status: 500 });
  }
}
