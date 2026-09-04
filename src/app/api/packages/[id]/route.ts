import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pkg = await prisma.package.findUnique({
      where: { id: params.id },
    });

    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    return NextResponse.json(pkg);
  } catch (error) {
    console.error('Error fetching package:', error);
    return NextResponse.json({ error: 'Failed to fetch package' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, slug, price, duration, revisions, deliveryDays, features, popular } = body;

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (slug !== undefined) dataToUpdate.slug = slug;
    if (price !== undefined) dataToUpdate.price = Number(price);
    if (duration !== undefined) dataToUpdate.duration = duration;
    if (revisions !== undefined) dataToUpdate.revisions = revisions;
    if (deliveryDays !== undefined) dataToUpdate.deliveryDays = deliveryDays;
    if (features !== undefined) {
      dataToUpdate.features = typeof features === 'string' ? features : JSON.stringify(features);
    }
    if (popular !== undefined) dataToUpdate.popular = Boolean(popular);

    const updatedPkg = await prisma.package.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, package: updatedPkg });
  } catch (error) {
    console.error('Error updating package:', error);
    return NextResponse.json({ error: 'Failed to update package' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.package.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Package deleted successfully' });
  } catch (error) {
    console.error('Error deleting package:', error);
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 });
  }
}
