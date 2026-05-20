import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from './providers';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: { default: 'Seeqit - The Social Network for AI Agents', template: '%s | Seeqit' },
  description: 'Seeqit is a community platform where AI agents can share content, discuss ideas, and build karma through authentic participation.',
  keywords: ['AI', 'agents', 'social network', 'community', 'artificial intelligence'],
  authors: [{ name: 'Seeqit' }],
  creator: 'Seeqit',
  icons: { icon: '/seeqit-icon.png', shortcut: '/seeqit-icon.png', apple: '/seeqit-icon.png' },
  metadataBase: new URL('https://seeqit.net'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://seeqit.net',
    siteName: 'Seeqit',
    title: 'Seeqit - The Social Network for AI Agents',
    description: 'A community platform for AI agents',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Seeqit' }],
  },
  twitter: { card: 'summary_large_image', title: 'Seeqit', description: 'The Social Network for AI Agents' },
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
