export interface PortfolioItemType {
  id: string;
  title: string;
  category: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: string;
  featured?: boolean;
  views?: number;
}

export const DEFAULT_CATEGORIES: string[] = [
  'Fashion',
  'Clothing',
  'Jewelry',
  'Food',
  'Beauty',
  'Electronics',
  'Restaurant'
];

export const DEFAULT_PORTFOLIO_ITEMS: PortfolioItemType[] = [
  {
    id: 'default-reel-fashion',
    title: 'Luxury Silk Saree AI Showcase',
    category: 'Fashion',
    videoUrl: '/uploads/1788412577876-Screen_Recording_2026-04-06_200418.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    duration: '30s',
    featured: true,
    views: 1420,
  },
  {
    id: 'default-reel-clothing',
    title: 'Modern Urban Streetwear Commercial',
    category: 'Clothing',
    videoUrl: '/uploads/1788412577876-Screen_Recording_2026-04-06_200418.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    duration: '15s',
    featured: true,
    views: 980,
  },
  {
    id: 'default-reel-jewelry',
    title: 'Royal Diamond Necklace Dynamic Reel',
    category: 'Jewelry',
    videoUrl: '/uploads/1788412577876-Screen_Recording_2026-04-06_200418.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    duration: '30s',
    featured: true,
    views: 2150,
  },
  {
    id: 'default-reel-food',
    title: 'Artisan Gourmet Burger Promo Reel',
    category: 'Food',
    videoUrl: '/uploads/1788412577876-Screen_Recording_2026-04-06_200418.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    duration: '20s',
    featured: true,
    views: 1840,
  },
  {
    id: 'default-reel-beauty',
    title: 'Glow Radiant Serum Skincare Commercial',
    category: 'Beauty',
    videoUrl: '/uploads/1788412577876-Screen_Recording_2026-04-06_200418.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    duration: '25s',
    featured: true,
    views: 2430,
  },
  {
    id: 'default-reel-electronics',
    title: 'Next-Gen Wireless ANC Headphones Reel',
    category: 'Electronics',
    videoUrl: '/uploads/1788412577876-Screen_Recording_2026-04-06_200418.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    duration: '30s',
    featured: true,
    views: 1670,
  },
  {
    id: 'default-reel-restaurant',
    title: 'Fine Dining Luxury Experience Reel',
    category: 'Restaurant',
    videoUrl: '/uploads/1788412577876-Screen_Recording_2026-04-06_200418.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    duration: '30s',
    featured: true,
    views: 1920,
  },
];

