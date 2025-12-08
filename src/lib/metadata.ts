import { Metadata } from 'next';

interface GenerateMetadataProps {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article';
  price?: number;
  currency?: string;
  availability?: 'instock' | 'outofstock' | 'preorder';
}

export function generateMetadata({
  title,
  description,
  image = '/og-image.jpg',
  type = 'website',
  price,
  currency = 'ARS',
  availability,
}: GenerateMetadataProps): Metadata {
  const baseUrl = 'https://rastuci.com';

  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image.startsWith('http') ? image : `${baseUrl}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: type as 'website' | 'article',
      locale: 'es_AR',
      siteName: 'Rastuci',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.startsWith('http') ? image : `${baseUrl}${image}`],
    },
  };

  // Agregar datos de producto en other metadata (Open Graph no soporta type="product")
  if (price !== undefined) {
    metadata.other = {
      'product:price:amount': price.toString(),
      'product:price:currency': currency,
      ...(availability && { 'product:availability': availability }),
    };
  }

  return metadata;
}

export function generateProductJsonLd(product: {
  id: string;
  name: string;
  description: string;
  image: string[];
  price: number;
  salePrice?: number;
  currency?: string;
  availability: 'instock' | 'outofstock' | 'preorder';
  rating?: number;
  reviewCount?: number;
  brand?: string;
}) {
  const baseUrl = 'https://rastuci.com';

  // Normalizar imágenes a array
  let images: string[] = [];
  if (Array.isArray(product.image)) {
    images = product.image;
  } else if (typeof product.image === 'string') {
    try {
      images = JSON.parse(product.image);
    } catch {
      images = [product.image];
    }
  }

  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: images.map(img => img.startsWith('http') ? img : `${baseUrl}${img}`),
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Rastuci',
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/productos/${product.id}`,
      priceCurrency: product.currency || 'ARS',
      price: product.salePrice || product.price,
      availability: `https://schema.org/${product.availability === 'instock' ? 'InStock' : product.availability === 'outofstock' ? 'OutOfStock' : 'PreOrder'}`,
    },
    ...(product.rating && product.reviewCount && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating.toString(),
        reviewCount: product.reviewCount.toString(),
      },
    }),
  };
}

export function generateBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  const baseUrl = 'https://rastuci.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}

export function formatPrice(value: number, currency: string = 'ARS'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function generateStoreJsonLd() {
  const baseUrl = 'https://rastuci.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Rastuci',
    image: `${baseUrl}/logo.png`,
    '@id': baseUrl,
    url: baseUrl,
    telephone: '+5491112345678', // Placeholder, should be config driven ideally
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Calle Falsa 123',
      addressLocality: 'Buenos Aires',
      postalCode: '1000',
      addressCountry: 'AR'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -34.6037,
      longitude: -58.3816
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ],
      opens: '00:00',
      closes: '23:59'
    },
    sameAs: [
      'https://www.facebook.com/rastuci',
      'https://www.instagram.com/rastuci'
    ]
  };
}
