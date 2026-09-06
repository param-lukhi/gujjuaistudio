import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orderId = params.id;

    const order = await prisma.order.findFirst({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order invoice not found' }, { status: 404 });
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${order.orderNumber} - Gujju AI Studio</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; background: #f9fafb; color: #111827; }
          .invoice-box { max-width: 800px; margin: auto; padding: 40px; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e5e7eb; }
          .header { display: flex; justify-content: space-between; border-b: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 900; color: #2563eb; }
          .title { font-size: 28px; font-weight: 800; color: #1f2937; text-align: right; }
          .details { display: flex; justify-content: space-between; margin-bottom: 30px; line-height: 1.6; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #eff6ff; color: #1d4ed8; font-weight: 700; text-align: left; padding: 12px; border-bottom: 2px solid #bfdbfe; font-size: 13px; }
          td { padding: 14px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
          .total { text-align: right; font-size: 18px; font-weight: 800; color: #1e40af; }
          .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #6b7280; border-t: 1px solid #e5e7eb; padding-top: 20px; }
          .btn-print { display: inline-block; padding: 10px 20px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-bottom: 20px; }
          @media print { .btn-print { display: none; } body { padding: 0; background: #fff; } .invoice-box { box-shadow: none; border: none; } }
        </style>
      </head>
      <body>
        <div style="text-align: right; max-width: 800px; margin: auto;">
          <a href="#" onclick="window.print()" class="btn-print">🖨️ Print / Save as PDF</a>
        </div>
        <div class="invoice-box">
          <div class="header">
            <div>
              <div class="logo">Gujju AI Studio</div>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">High-Converting AI Video Reels Agency</p>
            </div>
            <div>
              <div class="title">INVOICE</div>
              <p style="margin: 4px 0 0 0; font-size: 13px; font-family: monospace; color: #4b5563;">#${order.orderNumber}</p>
            </div>
          </div>

          <div class="details">
            <div>
              <strong>Billed To:</strong><br />
              ${order.user.name || 'Client'}<br />
              ${order.user.businessName ? order.user.businessName + '<br />' : ''}
              ${order.user.email}<br />
              ${order.user.phoneNumber || ''}
            </div>
            <div style="text-align: right;">
              <strong>Invoice Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}<br />
              <strong>Payment Status:</strong> <span style="color: #059669; font-weight: bold;">${order.paymentStatus}</span><br />
              <strong>Order Status:</strong> ${order.status}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Service Description</th>
                <th>Package</th>
                <th style="text-align: right;">Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${order.serviceName || 'AI Product Reel Production'}</strong></td>
                <td>${order.packageName}</td>
                <td style="text-align: right; font-weight: bold;">₹${order.price.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          <div class="total">
            Total Paid: ₹${order.price.toLocaleString('en-IN')}
          </div>

          <div class="footer">
            Thank you for choosing Gujju AI Studio! For support inquiries, contact gujjuaistudio@gmail.com.
          </div>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Invoice generation error' }, { status: 500 });
  }
}
