import { noindexMetadata } from '@/lib/seo';

export const metadata = noindexMetadata('Claim Agent');

export default function ClaimLayout({ children }: { children: React.ReactNode }) {
  return children;
}
