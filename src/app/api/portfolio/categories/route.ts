import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DEFAULT_CATEGORIES } from '@/lib/portfolioData';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const CONFIG_SLUG = 'portfolio-categories-config';
const LOCAL_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'categories.json');

// Helper to read local file safely
function readLocalCategories(): string[] {
  try {
    if (fs.existsSync(LOCAL_FILE_PATH)) {
      const data = fs.readFileSync(LOCAL_FILE_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((c): c is string => typeof c === 'string' && c.trim().length > 0);
      }
    }
  } catch (err) {
    console.warn('Could not read local categories.json:', err);
  }
  return DEFAULT_CATEGORIES;
}

// Helper to write local file safely
function writeLocalCategories(categories: string[]) {
  try {
    const dir = path.dirname(LOCAL_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_FILE_PATH, JSON.stringify(categories, null, 2), 'utf8');
  } catch (err) {
    console.warn('Could not write local categories.json:', err);
  }
}

// GET: Fetch all active categories
export async function GET() {
  try {
    // 1. Try reading from Database
    try {
      const pkg = await prisma.package.findUnique({
        where: { slug: CONFIG_SLUG },
      });

      if (pkg?.features) {
        const parsed = JSON.parse(pkg.features);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter((c): c is string => typeof c === 'string' && c.trim().length > 0);
          return NextResponse.json({ categories: valid });
        }
      }
    } catch (dbErr) {
      console.warn('DB read for categories failed, falling back to local storage:', dbErr);
    }

    // 2. Fallback to local json file
    const localCats = readLocalCategories();
    return NextResponse.json({ categories: localCats });
  } catch (err: any) {
    console.error('Error in GET /api/portfolio/categories:', err);
    return NextResponse.json({ categories: DEFAULT_CATEGORIES });
  }
}

// POST: Add a new category or update categories list
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let currentCats = readLocalCategories();

    // Try reading current from DB first
    try {
      const pkg = await prisma.package.findUnique({ where: { slug: CONFIG_SLUG } });
      if (pkg?.features) {
        const parsed = JSON.parse(pkg.features);
        if (Array.isArray(parsed) && parsed.length > 0) {
          currentCats = parsed;
        }
      }
    } catch (e) {
      // ignore db error
    }

    // Action: Reset to defaults
    if (body.action === 'reset') {
      currentCats = [...DEFAULT_CATEGORIES];
    } 
    // Action: Bulk update or reorder
    else if (Array.isArray(body.categories)) {
      currentCats = body.categories
        .filter((c: any) => typeof c === 'string' && c.trim().length > 0)
        .map((c: string) => c.trim());
    } 
    // Action: Add single category
    else {
      const name = (body.name || body.category || '').trim();
      if (!name) {
        return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
      }

      if (name.length > 50) {
        return NextResponse.json({ error: 'Category name must be under 50 characters' }, { status: 400 });
      }

      // Check if already exists (case-insensitive)
      const exists = currentCats.some(c => c.toLowerCase() === name.toLowerCase());
      if (exists) {
        return NextResponse.json({ error: `Category "${name}" already exists` }, { status: 400 });
      }

      currentCats.push(name);
    }

    // Save to local file
    writeLocalCategories(currentCats);

    // Save to Database
    try {
      await prisma.package.upsert({
        where: { slug: CONFIG_SLUG },
        update: { features: JSON.stringify(currentCats) },
        create: {
          name: 'Portfolio Categories Config',
          slug: CONFIG_SLUG,
          price: 0,
          duration: '30s',
          revisions: '0',
          deliveryDays: '1',
          features: JSON.stringify(currentCats),
          popular: false,
        },
      });
    } catch (dbErr) {
      console.warn('DB upsert for categories failed (saved to file):', dbErr);
    }

    return NextResponse.json({
      success: true,
      categories: currentCats,
      message: 'Category updated successfully',
    });
  } catch (err: any) {
    console.error('Error in POST /api/portfolio/categories:', err);
    return NextResponse.json({ error: err.message || 'Failed to update category' }, { status: 500 });
  }
}

// DELETE: Remove a category
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryName = searchParams.get('name');
    let bodyName = '';
    try {
      const body = await request.json();
      bodyName = body?.name || body?.category || '';
    } catch {
      // body may be empty
    }

    const targetName = (queryName || bodyName || '').trim();
    if (!targetName) {
      return NextResponse.json({ error: 'Category name to delete is required' }, { status: 400 });
    }

    let currentCats = readLocalCategories();

    // Read latest from DB
    try {
      const pkg = await prisma.package.findUnique({ where: { slug: CONFIG_SLUG } });
      if (pkg?.features) {
        const parsed = JSON.parse(pkg.features);
        if (Array.isArray(parsed) && parsed.length > 0) {
          currentCats = parsed;
        }
      }
    } catch (e) {
      // ignore db error
    }

    const filtered = currentCats.filter(c => c.toLowerCase() !== targetName.toLowerCase());

    if (filtered.length === currentCats.length) {
      return NextResponse.json({ error: `Category "${targetName}" not found` }, { status: 404 });
    }

    // Write to local file
    writeLocalCategories(filtered);

    // Write to DB
    try {
      await prisma.package.upsert({
        where: { slug: CONFIG_SLUG },
        update: { features: JSON.stringify(filtered) },
        create: {
          name: 'Portfolio Categories Config',
          slug: CONFIG_SLUG,
          price: 0,
          duration: '30s',
          revisions: '0',
          deliveryDays: '1',
          features: JSON.stringify(filtered),
          popular: false,
        },
      });
    } catch (dbErr) {
      console.warn('DB upsert on category delete failed (saved to file):', dbErr);
    }

    return NextResponse.json({
      success: true,
      categories: filtered,
      message: `Category "${targetName}" deleted successfully`,
    });
  } catch (err: any) {
    console.error('Error in DELETE /api/portfolio/categories:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete category' }, { status: 500 });
  }
}
