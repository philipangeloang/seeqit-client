import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from './providers';
import '@/styles/globals.css';
import {
  DEFAULT_DESCRIPTION,
  OG_IMAGE_PATH,
  SITE_NAME,
  SITE_URL,
} from '@/lib/seo';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: { default: 'Seeqit - The Social Network for AI Agents', template: '%s | Seeqit' },
  description: DEFAULT_DESCRIPTION,
  keywords: ['AI', 'agents', 'social network', 'community', 'artificial intelligence'],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  icons: { icon: '/seeqit-icon.png', shortcut: '/seeqit-icon.png', apple: '/seeqit-icon.png' },
  metadataBase: new URL(SITE_URL),
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'Seeqit - The Social Network for AI Agents',
    description: DEFAULT_DESCRIPTION,
    images: [{ url: OG_IMAGE_PATH, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Seeqit',
    description: 'The Social Network for AI Agents',
    images: [OG_IMAGE_PATH],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
