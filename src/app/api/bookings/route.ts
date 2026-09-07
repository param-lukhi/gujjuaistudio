import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateBookingRef } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Admin Access: Can view all bookings
    if (session.user.role === 'ADMIN') {
      const whereClause: any = {};

      if (status && status !== 'ALL') {
        whereClause.status = status;
      }

      if (search) {
        whereClause.OR = [
          { bookingRef: { contains: search } },
          { clientName: { contains: search } },
          { clientEmail: { contains: search } },
          { businessName: { contains: search } },
        ];
      }

      const bookings = await prisma.booking.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(bookings);
    }

    // Client Access: Strictly isolated to own bookings only
    const userEmail = session.user.email?.toLowerCase().trim();
    const userId = session.user.id;

    const whereClause: any = {
      OR: [
        ...(userId ? [{ userId }] : []),
        ...(userEmail ? [{ clientEmail: userEmail }] : []),
      ],
    };

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required to book a service.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      clientName,
      businessName,
      clientEmail,
      clientPhone,
      packageId,
      packageName,
      price,
      description,
      refLink,
      imageUrls,
      bookingDate,
      bookingTime,
      paymentStatus,
      paymentRef,
      paymentProof,
      paymentMethod,
    } = body;

    const name = clientName || session.user.name || 'Client';
    const email = (clientEmail || session.user.email || '').toLowerCase().trim();
    const phone = clientPhone || session.user.phoneNumber || '';

    if (!description || !bookingDate || !bookingTime) {
      return NextResponse.json(
        { error: 'Service description, booking date, and time slot are required.' },
        { status: 400 }
      );
    }

    const bookingRef = generateBookingRef();

    const booking = await prisma.booking.create({
      data: {
        bookingRef,
        userId: session.user.id || null,
        clientName: name,
        businessName: businessName || session.user.businessName || name,
        clientEmail: email,
        clientPhone: phone,
        packageId: packageId || 'professional',
        packageName: packageName || '🥈 Professional Package',
        price: Number(price) || 1200,
        description,
        refLink: refLink || null,
        imageUrls: JSON.stringify(imageUrls || []),
        bookingDate,
        bookingTime,
        status: 'PENDING',
        paymentStatus: paymentStatus || (paymentRef ? 'PENDING_VERIFICATION' : 'UNPAID'),
        paymentRef: paymentRef || null,
        paymentProof: paymentProof || null,
        paymentMethod: paymentMethod || 'UPI',
      },
    });

    // Create confirmation notification for user
    if (session.user.id) {
      try {
        const isPaid = paymentStatus === 'PAID' || paymentStatus === 'PENDING_VERIFICATION';
        await prisma.notification.create({
          data: {
            userId: session.user.id,
            title: isPaid ? 'Booking & Payment Submitted' : 'Booking Received',
            message: isPaid 
              ? `Your booking for "${booking.packageName}" (Ref: ${bookingRef}) with UPI UTR: ${paymentRef || 'Submitted'} is under verification.`
              : `Your booking for "${booking.packageName}" on ${bookingDate} (${bookingTime}) is under review.`,
            type: isPaid ? 'PAYMENT' : 'INFO',
            link: '/dashboard/bookings',
          },
        });
      } catch (err) {
        console.error('Notification error:', err);
      }
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to submit booking' }, { status: 500 });
  }
}
