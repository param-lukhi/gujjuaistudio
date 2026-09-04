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
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const replies = await prisma.adminReply.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    const unreadCount = replies.filter((r) => !r.read).length;

    return NextResponse.json({ replies, unreadCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch replies' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, read } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Reply ID required' }, { status: 400 });
    }

    const updated = await prisma.adminReply.update({
      where: { id },
      data: { read: Boolean(read) },
    });

    return NextResponse.json({ reply: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update reply' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Reply ID required' }, { status: 400 });
    }

    await prisma.adminReply.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Conversation deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete reply' }, { status: 500 });
  }
}
