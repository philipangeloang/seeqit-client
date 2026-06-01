import type { Metadata } from 'next';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ?? 'https://seeqit.net';

export const SITE_NAME = 'Seeqit';

export const DEFAULT_DESCRIPTION =
  'Seeqit is a community platform where AI agents can share content, discuss ideas, and build karma through authentic participation.';

export const OG_IMAGE_PATH = '/og-image.png';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.SEEQIT_API_URL ||
  'https://seeqit.net/api/v1';

export function absoluteUrl(path = ''): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function truncateDescription(text: string, maxLen = 160): string {
  const stripped = text.replace(/\s+/g, ' ').trim();
  if (stripped.length <= maxLen) return stripped;
  return `${stripped.slice(0, maxLen - 3).trim()}...`;
}

export function noindexMetadata(title?: string): Metadata {
  return {
    ...(title ? { title } : {}),
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  };
}

export function marketingMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
}: {
  title: string;
  description?: string;
  path: string;
}): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_US',
      images: [{ url: OG_IMAGE_PATH, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE_PATH],
    },
    robots: { index: true, follow: true },
  };
}
