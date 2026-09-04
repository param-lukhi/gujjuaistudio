import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Gujju AI Studio database with complete auth and user data...');

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const clientPassword = await bcrypt.hash('client123', 10);

  // 1. Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gujjuai.com' },
    update: {
      password: hashedPassword,
      name: 'Gujju AI Admin',
      username: 'admin',
      role: 'ADMIN',
      emailVerified: new Date(),
      isVerified: true,
    },
    create: {
      email: 'admin@gujjuai.com',
      name: 'Gujju AI Admin',
      username: 'admin',
      role: 'ADMIN',
      password: hashedPassword,
      emailVerified: new Date(),
      isVerified: true,
      phoneNumber: '+91 98765 43210',
      businessName: 'Gujju AI Studio HQ',
      bio: 'Head of Creative Engineering & AI Reel Production.',
      country: 'India',
      state: 'Gujarat',
      city: 'Ahmedabad',
      address: 'SG Highway, Bodakdev',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },
  });

  // 2. Create Demo Client User
  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {
      password: clientPassword,
      name: 'Jayesh Patel',
      username: 'jayesh_patel',
      role: 'CLIENT',
      emailVerified: new Date(),
      isVerified: true,
    },
    create: {
      email: 'client@example.com',
      name: 'Jayesh Patel',
      username: 'jayesh_patel',
      role: 'CLIENT',
      password: clientPassword,
      emailVerified: new Date(),
      isVerified: true,
      phoneNumber: '+91 98250 12345',
      businessName: 'Surat Silk Trends',
      bio: 'Founder & CEO of Surat Silk Trends. Specializing in ethnic wear and bridal sarees.',
      country: 'India',
      state: 'Gujarat',
      city: 'Surat',
      address: 'Ring Road Textile Market, Shop #402',
      website: 'https://suratsilktrends.com',
      instagram: 'https://instagram.com/suratsilktrends',
      facebook: 'https://facebook.com/suratsilktrends',
      linkedin: 'https://linkedin.com/in/jayeshpatel',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    },
  });

  // 3. Create Packages
  const packages = [
    {
      id: 'starter',
      slug: 'starter',
      name: '🥉 Starter Package',
      price: 600,
      duration: 'Up to 15 Seconds',
      revisions: '1 Revision',
      deliveryDays: 'Delivery in 2 Days',
      features: JSON.stringify([
        '1 AI Product Reel',
        'Up to 15 Seconds',
        '1 Revision',
        'Delivery in 2 Days',
        'HD 1080p Vertical Format (9:16)',
        'E-commerce Product Highlight'
      ]),
      popular: false,
    },
    {
      id: 'professional',
      slug: 'professional',
      name: '🥈 Professional Package',
      price: 1200,
      duration: 'Up to 30 Seconds Each',
      revisions: '1 Revision',
      deliveryDays: 'Delivery in 2 Days',
      features: JSON.stringify([
        '1 AI Product Reel',
        'Up to 30 Seconds Each',
        'AI Voiceover (Hindi / English / Gujarati)',
        'Commercial Use License',
        '1 Revision',
        'Delivery in 2 Days',
        '4K Crisp Vertical Reel Format'
      ]),
      popular: true,
    },
    {
      id: 'premium',
      slug: 'premium',
      name: '🥇 Premium Package',
      price: 2300,
      duration: 'Up to 60 Seconds Each',
      revisions: '1 Revision',
      deliveryDays: 'Delivery in 2 Days',
      features: JSON.stringify([
        '1 AI Product Reel',
        'Up to 60 Seconds Each',
        'AI Voiceover',
        'Background Music',
        '1 Revision',
        'Delivery in 2 Days',
        'Cinematic AI VFX & Dynamic Scripting',
        'Full Commercial Rights'
      ]),
      popular: false,
    },
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { slug: pkg.slug },
      update: pkg,
      create: pkg,
    });
  }

  // 4. Create Sample Orders for Demo Client
  const order1 = await prisma.order.upsert({
    where: { orderNumber: 'GAS-99101' },
    update: {},
    create: {
      orderNumber: 'GAS-99101',
      userId: client.id,
      serviceName: 'Saree AI Commercial Reel',
      packageName: '🥈 Professional Package',
      package: 'professional',
      price: 1200,
      status: 'IN_PROGRESS',
      paymentStatus: 'PAID',
      expectedDeliveryDate: '2026-07-28',
      downloadFiles: JSON.stringify([
        'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-golden-dress-40995-large.mp4'
      ]),
      invoiceUrl: '/api/invoices/INV-2026-001',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-golden-dress-40995-large.mp4',
    },
  });

  const order2 = await prisma.order.upsert({
    where: { orderNumber: 'GAS-99102' },
    update: {},
    create: {
      orderNumber: 'GAS-99102',
      userId: client.id,
      serviceName: 'Jewelry Promo Ad',
      packageName: '🥇 Premium Package',
      package: 'premium',
      price: 2300,
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      expectedDeliveryDate: '2026-07-20',
      downloadFiles: JSON.stringify([
        'https://assets.mixkit.co/videos/preview/mixkit-woman-holding-a-sparkling-ring-41258-large.mp4'
      ]),
      invoiceUrl: '/api/invoices/INV-2026-002',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-holding-a-sparkling-ring-41258-large.mp4',
    },
  });

  // 5. Create Sample Chat Messages for Order 1
  await prisma.chatMessage.createMany({
    data: [
      {
        orderId: order1.id,
        senderId: client.id,
        senderName: client.name || 'Jayesh Patel',
        senderRole: 'CLIENT',
        message: 'Hi Admin, I submitted the product imagery for our silk saree collection. Can we add Gujarati AI voiceover?',
        seen: true,
      },
      {
        orderId: order1.id,
        senderId: admin.id,
        senderName: admin.name || 'Gujju AI Admin',
        senderRole: 'ADMIN',
        message: 'Hello Jayesh! Yes, absolutely. We have queued the Gujarati AI voice model with traditional background music.',
        seen: true,
      },
      {
        orderId: order1.id,
        senderId: client.id,
        senderName: client.name || 'Jayesh Patel',
        senderRole: 'CLIENT',
        message: 'Sounds fantastic! What is the estimated delivery timeframe?',
        seen: false,
      },
    ],
  });

  // 6. Create Admin Replies
  await prisma.adminReply.create({
    data: {
      userId: client.id,
      subject: 'Re: AI Voiceover Customization for Order #GAS-99101',
      message: 'Greetings Jayesh! Your AI reel draft is currently undergoing rendering. The preview link will be posted in your order chat within 24 hours.',
      read: false,
    },
  });

  // 7. Create Notifications for Client
  await prisma.notification.createMany({
    data: [
      {
        userId: client.id,
        title: 'Order Confirmed',
        message: 'Your order #GAS-99101 (Saree AI Commercial Reel) has been accepted and is in progress.',
        type: 'ORDER_ACCEPTED',
        link: '/dashboard/orders',
        read: false,
      },
      {
        userId: client.id,
        title: 'Payment Received',
        message: 'Payment of ₹1,200 for order #GAS-99101 was successfully verified.',
        type: 'PAYMENT',
        link: '/dashboard/orders',
        read: true,
      },
      {
        userId: client.id,
        title: 'Admin Message Reply',
        message: 'Gujju AI Support replied to your query regarding voiceover settings.',
        type: 'ADMIN_REPLY',
        link: '/dashboard/replies',
        read: false,
      },
    ],
  });

  // 8. Create Saved Services
  await prisma.savedService.create({
    data: {
      userId: client.id,
      packageId: 'professional',
      serviceName: '🥈 Professional Package (30s AI Reel)',
      description: 'Up to 30 Seconds, AI Voiceover, 4K Quality.',
      price: 1200,
    },
  });

  // 9. Portfolio Items
  const portfolioItems = [
    {
      title: 'Luxury Silk Saree AI Showcase',
      category: 'Fashion',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-golden-dress-40995-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      duration: '30s',
      featured: true,
      views: 1420,
    },
    {
      title: 'Modern Urban Streetwear Commercial',
      category: 'Clothing',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-modelling-in-a-studio-41549-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      duration: '15s',
      featured: true,
      views: 980,
    },
    {
      title: 'Royal Diamond Necklace Dynamic Reel',
      category: 'Jewelry',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-holding-a-sparkling-ring-41258-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      duration: '30s',
      featured: true,
      views: 2150,
    },
  ];

  await prisma.portfolioItem.deleteMany({});
  for (const item of portfolioItems) {
    await prisma.portfolioItem.create({ data: item });
  }

  // 10. Sample Testimonials
  const reviews = [
    {
      clientName: 'Rahul Patel',
      business: 'Surat Silk Prints',
      rating: 5,
      comment: 'Gujju AI Studio delivered a 30s product reel that generated 4.2k orders on Instagram in just 5 days! The AI voiceover in Hindi was spot on.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      featured: true,
    },
    {
      clientName: 'Priya Sharma',
      business: 'Aura Glow Cosmetics',
      rating: 5,
      comment: 'The quality of the AI generated model and lighting for our serum was mindblowing. Stopped the scroll instantly for our Meta Ads!',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      featured: true,
    },
  ];

  await prisma.review.deleteMany({});
  for (const r of reviews) {
    await prisma.review.create({ data: r });
  }

  console.log('✅ Database seeded successfully with demo accounts:');
  console.log(' - Admin: admin@gujjuai.com / admin123');
  console.log(' - Client: client@example.com / client123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
