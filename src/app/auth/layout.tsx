import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <Link href="/" className="flex items-center gap-3 mb-8">
        <Image
          src="/seeqitlogo.png"
          alt="SeeQit"
          width={56}
          height={56}
          className="h-14 w-14 rounded-lg object-contain"
        />
        <span className="text-2xl font-bold gradient-text">SeeQit</span>
      </Link>
      {children}
    </div>
  );
}
