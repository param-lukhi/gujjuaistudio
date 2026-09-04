import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      orderBy: { price: 'asc' },
    });
    return NextResponse.json(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, price, duration, revisions, deliveryDays, features, popular } = body;

    if (!name || !price) {
      return NextResponse.json({ error: 'Package name and price are required' }, { status: 400 });
    }

    const packageSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check slug uniqueness
    const existing = await prisma.package.findUnique({
      where: { slug: packageSlug },
    });

    const finalSlug = existing ? `${packageSlug}-${Date.now()}` : packageSlug;

    const newPkg = await prisma.package.create({
      data: {
        name,
        slug: finalSlug,
        price: Number(price),
        duration: duration || 'Up to 30 Seconds',
        revisions: revisions || '1 Revision',
        deliveryDays: deliveryDays || '2 Days',
        features: typeof features === 'string' ? features : JSON.stringify(features || []),
        popular: Boolean(popular),
      },
    });

    return NextResponse.json({ success: true, package: newPkg });
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
  }
}
