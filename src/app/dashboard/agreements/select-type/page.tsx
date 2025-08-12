
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, LayoutGrid, ListFilter, Search } from 'lucide-react';
import Link from 'next/link';

// SearchBar Component
function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        placeholder="Search agreement types..."
        className="pl-10 text-base"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}

// FilterButtons Component
function FilterButtons({ onFilterChange }: { onFilterChange: (filter: string) => void }) {
  return (
    <RadioGroup
      defaultValue="popular"
      className="flex flex-wrap items-center gap-4"
      onValueChange={onFilterChange}
    >
      <Label className="text-sm font-medium">Filter:</Label>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="all" id="f-all" />
        <Label htmlFor="f-all">All</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="popular" id="f-popular" />
        <Label htmlFor="f-popular">Popular</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="songwriting" id="f-songwriting" />
        <Label htmlFor="f-songwriting">Songwriting</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="production" id="f-production" />
        <Label htmlFor="f-production">Production</Label>
      </div>
    </RadioGroup>
  );
}

// AgreementTypesGrid Component
function AgreementTypesGrid({ searchQuery }: { searchQuery: string }) {
    // This component will eventually fetch and display agreement types
    // For now, it just shows a placeholder.
    return (
        <div className="min-h-[400px] flex items-center justify-center rounded-lg border border-dashed border-border bg-card text-center p-8">
            <p className="text-muted-foreground">Agreement types will appear here.</p>
        </div>
    );
}


// Main Page Component
export default function SelectAgreementTypePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('popular');

  return (
    <div className="flex flex-col gap-8">
      {/* Breadcrumbs */}
      <div className="text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
        {' > '}
        <span className="font-medium text-foreground">Create New Agreement</span>
      </div>
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Agreement</h1>
        <p className="text-muted-foreground">
          Choose the type of agreement you want to create.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex-grow">
            <SearchBar onSearch={setSearchQuery} />
        </div>
        <div className="flex items-center justify-between md:justify-end gap-4">
            <FilterButtons onFilterChange={setFilter} />
        </div>
      </div>

      {/* Grid Area */}
      <div>
        <AgreementTypesGrid searchQuery={searchQuery} />
      </div>
      
      {/* Footer Actions */}
      <div className="mt-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
