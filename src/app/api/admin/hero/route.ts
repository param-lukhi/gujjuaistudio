import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const DEFAULT_HERO_DATA = {
  id: 'hero-main',
  badgeText: 'AI Reel Demo',
  durationText: '00:30',
  category: 'Fashion & Luxury',
  title: 'Luxury Silk Saree AI Showcase',
  description: 'Generated purely from 2 flat product photos. Complete with AI lighting & model animation.',
  videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-golden-dress-40995-large.mp4',
  thumbnailUrl: '',
  buttonText: 'View All 7 Categories',
  buttonLink: '/portfolio',
  floatingBadge1Title: 'Commercial Rights',
  floatingBadge1Sub: '100% Monetization',
  floatingBadge2Title: 'AI Voiceover',
  floatingBadge2Sub: 'Hindi & English',
};

export async function GET() {
  try {
    const hero = await prisma.heroShowcase.findUnique({
      where: { id: 'hero-main' },
    });

    if (!hero) {
      return NextResponse.json(DEFAULT_HERO_DATA);
    }

    return NextResponse.json(hero);
  } catch (error) {
    console.error('Failed to fetch Hero showcase:', error);
    return NextResponse.json(DEFAULT_HERO_DATA);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const hero = await prisma.heroShowcase.upsert({
      where: { id: 'hero-main' },
      update: {
        badgeText: body.badgeText || DEFAULT_HERO_DATA.badgeText,
        durationText: body.durationText || DEFAULT_HERO_DATA.durationText,
        category: body.category || DEFAULT_HERO_DATA.category,
        title: body.title || DEFAULT_HERO_DATA.title,
        description: body.description || DEFAULT_HERO_DATA.description,
        videoUrl: body.videoUrl || DEFAULT_HERO_DATA.videoUrl,
        thumbnailUrl: body.thumbnailUrl || null,
        buttonText: body.buttonText || DEFAULT_HERO_DATA.buttonText,
        buttonLink: body.buttonLink || DEFAULT_HERO_DATA.buttonLink,
        floatingBadge1Title: body.floatingBadge1Title || DEFAULT_HERO_DATA.floatingBadge1Title,
        floatingBadge1Sub: body.floatingBadge1Sub || DEFAULT_HERO_DATA.floatingBadge1Sub,
        floatingBadge2Title: body.floatingBadge2Title || DEFAULT_HERO_DATA.floatingBadge2Title,
        floatingBadge2Sub: body.floatingBadge2Sub || DEFAULT_HERO_DATA.floatingBadge2Sub,
      },
      create: {
        id: 'hero-main',
        badgeText: body.badgeText || DEFAULT_HERO_DATA.badgeText,
        durationText: body.durationText || DEFAULT_HERO_DATA.durationText,
        category: body.category || DEFAULT_HERO_DATA.category,
        title: body.title || DEFAULT_HERO_DATA.title,
        description: body.description || DEFAULT_HERO_DATA.description,
        videoUrl: body.videoUrl || DEFAULT_HERO_DATA.videoUrl,
        thumbnailUrl: body.thumbnailUrl || null,
        buttonText: body.buttonText || DEFAULT_HERO_DATA.buttonText,
        buttonLink: body.buttonLink || DEFAULT_HERO_DATA.buttonLink,
        floatingBadge1Title: body.floatingBadge1Title || DEFAULT_HERO_DATA.floatingBadge1Title,
        floatingBadge1Sub: body.floatingBadge1Sub || DEFAULT_HERO_DATA.floatingBadge1Sub,
        floatingBadge2Title: body.floatingBadge2Title || DEFAULT_HERO_DATA.floatingBadge2Title,
        floatingBadge2Sub: body.floatingBadge2Sub || DEFAULT_HERO_DATA.floatingBadge2Sub,
      },
    });

    return NextResponse.json({ success: true, hero });
  } catch (error) {
    console.error('Failed to update Hero showcase:', error);
    return NextResponse.json({ error: 'Failed to update hero showcase' }, { status: 500 });
  }
}
