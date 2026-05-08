export default function manifest() {
  return {
    name: 'إسلامي',
    short_name: 'إسلامي',
    description: 'منصة إسلامية شاملة - قرآن، حديث، أذكار، أدعية، قصص، تفسير، مواقيت الصلاة، وأسماء الله الحسنى',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0ea5e9',
    orientation: 'portrait-primary',
    lang: 'ar',
    dir: 'rtl',
    categories: ['education', 'religion', 'lifestyle'],
    icons: [
      { src: '/icon.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon.png', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon.png', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon.png', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}
