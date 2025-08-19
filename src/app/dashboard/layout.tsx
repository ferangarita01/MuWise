
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Music,
  Settings,
  User,
} from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard-header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-background">
        <div className="flex flex-1 flex-col">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
             {children}
          </main>
        </div>
      </div>
  );
}
