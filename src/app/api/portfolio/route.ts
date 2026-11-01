import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DEFAULT_PORTFOLIO_ITEMS } from '@/lib/portfolioData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    const where: any = {};
    if (category && category !== 'All') {
      where.category = { equals: category };
    }
    if (featured === 'true') {
      where.featured = true;
    }

    let items: any[] = [];
    try {
      items = await prisma.portfolioItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    } catch (dbErr) {
      console.warn('Prisma portfolio fetch fallback:', dbErr);
    }

    if (!items || items.length === 0) {
      items = DEFAULT_PORTFOLIO_ITEMS;
      if (category && category !== 'All') {
        items = items.filter(
          (i) => i.category.toLowerCase() === category.toLowerCase()
        );
      }
      if (featured === 'true') {
        items = items.filter((i) => i.featured);
      }
    }

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(DEFAULT_PORTFOLIO_ITEMS);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, videoUrl, thumbnailUrl, duration, featured } = body;

    if (!title || !category || !videoUrl) {
      return NextResponse.json({ error: 'Missing required title, category, or videoUrl' }, { status: 400 });
    }

    const item = await prisma.portfolioItem.create({
      data: {
        title,
        category,
        videoUrl,
        thumbnailUrl: thumbnailUrl || videoUrl || '',
        duration: duration || '30s',
        featured: Boolean(featured),
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    console.error('Error creating portfolio reel:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create portfolio item' }, { status: 500 });
  }
}
