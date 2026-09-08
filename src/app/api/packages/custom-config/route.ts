import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export interface CustomPricingConfig {
  baseReelPrice: number;
  additionalReelPrice: number;
  urgentDeliveryPrice: number;
  duration15Price: number;
  duration30Price: number;
  duration60Price: number;
  revision1Price: number;
  revision2Price: number;
  revisionUnlimitedPrice: number;
}

const DEFAULT_CONFIG: CustomPricingConfig = {
  baseReelPrice: 1000,
  additionalReelPrice: 600,
  urgentDeliveryPrice: 100, // Default Express / Early delivery charge (editable by Admin)
  duration15Price: 0,
  duration30Price: 200,
  duration60Price: 500,
  revision1Price: 0,
  revision2Price: 300,
  revisionUnlimitedPrice: 800,
};

const CONFIG_SLUG = 'custom-package-pricing-config';

export async function GET() {
  try {
    const pkg = await prisma.package.findUnique({
      where: { slug: CONFIG_SLUG },
    });

    if (!pkg || !pkg.features) {
      return NextResponse.json(DEFAULT_CONFIG);
    }

    try {
      const parsed = JSON.parse(pkg.features);
      return NextResponse.json({
        ...DEFAULT_CONFIG,
        ...parsed,
      });
    } catch {
      return NextResponse.json(DEFAULT_CONFIG);
    }
  } catch (error) {
    console.error('Error fetching custom package config:', error);
    return NextResponse.json(DEFAULT_CONFIG);
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const config: CustomPricingConfig = {
      baseReelPrice: Number(body.baseReelPrice) || DEFAULT_CONFIG.baseReelPrice,
      additionalReelPrice: Number(body.additionalReelPrice) || DEFAULT_CONFIG.additionalReelPrice,
      urgentDeliveryPrice: Number(body.urgentDeliveryPrice) ?? DEFAULT_CONFIG.urgentDeliveryPrice,
      duration15Price: Number(body.duration15Price) || 0,
      duration30Price: Number(body.duration30Price) || DEFAULT_CONFIG.duration30Price,
      duration60Price: Number(body.duration60Price) || DEFAULT_CONFIG.duration60Price,
      revision1Price: Number(body.revision1Price) || 0,
      revision2Price: Number(body.revision2Price) || DEFAULT_CONFIG.revision2Price,
      revisionUnlimitedPrice: Number(body.revisionUnlimitedPrice) || DEFAULT_CONFIG.revisionUnlimitedPrice,
    };

    const updated = await prisma.package.upsert({
      where: { slug: CONFIG_SLUG },
      create: {
        name: 'Custom Package Pricing Settings',
        slug: CONFIG_SLUG,
        price: config.baseReelPrice,
        duration: 'Custom',
        revisions: 'Custom',
        deliveryDays: 'Custom',
        features: JSON.stringify(config),
        popular: false,
      },
      update: {
        price: config.baseReelPrice,
        features: JSON.stringify(config),
      },
    });

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    console.error('Error saving custom package config:', error);
    return NextResponse.json({ error: error?.message || 'Failed to save config' }, { status: 500 });
  }
}
