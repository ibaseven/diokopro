"use client";
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import PaginationControls from './PaginationControlsProps';
import { useRouter } from 'next/navigation';

interface Gerant {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
  servicesAffecte: string[];
  password?: string;
  __v?: number;
  secret_key?: {
    iv: string;
    encryptedData: string;
  };
}

interface GerantsViewProps {
  gerants: Gerant[];
  entrepriseId: string;
}

const ITEMS_PER_PAGE = 5;

const GerantsView: React.FC<GerantsViewProps> = ({ gerants, entrepriseId }) => {
  const [showGerants, setShowGerants] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredGerants, setFilteredGerants] = useState<Gerant[]>(gerants);
  const router = useRouter();

  // Filter gerants based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredGerants(gerants);
    } else {
      const normalizedSearchTerm = searchTerm.toLowerCase().trim();
      const filtered = gerants.filter(gerant => 
        gerant.nom.toLowerCase().includes(normalizedSearchTerm) ||
        gerant.prenom.toLowerCase().includes(normalizedSearchTerm) ||
        gerant.email.toLowerCase().includes(normalizedSearchTerm) ||
        gerant.telephone.includes(normalizedSearchTerm) ||
        gerant.role.toLowerCase().includes(normalizedSearchTerm)
      );
      setFilteredGerants(filtered);
    }
    
    setCurrentPage(1);
  }, [searchTerm, gerants]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredGerants.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredGerants.length);
  const currentGerants = filteredGerants.slice(startIndex, endIndex);

  const toggleGerantsView = () => {
    setShowGerants(!showGerants);
  };

  const handleGerantClick = (gerantId: string) => {
    // Navigate to gerant details page
    router.push(`/dashboard/gerants/${gerantId}`);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="p-6">
      {/* Button to toggle gerants view */}
      <Button 
        onClick={toggleGerantsView}
        className="mb-6"
      >
        {showGerants ? "Masquer la liste des gérants" : "Afficher la liste des gérants"}
      </Button>

      {/* Gerants list - only shown when showGerants is true */}
      {showGerants && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Liste des gérants</h2>
            <Badge variant="outline" className="px-3 py-1">
              {filteredGerants.length} gérant(s)
            </Badge>
          </div>

          {/* Search bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Rechercher un gérant..."
              className="pl-10 w-full max-w-sm"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <Table>
            <TableCaption>Liste complète des gérants</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Prénom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Services</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentGerants.length > 0 ? (
                currentGerants.map((gerant) => (
                  <TableRow
                    key={gerant._id}
                    onClick={() => handleGerantClick(gerant._id)}
                    className="cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <TableCell className="font-medium">{gerant.nom}</TableCell>
                    <TableCell>{gerant.prenom}</TableCell>
                    <TableCell>{gerant.email}</TableCell>
                    <TableCell>{gerant.telephone}</TableCell>
                    <TableCell>
                      <Badge variant={gerant.role === 'admin' ? "success" : "secondary"}>
                        {gerant.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {gerant.servicesAffecte && gerant.servicesAffecte.length > 0 ? (
                        <Badge variant="outline">{gerant.servicesAffecte.length} service(s)</Badge>
                      ) : (
                        "Aucun"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {searchTerm ? "Aucun gérant ne correspond à votre recherche" : "Aucun gérant trouvé"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {filteredGerants.length > ITEMS_PER_PAGE && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsCount={filteredGerants.length}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default GerantsView;