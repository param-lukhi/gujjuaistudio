import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const DEFAULT_PACKAGES = [
  {
    id: 'starter',
    slug: 'starter',
    name: '🥉 Starter Package',
    price: 600,
    duration: 'Up to 15 Seconds',
    revisions: '1 Revision',
    deliveryDays: 'Delivery in 2 Days',
    features: JSON.stringify([
      '1 AI Product Reel',
      'Up to 15 Seconds',
      '1 Revisions',
      'Delivery in 2 Days',
      '1080p HD Vertical Reel Format'
    ]),
    popular: false,
  },
  {
    id: 'professional',
    slug: 'professional',
    name: '🥈 Professional Package',
    price: 1200,
    duration: 'Up to 30 Seconds Each',
    revisions: '1 Revision',
    deliveryDays: 'Delivery in 2 Days',
    features: JSON.stringify([
      '1 AI Product Reels',
      'Up to 30 Seconds Each',
      'AI Voiceover (Hindi / English)',
      'Commercial Use Rights',
      '1 Revisions',
      'Delivery in 2 Days',
      '4K Ultra HD Reel Format'
    ]),
    popular: true,
  },
  {
    id: 'premium',
    slug: 'premium',
    name: '🥇 Premium Package',
    price: 2300,
    duration: 'Up to 60 Seconds Each',
    revisions: '1 Revision',
    deliveryDays: 'Delivery in 2 Days',
    features: JSON.stringify([
      '1 AI Product Reels',
      'Up to 60 Seconds Each',
      'AI Voiceover',
      'Background Music',
      '1 Revisions',
      'Delivery in 2 Days',
      'Cinematic Script & VFX',
      'Full Commercial & Ad Rights'
    ]),
    popular: false,
  },
];

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      where: {
        slug: { notIn: ['custom-package-pricing-config', 'portfolio-categories-config'] },
      },
      orderBy: { price: 'asc' },
    });
    if (packages && packages.length > 0) {
      return NextResponse.json(packages);
    }
    return NextResponse.json(DEFAULT_PACKAGES);
  } catch (error) {
    console.error('Error fetching packages from DB, using fallback:', error);
    return NextResponse.json(DEFAULT_PACKAGES);
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
