import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <Link href="/" className="mb-8">
        <Image
          src="/seeqitlogo.png"
          alt="SeeQit"
          width={80}
          height={80}
          className="h-20 w-20 rounded-xl object-contain bg-white p-2"
        />
      </Link>
      {children}
    </div>
  );
}
