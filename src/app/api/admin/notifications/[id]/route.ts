import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 403 });
    }

    const { id } = params;

    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error: any) {
    console.error('Admin delete notification error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete notification' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 403 });
    }

    const { id } = params;
    const { title, message, type, link, read } = await req.json();

    const data: any = {};
    if (title !== undefined) data.title = title.trim();
    if (message !== undefined) data.message = message.trim();
    if (type !== undefined) data.type = type;
    if (link !== undefined) data.link = link?.trim() || null;
    if (read !== undefined) data.read = Boolean(read);

    const updated = await prisma.notification.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, message: 'Notification updated successfully', notification: updated });
  } catch (error: any) {
    console.error('Admin update notification error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update notification' }, { status: 500 });
  }
}
