import { Metadata } from 'next';

// SEO configuration and utilities
export interface SEOConfig {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultImage: string;
  twitterHandle?: string;
  locale: string;
}

export const seoConfig: SEOConfig = {
  siteName: 'Rastuci',
  siteUrl: 'https://rastuci.com',
  defaultTitle: 'Rastuci - Premium Fashion & Lifestyle',
  defaultDescription: 'Discover premium fashion and lifestyle products at Rastuci. Shop the latest trends with fast shipping and excellent customer service.',
  defaultImage: '/og-image.jpg',
  twitterHandle: '@rastuci',
  locale: 'es_ES',
};

// Generate metadata for pages
export function generateMetadata({
  title,
  description,
  image,
  url,
  noIndex = false,
  type = 'website',
}: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  noIndex?: boolean;
  type?: 'website' | 'article' | 'product';
}): Metadata {
  const fullTitle = title 
    ? `${title} | ${seoConfig.siteName}`
    : seoConfig.defaultTitle;
  
  const fullDescription = description || seoConfig.defaultDescription;
  const fullImage = image || seoConfig.defaultImage;
  const fullUrl = url ? `${seoConfig.siteUrl}${url}` : seoConfig.siteUrl;
  // Next.js OpenGraph type is limited; map 'product' to 'website'
  const ogType: 'website' | 'article' = type === 'article' ? 'article' : 'website';

  return {
    title: fullTitle,
    description: fullDescription,
    robots: noIndex ? 'noindex,nofollow' : 'index,follow',
    openGraph: {
      type: ogType,
      title: fullTitle,
      description: fullDescription,
      url: fullUrl,
      siteName: seoConfig.siteName,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: seoConfig.locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [fullImage],
      creator: seoConfig.twitterHandle,
    },
    alternates: {
      canonical: fullUrl,
    },
  };
}

// Product-specific metadata
export function generateProductMetadata({
  product,
}: {
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    images: string[];
    category: string;
    inStock: boolean;
  };
}): Metadata {
  const title = `${product.name} - ${product.category}`;
  const description = `${(product.description || 'Producto sin descripción disponible').substring(0, 155)}... Precio: $${product.price}. ${product.inStock ? 'En stock' : 'Agotado'}.`;
  const image = product.images[0];
  const url = `/productos/${product.id}`;

  const metadata = generateMetadata({
    title,
    description,
    image,
    url,
    type: 'product',
  });

  // Add structured data for products
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || 'Producto sin descripción disponible',
    image: product.images,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: product.inStock 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: seoConfig.siteName,
      },
    },
    brand: {
      '@type': 'Brand',
      name: seoConfig.siteName,
    },
    category: product.category,
  };

  return {
    ...metadata,
    other: {
      'application/ld+json': JSON.stringify(structuredData),
    },
  };
}

// Category-specific metadata
export function generateCategoryMetadata({
  category,
  productCount,
}: {
  category: string;
  productCount: number;
}): Metadata {
  const title = `${category} - Productos de Moda`;
  const description = `Explora nuestra colección de ${category.toLowerCase()} con ${productCount} productos disponibles. Encuentra las últimas tendencias en ${category.toLowerCase()}.`;
  const url = `/productos?categoria=${encodeURIComponent(category)}`;

  return generateMetadata({
    title,
    description,
    url,
  });
}

// Search results metadata
export function generateSearchMetadata({
  query,
  resultCount,
}: {
  query: string;
  resultCount: number;
}): Metadata {
  const title = `Búsqueda: "${query}"`;
  const description = `${resultCount} resultados encontrados para "${query}". Encuentra productos de moda y lifestyle en Rastuci.`;
  const url = `/productos?buscar=${encodeURIComponent(query)}`;

  return generateMetadata({
    title,
    description,
    url,
    noIndex: true, // Don't index search results
  });
}

// Generate breadcrumb structured data
export function generateBreadcrumbStructuredData(items: Array<{
  name: string;
  url: string;
}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${seoConfig.siteUrl}${item.url}`,
    })),
  };
}

// Generate organization structured data
export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    logo: `${seoConfig.siteUrl}/logo.png`,
    sameAs: [
      'https://twitter.com/rastuci',
      'https://instagram.com/rastuci',
      'https://facebook.com/rastuci',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-0123',
      contactType: 'customer service',
      email: 'support@rastuci.com',
    },
  };
}

// Generate website structured data
export function generateWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${seoConfig.siteUrl}/productos?buscar={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

// SEO utilities for dynamic content
export function generateCanonicalUrl(path: string): string {
  return `${seoConfig.siteUrl}${path}`;
}

export function generateHreflangTags(path: string, locales: string[]) {
  return locales.map(locale => ({
    hreflang: locale,
    href: `${seoConfig.siteUrl}/${locale}${path}`,
  }));
}

// Meta tags for specific pages
export const homePageMetadata = generateMetadata({
  title: 'Inicio',
  description: 'Descubre la mejor moda y lifestyle en Rastuci. Productos premium, envío rápido y atención al cliente excepcional.',
  url: '/',
});

export const aboutPageMetadata = generateMetadata({
  title: 'Acerca de Nosotros',
  description: 'Conoce la historia de Rastuci, nuestra misión y valores. Comprometidos con la moda sostenible y la calidad.',
  url: '/acerca',
});

export const contactPageMetadata = generateMetadata({
  title: 'Contacto',
  description: 'Ponte en contacto con el equipo de Rastuci. Estamos aquí para ayudarte con cualquier pregunta o consulta.',
  url: '/contacto',
});

// Sitemap generation utilities
export interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export function generateSitemapEntry({
  path,
  lastModified = new Date(),
  changeFrequency = 'weekly',
  priority = 0.5,
}: {
  path: string;
  lastModified?: Date;
  changeFrequency?: SitemapEntry['changeFrequency'];
  priority?: number;
}): SitemapEntry {
  return {
    url: `${seoConfig.siteUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  };
}
