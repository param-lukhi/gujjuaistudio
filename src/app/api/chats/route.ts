import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (orderId) {
      // Get chat messages for specific order
      const messages = await prisma.chatMessage.findMany({
        where: { orderId },
        orderBy: { createdAt: 'asc' },
      });

      // Mark messages as seen
      await prisma.chatMessage.updateMany({
        where: {
          orderId,
          senderRole: user.role === 'ADMIN' ? 'CLIENT' : 'ADMIN',
          seen: false,
        },
        data: { seen: true },
      });

      return NextResponse.json({ messages });
    }

    // Get all user orders with chat snippet
    let ordersWithChats;
    if (user.role === 'ADMIN') {
      ordersWithChats = await prisma.order.findMany({
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { updatedAt: 'desc' },
      });
    } else {
      ordersWithChats = await prisma.order.findMany({
        where: { userId: user.id },
        include: {
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { updatedAt: 'desc' },
      });
    }

    return NextResponse.json({ chats: ordersWithChats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch chats' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, message, fileUrl, fileType, voiceNoteUrl } = await req.json();

    if (!orderId || (!message && !fileUrl && !voiceNoteUrl)) {
      return NextResponse.json({ error: 'Order ID and content are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const chatMessage = await prisma.chatMessage.create({
      data: {
        orderId,
        senderId: user.id,
        senderName: user.name || (user.role === 'ADMIN' ? 'Gujju AI Admin' : 'Client'),
        senderRole: user.role,
        message: message || '',
        fileUrl,
        fileType,
        voiceNoteUrl,
        seen: false,
      },
    });

    // Notify recipient
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order && user.role === 'ADMIN') {
      await prisma.notification.create({
        data: {
          userId: order.userId,
          title: 'New Chat Message',
          message: `Admin sent a new message regarding order #${order.orderNumber}.`,
          type: 'ADMIN_REPLY',
          link: `/dashboard/chats/${orderId}`,
        },
      });
    }

    return NextResponse.json({ message: chatMessage });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to send message' }, { status: 500 });
  }
}
