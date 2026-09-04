import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        orders: true,
        messages: true,
        notifications: { where: { read: false } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const totalOrders = user.orders.length;
    const completedOrders = user.orders.filter((o) => o.status === 'COMPLETED').length;
    const pendingOrders = user.orders.filter((o) => o.status === 'PENDING' || o.status === 'IN_PROGRESS').length;
    const unreadMessages = user.messages.filter((m) => !m.seen && m.senderRole === 'ADMIN').length;

    return NextResponse.json({
      user,
      stats: {
        totalOrders,
        completedOrders,
        pendingOrders,
        unreadMessages,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // If username is provided, check for uniqueness (excluding current user)
    if (data.username && data.username.trim() !== '') {
      const cleanUsername = data.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      const existing = await prisma.user.findUnique({
        where: { username: cleanUsername },
      });
      if (existing && existing.email !== session.user.email) {
        return NextResponse.json({ error: 'This username is already taken. Please choose another.' }, { status: 400 });
      }
      data.username = cleanUsername;
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: data.name,
        username: data.username || null,
        phoneNumber: data.phoneNumber,
        businessName: data.businessName,
        bio: data.bio,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        website: data.website,
        instagram: data.instagram,
        facebook: data.facebook,
        linkedin: data.linkedin,
        image: data.image,
      },
    });

    // Create notification for profile update
    try {
      await prisma.notification.create({
        data: {
          userId: updatedUser.id,
          title: 'Profile Updated',
          message: 'Your profile details and avatar were updated successfully.',
          type: 'PROFILE_UPDATED',
          link: '/dashboard/profile',
        },
      });
    } catch (notifErr) {
      console.error('Notification creation error:', notifErr);
    }

    return NextResponse.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}
