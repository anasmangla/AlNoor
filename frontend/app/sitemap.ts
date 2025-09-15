import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  const bp = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const p = (path: string) => `${site}${bp}${path}`;
  const now = new Date().toISOString();
  return [
    { url: p('/'), lastModified: now },
    { url: p('/products'), lastModified: now },
    { url: p('/contact'), lastModified: now },
    { url: p('/cart'), lastModified: now },
    { url: p('/checkout'), lastModified: now },
    { url: p('/admin/login'), lastModified: now },
  ];
}

