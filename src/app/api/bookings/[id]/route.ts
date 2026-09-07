import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status, finalVideoUrl, notes, bookingDate, bookingTime, paymentStatus, paymentRef, paymentProof, paymentMethod } = body;

    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const isAdmin = session.user.role === 'ADMIN';
    const isOwner =
      existingBooking.userId === session.user.id ||
      existingBooking.clientEmail?.toLowerCase() === session.user.email?.toLowerCase();

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Access denied: You cannot modify this booking.' }, { status: 403 });
    }

    // Client modifications (Reschedule, Cancel, or Submit Payment)
    if (!isAdmin) {
      const allowedData: any = {};

      if (status === 'CANCELLED') {
        if (existingBooking.status === 'COMPLETED') {
          return NextResponse.json({ error: 'Completed bookings cannot be cancelled.' }, { status: 400 });
        }
        allowedData.status = 'CANCELLED';
      }

      if (bookingDate && bookingTime) {
        if (existingBooking.status === 'CANCELLED' || existingBooking.status === 'COMPLETED') {
          return NextResponse.json({ error: 'Cannot reschedule cancelled or completed bookings.' }, { status: 400 });
        }
        allowedData.bookingDate = bookingDate;
        allowedData.bookingTime = bookingTime;
      }

      if (paymentRef || paymentProof) {
        allowedData.paymentRef = paymentRef || existingBooking.paymentRef;
        allowedData.paymentProof = paymentProof || existingBooking.paymentProof;
        allowedData.paymentMethod = paymentMethod || existingBooking.paymentMethod;
        allowedData.paymentStatus = 'PENDING_VERIFICATION';
      }

      const updated = await prisma.booking.update({
        where: { id },
        data: allowedData,
      });

      return NextResponse.json({ success: true, booking: updated });
    }

    // Admin modifications (Full control)
    const {
      targetPlatforms,
      deliveryPlatform,
      deliveryPlatformOther,
      videoFormat,
      videoStyle,
      videoStyleCustom,
      deliveryRequirement,
      additionalInstructions,
    } = body;

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(finalVideoUrl !== undefined && { finalVideoUrl }),
        ...(notes !== undefined && { notes }),
        ...(bookingDate && { bookingDate }),
        ...(bookingTime && { bookingTime }),
        ...(paymentStatus && { paymentStatus }),
        ...(paymentRef !== undefined && { paymentRef }),
        ...(paymentProof !== undefined && { paymentProof }),
        ...(paymentMethod && { paymentMethod }),
        ...(targetPlatforms !== undefined && {
          targetPlatforms: typeof targetPlatforms === 'string' ? targetPlatforms : JSON.stringify(targetPlatforms),
        }),
        ...(deliveryPlatform !== undefined && { deliveryPlatform }),
        ...(deliveryPlatformOther !== undefined && { deliveryPlatformOther }),
        ...(videoFormat !== undefined && { videoFormat }),
        ...(videoStyle !== undefined && { videoStyle }),
        ...(videoStyleCustom !== undefined && { videoStyleCustom }),
        ...(deliveryRequirement !== undefined && { deliveryRequirement }),
        ...(additionalInstructions !== undefined && { additionalInstructions }),
      },
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
    }

    const { id } = params;
    await prisma.booking.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}
