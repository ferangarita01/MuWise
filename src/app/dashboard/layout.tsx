
'use client';

import * as React from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { Sidebar, SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarContent, SidebarHeader } from '@/components/ui/sidebar';
import { Home, FileText, Settings, Music, Users } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/dashboard/agreements', label: 'Agreements', icon: FileText },
    { href: '/dashboard/collaborators', label: 'Collaborators', icon: Users, disabled: true },
    { href: '/dashboard/catalog', label: 'Catalog', icon: Music, disabled: true },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ]
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-950">
          <Sidebar>
            <SidebarContent>
              <SidebarHeader>
                  <div className="flex items-center gap-2 p-2">
                    <Music className="w-6 h-6 text-primary" />
                    <span className="text-lg font-semibold">Muwise</span>
                  </div>
              </SidebarHeader>
              <SidebarMenu>
                {menuItems.map(item => (
                   <SidebarMenuItem key={item.href}>
                     <Link href={item.href} passHref legacyBehavior>
                      <SidebarMenuButton
                        isActive={pathname === item.href}
                        disabled={item.disabled}
                        aria-disabled={item.disabled}
                        className={item.disabled ? "cursor-not-allowed opacity-50" : ""}
                      >
                        <item.icon />
                        {item.label}
                      </SidebarMenuButton>
                     </Link>
                   </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <div className="flex flex-1 flex-col">
            <DashboardHeader />
            <main className="flex-1 overflow-y-auto">
               {children}
            </main>
          </div>
        </div>
    </SidebarProvider>
  );
}

    