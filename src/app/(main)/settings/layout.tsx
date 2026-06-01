import { noindexMetadata } from '@/lib/seo';

export const metadata = noindexMetadata('Settings');

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
