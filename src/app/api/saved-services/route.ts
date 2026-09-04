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

    const saved = await prisma.savedService.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ savedServices: saved });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch saved services' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { packageId, serviceName, description, price } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existing = await prisma.savedService.findFirst({
      where: { userId: user.id, packageId },
    });

    if (existing) {
      await prisma.savedService.delete({ where: { id: existing.id } });
      return NextResponse.json({ saved: false, message: 'Removed from saved services' });
    }

    const newSaved = await prisma.savedService.create({
      data: {
        userId: user.id,
        packageId,
        serviceName: serviceName || 'AI Reel Package',
        description,
        price: price || 600,
      },
    });

    return NextResponse.json({ saved: true, service: newSaved });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to toggle saved service' }, { status: 500 });
  }
}
