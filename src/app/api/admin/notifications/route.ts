import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || 'ALL';
    const status = searchParams.get('status') || 'ALL';

    const where: any = {};

    if (type !== 'ALL') {
      where.type = type;
    }

    if (status === 'READ') {
      where.read = true;
    } else if (status === 'UNREAD') {
      where.read = false;
    }

    if (search.trim()) {
      where.OR = [
        { title: { contains: search } },
        { message: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    const [notifications, totalUsers, allUsers] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              businessName: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
      prisma.user.findMany({
        select: { id: true, name: true, email: true, businessName: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    const totalCount = notifications.length;
    const unreadCount = notifications.filter((n) => !n.read).length;
    const broadcastCount = notifications.filter((n) => n.type === 'ANNOUNCEMENT' || n.type === 'OFFER' || n.type === 'BROADCAST').length;

    return NextResponse.json({
      notifications,
      users: allUsers,
      stats: {
        total: totalCount,
        unread: unreadCount,
        broadcasts: broadcastCount,
        totalUsers,
      },
    });
  } catch (error: any) {
    console.error('Admin notifications fetch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 403 });
    }

    const { target, userId, title, message, type = 'ANNOUNCEMENT', link } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    if (target === 'ALL') {
      // Send broadcast notification to ALL users
      const allUsers = await prisma.user.findMany({
        select: { id: true },
      });

      if (allUsers.length === 0) {
        return NextResponse.json({ error: 'No users found in database' }, { status: 400 });
      }

      const notificationData = allUsers.map((u) => ({
        userId: u.id,
        title: title.trim(),
        message: message.trim(),
        type,
        link: link?.trim() || null,
        read: false,
      }));

      const created = await prisma.notification.createMany({
        data: notificationData,
      });

      return NextResponse.json({
        success: true,
        message: `Broadcast notification successfully sent to all ${created.count} users.`,
        count: created.count,
      });
    } else {
      // Send to a single specified user
      if (!userId) {
        return NextResponse.json({ error: 'Please select a recipient user' }, { status: 400 });
      }

      const notification = await prisma.notification.create({
        data: {
          userId,
          title: title.trim(),
          message: message.trim(),
          type,
          link: link?.trim() || null,
          read: false,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Notification successfully sent to user.',
        notification,
      });
    }
  } catch (error: any) {
    console.error('Admin create notification error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create notification' }, { status: 500 });
  }
}
