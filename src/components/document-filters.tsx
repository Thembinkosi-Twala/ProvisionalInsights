'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Filter as FilterIcon, PlusCircle, Trash2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

export interface Filter {
  id: string;
  field: 'title' | 'author' | 'summary' | 'keywords';
  condition: 'contains' | 'not-contains' | 'equals' | 'not-equals';
  value: string;
}

interface DocumentFiltersProps {
  filters: Filter[];
  onFiltersChange: (filters: Filter[]) => void;
}

const filterFields: { value: Filter['field']; label: string }[] = [
  { value: 'title', label: 'Title' },
  { value: 'author', label: 'Author' },
  { value: 'summary', label: 'Summary' },
  { value: 'keywords', label: 'Keywords' },
];

const filterConditions: { value: Filter['condition']; label: string }[] = [
  { value: 'contains', label: 'Contains' },
  { value: 'not-contains', label: 'Does not contain' },
  { value: 'equals', label: 'Equals' },
  { value: 'not-equals', label: 'Does not equal' },
];

export default function DocumentFilters({ filters, onFiltersChange }: DocumentFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<Filter[]>(filters);

  const addFilter = () => {
    setLocalFilters([
      ...localFilters,
      { id: Date.now().toString(), field: 'title', condition: 'contains', value: '' },
    ]);
  };

  const removeFilter = (id: string) => {
    setLocalFilters(localFilters.filter(f => f.id !== id));
  };

  const updateFilter = (id: string, newFilter: Partial<Filter>) => {
    setLocalFilters(
      localFilters.map(f => (f.id === id ? { ...f, ...newFilter } : f))
    );
  };
  
  const handleApply = () => {
    onFiltersChange(localFilters.filter(f => f.value.trim() !== ''));
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setLocalFilters(JSON.parse(JSON.stringify(filters)));
    }
    setIsOpen(open);
  }

  const getFilterDescription = (filter: Filter) => {
    const fieldLabel = filterFields.find(f => f.value === filter.field)?.label;
    const conditionLabel = filterConditions.find(c => c.value === filter.condition)?.label.toLowerCase();
    return `${fieldLabel} ${conditionLabel} "${filter.value}"`;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <FilterIcon className="mr-2 h-4 w-4" />
          Filter
          {filters.length > 0 && <Badge variant="secondary" className="ml-auto">{filters.length}</Badge>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Filter Documents</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto px-1">
          {localFilters.map((filter, index) => (
            <div key={filter.id} className="flex items-center gap-2">
              <Select
                value={filter.field}
                onValueChange={(value: Filter['field']) => updateFilter(filter.id, { field: value })}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Field" />
                </SelectTrigger>
                <SelectContent>
                  {filterFields.map(field => (
                    <SelectItem key={field.value} value={field.value}>{field.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                 value={filter.condition}
                 onValueChange={(value: Filter['condition']) => updateFilter(filter.id, { condition: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  {filterConditions.map(cond => (
                    <SelectItem key={cond.value} value={cond.value}>{cond.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Value"
                value={filter.value}
                onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                className="flex-1"
              />
              <Button variant="ghost" size="icon" onClick={() => removeFilter(filter.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={addFilter} className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Filter
          </Button>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleApply}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
