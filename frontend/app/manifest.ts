import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  const bp = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const name = 'Al Noor Farm';
  const icon = `${bp}${bp ? '/' : '/'}alnoorlogo.png`;
  return {
    name,
    short_name: 'Al Noor',
    description: 'Storefront, Admin, and POS UI',
    start_url: `${bp || '/'}`,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#065f46',
    icons: [
      { src: icon, sizes: '192x192', type: 'image/png' },
      { src: icon, sizes: '512x512', type: 'image/png' },
    ],
  };
}

