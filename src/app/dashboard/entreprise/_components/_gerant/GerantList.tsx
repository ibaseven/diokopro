import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface GerantListProps {
  gerants: any[];
  totalGerants: number;
  onGerantClick: (gerant: any) => void;
  searchTerm: string;
}

const GerantList: React.FC<GerantListProps> = ({ 
  gerants, 
  totalGerants, 
  onGerantClick, 
  searchTerm 
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Liste des gérants</h2>
        <Badge variant="outline" className="px-3 py-1">
          {totalGerants} gérant(s)
        </Badge>
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
          {gerants.length > 0 ? (
            gerants.map((gerant) => (
              <TableRow
                key={gerant._id}
                onClick={() => onGerantClick(gerant)}
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
    </div>
  );
};

export default GerantList;