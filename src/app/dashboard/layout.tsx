
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Music,
  Settings,
  FileText,
  Home,
  User,
} from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard-header';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const sidebarNavItems = [
    {
      title: 'Profile',
      href: '/dashboard/profile',
      icon: User
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: Settings
    },
  ];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
  const isAccountPage = pathname.startsWith('/dashboard/profile') || pathname.startsWith('/dashboard/settings');

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarHeader className="p-4">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Music className="h-8 w-8 text-primary" />
                <span className="text-xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                  Muwise
                </span>
              </Link>
            </SidebarHeader>
            <SidebarMenu className="flex-1 px-4">
                <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Dashboard" isActive={isActive('/dashboard')}>
                         <Link href="/dashboard">
                            <Home />
                            <span>Dashboard</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                   <SidebarMenuButton asChild tooltip="Agreements" isActive={pathname.startsWith('/dashboard/agreements')}>
                    <Link href="/dashboard/agreements/select-type">
                      <FileText />
                      <span>Agreements</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
            <SidebarFooter className="p-4">
              <SidebarMenu>
                 <SidebarMenuItem>
                   <SidebarMenuButton asChild tooltip="Account" isActive={isAccountPage}>
                    <Link href="/dashboard/profile">
                      <Settings />
                      <span>Account</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
             {isAccountPage ? (
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
            ) : (
                children
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
