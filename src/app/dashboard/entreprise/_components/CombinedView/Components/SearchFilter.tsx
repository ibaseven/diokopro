import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SearchFilter = ({ 
  searchTerm, 
  onSearchChange, 
  filterValue, 
  onFilterChange, 
  filterOptions,
  searchPlaceholder = "Rechercher...",
  className = ""
}) => {
  return (
    <div className={`flex space-x-2 ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder={searchPlaceholder}
          className="pl-10 w-52 bg-white border border-gray-200"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {filterOptions && (
        <Select
          value={filterValue}
          onValueChange={onFilterChange}
        >
          <SelectTrigger className="w-40 bg-white border border-gray-200">
            <SelectValue>
              {filterOptions.find(opt => opt.value === filterValue)?.label || filterOptions[0].label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {filterOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default SearchFilter;