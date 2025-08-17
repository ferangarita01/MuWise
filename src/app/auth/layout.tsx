
import InteractiveAuthBackground from '@/components/interactive-auth-background';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div 
      className="font-inter bg-gray-950 min-h-screen flex items-center justify-center antialiased"
      suppressHydrationWarning={true}
    >
      <InteractiveAuthBackground />
      <div 
        className="login-container w-full max-w-md px-6 z-10"
        id="login-container"
      >
        {children}
      </div>
    </div>
  );
}
