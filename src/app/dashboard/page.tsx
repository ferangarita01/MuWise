
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, LayoutGrid, ListFilter, Search } from 'lucide-react';
import Link from 'next/link';
import { AgreementTypeCard } from '@/components/agreement-type-card';
import { ComingSoonModal } from '@/components/coming-soon-modal';
import type { AgreementType } from '@/lib/types';
import { useRouter } from 'next/navigation';

const agreementTypes: AgreementType[] = [
  {
    id: 'songwriter-split',
    title: 'Songwriter Split Agreement',
    icon: '🎵',
    description: 'Define ownership percentages and publishing rights between writers',
    badge: 'Most Common ⭐',
    category: 'songwriting'
  },
  {
    id: 'producer-agreement',
    title: 'Producer Agreement',
    icon: '🎛️', 
    description: 'Producer credits and compensation for production work',
    badge: 'Popular 🔥',
    category: 'production'
  },
  {
    id: 'collaboration-agreement',
    title: 'Collaboration Agreement',
    icon: '🤝',
    description: 'Multi-party creative project with multiple contributors',
    badge: 'Team Projects 👥',
    category: 'collaboration'
  },
  {
    id: 'featured-artist',
    title: 'Featured Artist Agreement',
    icon: '🎤',
    description: 'Define terms for featured performances and credits',
    badge: 'Performances 🎙️',
    category: 'songwriting'
  },
  {
    id: 'remix-agreement',
    title: 'Remix Agreement',
    icon: '🔄',
    description: 'Rights and royalties for remix versions of original work',
    badge: 'Remixes 🎛️',
    category: 'production'
  },
  {
    id: 'custom-agreement',
    title: 'Custom Agreement',
    icon: '🎯',
    description: 'Create your own agreement type with custom terms',
    badge: 'Advanced ✨',
    category: 'collaboration'
  }
];


// SearchBar Component
function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        placeholder="Search agreement types..."
        className="pl-10 text-base"
        onChange={(e) => onSearch(e.target.value)}
        autoFocus
      />
    </div>
  );
}

// FilterButtons Component
function FilterButtons({ onFilterChange, defaultValue }: { onFilterChange: (filter: string) => void, defaultValue: string }) {
  return (
    <RadioGroup
      defaultValue={defaultValue}
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
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="collaboration" id="f-collaboration" />
        <Label htmlFor="f-collaboration">Collaboration</Label>
      </div>
    </RadioGroup>
  );
}

// AgreementTypesGrid Component
function AgreementTypesGrid({ types, onSelect }: { types: AgreementType[], onSelect: (id: string) => void }) {
    if (types.length === 0) {
      return (
        <div className="min-h-[400px] flex items-center justify-center rounded-lg border border-dashed border-border bg-card text-center p-8">
            <p className="text-muted-foreground">No matching agreement types found.</p>
        </div>
      );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {types.map((type) => (
                <AgreementTypeCard key={type.id} type={type} onSelect={() => onSelect(type.id)} />
            ))}
        </div>
    );
}


// Main Page Component
export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  
  const handleSelectType = (id: string) => {
    if (id === 'songwriter-split') {
      router.push('/dashboard/agreements/new');
    } else {
      setIsModalOpen(true);
    }
  };

  const filteredTypes = agreementTypes.filter(type => {
      const matchesSearch = type.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          type.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = () => {
          switch (filter) {
              case 'all':
                  return true;
              case 'popular':
                  return ['songwriter-split', 'producer-agreement'].includes(type.id);
              case 'songwriting':
                  return type.category === 'songwriting';
              case 'production':
                  return type.category === 'production';
              case 'collaboration':
                  return type.category === 'collaboration';
              default:
                  return true;
          }
      };

      return matchesSearch && matchesFilter();
  });

  return (
    <>
      <ComingSoonModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="flex flex-col gap-8">
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
              <FilterButtons onFilterChange={setFilter} defaultValue={filter} />
          </div>
        </div>

        {/* Grid Area */}
        <div>
          <AgreementTypesGrid types={filteredTypes} onSelect={handleSelectType} />
        </div>
      </div>
    </>
  );
}
