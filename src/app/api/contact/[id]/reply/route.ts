import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/mailer';
import { randomUUID } from 'crypto';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { replyText, sendEmailNotification = true } = body;

    if (!replyText || !replyText.trim()) {
      return NextResponse.json({ error: 'Reply message cannot be empty' }, { status: 400 });
    }

    const message = await prisma.contactMessage.findUnique({
      where: { id: params.id },
    });

    if (!message) {
      return NextResponse.json({ error: 'Message inquiry not found' }, { status: 404 });
    }

    // Parse existing replies thread
    let existingReplies: any[] = [];
    try {
      if (message.replies) {
        existingReplies = JSON.parse(message.replies);
        if (!Array.isArray(existingReplies)) existingReplies = [];
      }
    } catch {
      existingReplies = [];
    }

    const newReplyItem = {
      id: randomUUID(),
      sender: 'ADMIN',
      senderName: 'Gujju AI Studio Support',
      text: replyText.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedReplies = [...existingReplies, newReplyItem];

    // Update message in database
    const updated = await prisma.contactMessage.update({
      where: { id: params.id },
      data: {
        status: 'REPLIED',
        replyText: replyText.trim(),
        replies: JSON.stringify(updatedReplies),
      },
    });

    // Send email to user if email is valid and flag is true
    if (sendEmailNotification && message.email && message.email.includes('@')) {
      try {
        const subject = `Re: ${message.subject || 'Your Inquiry with Gujju AI Studio'}`;
        const html = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0B0F19; color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #1f293d;">
            <div style="background: linear-gradient(135deg, #2563eb, #06b6d4); padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">Gujju AI Studio</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0 0; font-size: 13px;">Official Support Reply</p>
            </div>
            
            <div style="padding: 28px; line-height: 1.6;">
              <p style="font-size: 15px; color: #94a3b8; margin-top: 0;">Hi <strong style="color: #ffffff;">${message.name}</strong>,</p>
              
              <p style="font-size: 14px; color: #cbd5e1;">Our team has reviewed your message regarding <strong style="color: #38bdf8;">"${message.subject || 'General Inquiry'}"</strong>:</p>
              
              <div style="background: #131b2e; border-left: 4px solid #38bdf8; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <p style="color: #f8fafc; font-size: 14px; margin: 0; white-space: pre-wrap;">${replyText.trim()}</p>
              </div>

              <div style="margin-top: 24px; padding: 16px; background: rgba(37, 211, 102, 0.08); border: 1px solid rgba(37, 211, 102, 0.25); border-radius: 12px; text-align: center;">
                <p style="font-size: 12px; color: #cbd5e1; margin: 0 0 10px 0;">Need instant real-time assistance or want to send product photos?</p>
                <a href="https://wa.me/919925263558?text=${encodeURIComponent(`Hi Gujju AI Studio, this is ${message.name} continuing my inquiry.`)}" style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 13px; padding: 10px 20px; border-radius: 10px;">
                  Continue on WhatsApp →
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;" />
              
              <div style="color: #64748b; font-size: 12px;">
                <p style="margin: 0 0 4px 0;"><strong>Original Inquiry Message:</strong></p>
                <p style="margin: 0; font-style: italic;">"${message.message}"</p>
              </div>
            </div>

            <div style="background: #070a12; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b;">
              © ${new Date().getFullYear()} Gujju AI Studio • High-Converting AI Product Ads
            </div>
          </div>
        `;

        await sendEmail({
          to: message.email,
          subject,
          html,
          text: `Hi ${message.name},\n\n${replyText.trim()}\n\n---\nOriginal Message: ${message.message}\n\nGujju AI Studio Team\nWhatsApp: +91 99252 63558`,
        });
      } catch (emailErr) {
        console.error('Failed to send reply email:', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: updated,
      reply: newReplyItem,
    });
  } catch (error) {
    console.error('Error in reply endpoint:', error);
    return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 });
  }
}
