import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const DEFAULT_HERO_DATA = {
  // Left Hero Copy
  heroTopPill: 'Next-Gen AI Product Video Ads • Fast 2-Day Delivery',
  heroHeadlineMain: 'AI Product Ads That',
  heroHeadlineGradient: 'Stop the Scroll.',
  heroSubheadline: 'Transform simple product photos into viral, high-converting vertical video reels. Powered by hyper-realistic AI models, cinematic voiceovers, and dynamic visual effects.',
  heroCtaText: 'Book Your AI Reel Now',
  heroCtaLink: '/book',
  heroSecondaryText: 'Watch Portfolio',
  heroSecondaryLink: '/portfolio',
  
  // Key Stats Counters
  stat1Value: '2 Days',
  stat1Label: 'Guaranteed Delivery',
  stat2Value: '₹600',
  stat2Label: 'Starter Packages',
  stat3Value: '10x CTR',
  stat3Label: 'Instagram Boost',
  trustText: '4.9/5 by 150+ Brands',

  // 9:16 Video Reel Card
  badgeText: 'AI Reel Demo',
  durationText: '00:30',
  category: 'Fashion & Luxury',
  title: 'Luxury Silk Saree AI Showcase',
  description: 'Generated purely from 2 flat product photos. Complete with AI lighting & model animation.',
  videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-golden-dress-40995-large.mp4',
  thumbnailUrl: '',
  buttonText: 'View All 7 Categories',
  buttonLink: '/portfolio',

  // Floating Badge 1 (Top-Left)
  floatingBadge1Title: 'Commercial Rights',
  floatingBadge1Sub: '100% Monetization',
  floatingBadge1Icon: 'check',
  floatingBadge1Color: 'emerald',

  // Floating Badge 2 (Bottom-Right)
  floatingBadge2Title: 'AI Voiceover',
  floatingBadge2Sub: 'Hindi & English',
  floatingBadge2Icon: 'zap',
  floatingBadge2Color: 'brand',
};

// GET: Fetch Active Showcase or All Showcases (CRUD Read)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const getAll = searchParams.get('all') === 'true' || searchParams.get('mode') === 'list';
    const singleId = searchParams.get('id');

    // 1. Fetch by Specific ID
    if (singleId) {
      const item = await prisma.heroShowcase.findUnique({
        where: { id: singleId },
      });
      if (item) return NextResponse.json(item);
      return NextResponse.json({ error: 'Hero showcase not found' }, { status: 404 });
    }

    // 2. Fetch All for Admin CRUD Management
    if (getAll) {
      let items = await prisma.heroShowcase.findMany({
        orderBy: [{ isActive: 'desc' }, { updatedAt: 'desc' }],
      });

      // If database is completely empty, seed initial hero item
      if (items.length === 0) {
        const initial = await prisma.heroShowcase.create({
          data: {
            ...DEFAULT_HERO_DATA,
            isActive: true,
          },
        });
        items = [initial];
      }

      return NextResponse.json({ success: true, showcases: items });
    }

    // 3. Fetch Active Hero Showcase for Live Homepage
    let activeHero = await prisma.heroShowcase.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (!activeHero) {
      activeHero = await prisma.heroShowcase.findFirst({
        orderBy: { updatedAt: 'desc' },
      });
    }

    if (!activeHero) {
      activeHero = await prisma.heroShowcase.create({
        data: {
          ...DEFAULT_HERO_DATA,
          isActive: true,
        },
      });
    }

    return NextResponse.json(activeHero);
  } catch (error: any) {
    console.error('Failed to fetch Hero showcase:', error);
    return NextResponse.json({ ...DEFAULT_HERO_DATA, id: 'default' });
  }
}

// POST: Create New Hero Showcase or Update Existing (CRUD Create / Upsert)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const shouldBeActive = body.isActive !== undefined ? Boolean(body.isActive) : true;

    // If activating, deactivate all other showcases
    if (shouldBeActive) {
      await prisma.heroShowcase.updateMany({
        data: { isActive: false },
      });
    }

    const payload = {
      isActive: shouldBeActive,
      
      // Left Hero Copy
      heroTopPill: body.heroTopPill ?? DEFAULT_HERO_DATA.heroTopPill,
      heroHeadlineMain: body.heroHeadlineMain ?? DEFAULT_HERO_DATA.heroHeadlineMain,
      heroHeadlineGradient: body.heroHeadlineGradient ?? DEFAULT_HERO_DATA.heroHeadlineGradient,
      heroSubheadline: body.heroSubheadline ?? DEFAULT_HERO_DATA.heroSubheadline,
      heroCtaText: body.heroCtaText ?? DEFAULT_HERO_DATA.heroCtaText,
      heroCtaLink: body.heroCtaLink ?? DEFAULT_HERO_DATA.heroCtaLink,
      heroSecondaryText: body.heroSecondaryText ?? DEFAULT_HERO_DATA.heroSecondaryText,
      heroSecondaryLink: body.heroSecondaryLink ?? DEFAULT_HERO_DATA.heroSecondaryLink,
      
      // Key Stats Counters
      stat1Value: body.stat1Value ?? DEFAULT_HERO_DATA.stat1Value,
      stat1Label: body.stat1Label ?? DEFAULT_HERO_DATA.stat1Label,
      stat2Value: body.stat2Value ?? DEFAULT_HERO_DATA.stat2Value,
      stat2Label: body.stat2Label ?? DEFAULT_HERO_DATA.stat2Label,
      stat3Value: body.stat3Value ?? DEFAULT_HERO_DATA.stat3Value,
      stat3Label: body.stat3Label ?? DEFAULT_HERO_DATA.stat3Label,
      trustText: body.trustText ?? DEFAULT_HERO_DATA.trustText,

      // 9:16 Video Reel Card
      badgeText: body.badgeText ?? DEFAULT_HERO_DATA.badgeText,
      durationText: body.durationText ?? DEFAULT_HERO_DATA.durationText,
      category: body.category ?? DEFAULT_HERO_DATA.category,
      title: body.title ?? DEFAULT_HERO_DATA.title,
      description: body.description ?? DEFAULT_HERO_DATA.description,
      videoUrl: body.videoUrl ?? DEFAULT_HERO_DATA.videoUrl,
      thumbnailUrl: body.thumbnailUrl ?? null,
      buttonText: body.buttonText ?? DEFAULT_HERO_DATA.buttonText,
      buttonLink: body.buttonLink ?? DEFAULT_HERO_DATA.buttonLink,

      // Floating Badge 1
      floatingBadge1Title: body.floatingBadge1Title ?? DEFAULT_HERO_DATA.floatingBadge1Title,
      floatingBadge1Sub: body.floatingBadge1Sub ?? DEFAULT_HERO_DATA.floatingBadge1Sub,
      floatingBadge1Icon: body.floatingBadge1Icon ?? DEFAULT_HERO_DATA.floatingBadge1Icon,
      floatingBadge1Color: body.floatingBadge1Color ?? DEFAULT_HERO_DATA.floatingBadge1Color,

      // Floating Badge 2
      floatingBadge2Title: body.floatingBadge2Title ?? DEFAULT_HERO_DATA.floatingBadge2Title,
      floatingBadge2Sub: body.floatingBadge2Sub ?? DEFAULT_HERO_DATA.floatingBadge2Sub,
      floatingBadge2Icon: body.floatingBadge2Icon ?? DEFAULT_HERO_DATA.floatingBadge2Icon,
      floatingBadge2Color: body.floatingBadge2Color ?? DEFAULT_HERO_DATA.floatingBadge2Color,
    };

    let hero;
    if (body.id) {
      hero = await prisma.heroShowcase.upsert({
        where: { id: body.id },
        update: payload,
        create: { id: body.id, ...payload },
      });
    } else {
      hero = await prisma.heroShowcase.create({
        data: payload,
      });
    }

    return NextResponse.json({ success: true, hero });
  } catch (error: any) {
    console.error('Failed to create/update Hero showcase:', error);
    return NextResponse.json({ error: error?.message || 'Failed to save hero showcase' }, { status: 500 });
  }
}

// PUT: Set Active or Update Showcase by ID (CRUD Update / Activate)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action } = body;

    if (!id) {
      return NextResponse.json({ error: 'Hero ID is required' }, { status: 400 });
    }

    // 1. Action: Activate this showcase for live homepage
    if (action === 'activate' || body.isActive === true) {
      await prisma.heroShowcase.updateMany({
        data: { isActive: false },
      });

      const activated = await prisma.heroShowcase.update({
        where: { id },
        data: { isActive: true },
      });

      return NextResponse.json({ success: true, hero: activated, message: 'Hero showcase activated!' });
    }

    // 2. Action: Duplicate / Clone Showcase
    if (action === 'duplicate') {
      const existing = await prisma.heroShowcase.findUnique({ where: { id } });
      if (!existing) return NextResponse.json({ error: 'Showcase not found' }, { status: 404 });

      const { id: _, createdAt: __, updatedAt: ___, ...copyData } = existing;
      const duplicated = await prisma.heroShowcase.create({
        data: {
          ...copyData,
          title: `${existing.title} (Copy)`,
          isActive: false,
        },
      });

      return NextResponse.json({ success: true, hero: duplicated });
    }

    // 3. Regular Update
    const updated = await prisma.heroShowcase.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ success: true, hero: updated });
  } catch (error: any) {
    console.error('Failed to update Hero showcase:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update hero showcase' }, { status: 500 });
  }
}

// DELETE: Delete Showcase by ID (CRUD Delete)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Hero ID is required' }, { status: 400 });
    }

    const totalCount = await prisma.heroShowcase.count();
    if (totalCount <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete the only hero showcase. Create another one first.' },
        { status: 400 }
      );
    }

    const target = await prisma.heroShowcase.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: 'Hero showcase not found' }, { status: 404 });
    }

    await prisma.heroShowcase.delete({ where: { id } });

    // If deleted hero was the active one, auto-activate the most recent remaining showcase
    if (target.isActive) {
      const nextActive = await prisma.heroShowcase.findFirst({
        orderBy: { updatedAt: 'desc' },
      });
      if (nextActive) {
        await prisma.heroShowcase.update({
          where: { id: nextActive.id },
          data: { isActive: true },
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Hero showcase deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete Hero showcase:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete hero showcase' }, { status: 500 });
  }
}
