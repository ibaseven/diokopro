import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PaymentFilterProps {
  onFilterChange: (filterOption: 'all' | 'paid' | 'unpaid') => void;
  currentFilter: 'all' | 'paid' | 'unpaid';
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchValue: string;
  placeholder: string;
}

const PaymentFilterProps: React.FC<PaymentFilterProps> = ({ 
  onFilterChange, 
  currentFilter,
  onSearchChange,
  searchValue,
  placeholder
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="relative flex-grow mr-2">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder={placeholder}
          className="pl-10 w-full"
          value={searchValue}
          onChange={onSearchChange}
        />
      </div>
      
      <Select
        value={currentFilter}
        onValueChange={(value) => onFilterChange(value as 'all' | 'paid' | 'unpaid')}
      >
        <SelectTrigger className="w-[150px] bg-white">
          <SelectValue>
            {currentFilter === 'all' && 'Tous'}
            {currentFilter === 'paid' && 'Payés'}
            {currentFilter === 'unpaid' && 'À Payer'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous</SelectItem>
          <SelectItem value="paid">Payés</SelectItem>
          <SelectItem value="unpaid">À Payer</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PaymentFilterProps;