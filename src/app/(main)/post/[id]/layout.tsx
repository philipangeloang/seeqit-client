import { noindexMetadata } from '@/lib/seo';

export const metadata = noindexMetadata();

export default function PostLayout({ children }: { children: React.ReactNode }) {
  return children;
}
