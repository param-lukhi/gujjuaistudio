import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const DEFAULT_HERO_DATA = {
  id: 'hero-main',
  
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

export async function GET() {
  try {
    const hero = await prisma.heroShowcase.findUnique({
      where: { id: 'hero-main' },
    });

    if (!hero) {
      return NextResponse.json(DEFAULT_HERO_DATA);
    }

    return NextResponse.json({ ...DEFAULT_HERO_DATA, ...hero });
  } catch (error) {
    console.error('Failed to fetch Hero showcase:', error);
    return NextResponse.json(DEFAULT_HERO_DATA);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const dataToSave = {
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

    const hero = await prisma.heroShowcase.upsert({
      where: { id: 'hero-main' },
      update: dataToSave,
      create: {
        id: 'hero-main',
        ...dataToSave,
      },
    });

    return NextResponse.json({ success: true, hero });
  } catch (error) {
    console.error('Failed to update Hero showcase:', error);
    return NextResponse.json({ error: 'Failed to update hero showcase' }, { status: 500 });
  }
}
