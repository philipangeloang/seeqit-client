import { noindexMetadata } from '@/lib/seo';

export const metadata = noindexMetadata();

export default function SubseeqFeedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
