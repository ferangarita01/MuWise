
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Muwise</h1>
        <p className="text-muted-foreground">
          This is your new dashboard. Let's build something great!
        </p>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Your agreements and contracts functionality has been cleared. We are ready for a fresh start.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted-foreground">
            What would you like to build first?
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
