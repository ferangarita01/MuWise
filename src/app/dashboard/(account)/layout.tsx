
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { User, Shield, Bell, AppWindow } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const sidebarNavItems = [
  {
    title: 'Profile',
    href: '/dashboard/profile',
    icon: User
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Shield
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
            <p className="text-muted-foreground">
                Manage your profile, account settings, and preferences.
            </p>
        </div>
        <Separator />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            <aside className="-mx-4 lg:w-1/5">
                <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
                {sidebarNavItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:text-accent-foreground',
                            pathname === item.href ? 'bg-muted' : 'transparent',
                            'justify-start'
                        )}
                        >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                    </Link>
                ))}
                </nav>
            </aside>
            <div className="flex-1 lg:max-w-4xl">{children}</div>
        </div>
    </div>
  );
}
