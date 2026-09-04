import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientName, business, rating, comment, avatarUrl, featured } = body;

    if (!clientName || !comment) {
      return NextResponse.json({ error: 'Client name and comment are required' }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        clientName,
        business: business || '',
        rating: Number(rating) || 5,
        comment,
        avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        featured: featured !== undefined ? Boolean(featured) : true,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
