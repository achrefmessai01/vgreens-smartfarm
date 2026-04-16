import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'vGreens Lab - Smart Farm Management',
    short_name: 'vGreens Lab',
    description:
      'vGreens Lab is a platform for managing and analyzing greenhouse data',
    start_url: '/?source=pwa',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    background_color: '#030712',
    theme_color: '#10b981',
    orientation: 'portrait',
    scope: '/',
    prefer_related_applications: false,
    icons: [
      {
        src: '/icons/android/launchericon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/android/launchericon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/android/launchericon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/android/launchericon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [],
    categories: ['agriculture', 'productivity', 'utilities'],
    lang: 'en',
  };
}
