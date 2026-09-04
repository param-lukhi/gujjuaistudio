import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { clientName, business, rating, comment, avatarUrl, featured } = body;

    const data: any = {};
    if (clientName !== undefined) data.clientName = clientName;
    if (business !== undefined) data.business = business;
    if (rating !== undefined) data.rating = Number(rating);
    if (comment !== undefined) data.comment = comment;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;
    if (featured !== undefined) data.featured = Boolean(featured);

    const updated = await prisma.review.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ success: true, review: updated });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.review.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
