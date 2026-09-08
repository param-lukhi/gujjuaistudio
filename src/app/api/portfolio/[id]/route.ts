import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, category, videoUrl, thumbnailUrl, duration, featured } = body;

    const item = await prisma.portfolioItem.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(category !== undefined && { category }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(duration !== undefined && { duration }),
        ...(featured !== undefined && { featured: Boolean(featured) }),
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    console.error('Error updating portfolio item:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update portfolio item' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.portfolioItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
    return NextResponse.json({ error: 'Failed to delete portfolio item' }, { status: 500 });
  }
}
