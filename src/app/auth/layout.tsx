import { Music } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
       <div className="absolute top-8 left-8">
         <Link href="/" className="flex items-center gap-2 text-foreground">
            <Music className="h-8 w-8 text-primary" />
            <span className="text-2xl font-semibold ">
              Muwise
            </span>
          </Link>
       </div>
      <div className="w-full max-w-md p-4 md:p-0">{children}</div>
    </div>
  );
}
