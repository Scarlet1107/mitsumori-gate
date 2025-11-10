import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '簡単家づくりシミュレーション',
    short_name: '家づくりシミュレーション',
    description: '住宅ローンとプランニングの事前シミュレーション',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#fdf2f8',
    icons: [
      {
        src: '/meta/192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/meta/512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
