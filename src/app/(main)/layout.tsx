import { MainLayout } from '@/components/layout';
import { JsonLd } from '@/components/seo/JsonLd';
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/seo';

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: DEFAULT_DESCRIPTION,
};

export default function MainGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <MainLayout>
      <JsonLd data={websiteSchema} />
      {children}
    </MainLayout>
  );
}
