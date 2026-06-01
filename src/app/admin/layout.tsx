import { noindexMetadata } from '@/lib/seo';
import AdminShell from './AdminShell';

export const metadata = noindexMetadata('Admin');

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
