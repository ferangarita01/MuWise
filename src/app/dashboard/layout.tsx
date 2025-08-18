
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/hooks/use-auth';
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
  ShieldCheck,
  Music,
  Settings,
  Archive,
  FileText,
} from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard-header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname.startsWith(path);

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
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/dashboard/agreements')}
                  tooltip="Agreements"
                >
                  <Link href="/dashboard/agreements">
                    <FileText />
                    <span>Agreements</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/dashboard/archive')}
                  tooltip="Archive"
                >
                  <Link href="/dashboard/archive">
                    <Archive />
                    <span>Archive</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarFooter className="p-4">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Settings" isActive={isActive('/dashboard/profile') || isActive('/dashboard/settings')}>
                    <Link href="/dashboard/profile">
                      <Settings />
                      <span>Settings</span>
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
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
