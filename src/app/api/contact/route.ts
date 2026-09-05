import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (id) {
      const msg = await prisma.contactMessage.findUnique({
        where: { id },
      });
      return NextResponse.json(msg);
    }

    if (email) {
      const messages = await prisma.contactMessage.findMany({
        where: { email },
        orderBy: { updatedAt: 'desc' },
      });
      return NextResponse.json(messages);
    }

    const messages = await prisma.contactMessage.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if there is an existing conversation thread for this user email
    const existingThread = await prisma.contactMessage.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
      orderBy: { createdAt: 'desc' },
    });

    if (existingThread) {
      let existingReplies: any[] = [];
      try {
        if (existingThread.replies) {
          existingReplies = JSON.parse(existingThread.replies);
          if (!Array.isArray(existingReplies)) existingReplies = [];
        }
      } catch {
        existingReplies = [];
      }

      // Append new message from user into the thread
      const newUserMsg = {
        id: randomUUID(),
        sender: 'USER',
        senderName: name,
        subject: subject || existingThread.subject || 'General Inquiry',
        text: message.trim(),
        createdAt: new Date().toISOString(),
      };

      const updatedReplies = [...existingReplies, newUserMsg];

      const updated = await prisma.contactMessage.update({
        where: { id: existingThread.id },
        data: {
          name: name || existingThread.name,
          subject: subject || existingThread.subject,
          status: 'UNREAD',
          replies: JSON.stringify(updatedReplies),
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, message: updated, isThreaded: true });
    }

    // Otherwise create a fresh thread with initial user message
    const initialUserMsg = {
      id: randomUUID(),
      sender: 'USER',
      senderName: name,
      subject: subject || 'General Inquiry',
      text: message.trim(),
      createdAt: new Date().toISOString(),
    };

    const newThread = await prisma.contactMessage.create({
      data: {
        name,
        email: normalizedEmail,
        subject: subject || 'General Inquiry',
        message: message.trim(),
        status: 'UNREAD',
        replies: JSON.stringify([initialUserMsg]),
      },
    });

    return NextResponse.json({ success: true, message: newThread });
  } catch (error) {
    console.error('Error in contact POST:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

