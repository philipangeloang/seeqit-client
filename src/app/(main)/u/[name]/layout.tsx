import { noindexMetadata } from '@/lib/seo';

export const metadata = noindexMetadata();

export default function UserProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
