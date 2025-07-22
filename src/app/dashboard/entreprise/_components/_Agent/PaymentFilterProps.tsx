import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { CheckIcon, FilterIcon } from 'lucide-react';

interface PaymentFilterProps {
  onFilterChange: (filterOption: 'all' | 'paid' | 'unpaid') => void;
  currentFilter: 'all' | 'paid' | 'unpaid';
}

const PaymentFilterButton: React.FC<PaymentFilterProps> = ({ 
  onFilterChange, 
  currentFilter 
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <FilterIcon size={16} />
          <span>
            {currentFilter === 'all' && 'Tous les agents'}
            {currentFilter === 'paid' && 'Payés'}
            {currentFilter === 'unpaid' && 'Non payés'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onFilterChange('all')}>
          <div className="flex items-center justify-between w-full">
            Tous les agents
            {currentFilter === 'all' && <CheckIcon size={16} />}
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFilterChange('paid')}>
          <div className="flex items-center justify-between w-full">
            Payés
            {currentFilter === 'paid' && <CheckIcon size={16} />}
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFilterChange('unpaid')}>
          <div className="flex items-center justify-between w-full">
            Non payés
            {currentFilter === 'unpaid' && <CheckIcon size={16} />}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PaymentFilterButton;