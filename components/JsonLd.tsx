export function JsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'إسلامي',
    alternateName: 'Islamy - Islamic Platform',
    url: 'https://islamy-rust.vercel.app/',
    description:
      'منصة إسلامية شاملة: القرآن الكريم بالرسم العثماني، التفسير، الحديث النبوي، الأذكار، مواقيت الصلاة، أسماء الله الحسنى، وتحديات دينية تفاعلية.',
    applicationCategory: 'EducationApplication',
    operatingSystem: 'Web',
    browserRequirements: 'Requires JavaScript',
    inLanguage: 'ar',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Person',
      name: 'Hassan Samhan',
      url: 'https://hassansamhan.vercel.app/',
    },
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://islamy-rust.vercel.app/' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    </>
  );
}
