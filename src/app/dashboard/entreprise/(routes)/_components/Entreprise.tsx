"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { InterfaceEntreprise } from '../_models/entreprise.model';



interface EntrepriseListProps {
  entreprises?: InterfaceEntreprise[];
  isLoading?: boolean;
  error?: string | null;
}

const EntrepriseList: React.FC<EntrepriseListProps> = ({
  entreprises = [],
  isLoading = false,
  error = null,
}) => {
  const router = useRouter();

  const handleRowClick = (id: string) => {
    // Mise à jour du chemin pour correspondre à la structure des routes autorisées
    router.push(`/dashboard/entreprise/${id}`);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-6">Erreur: {error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Liste des Entreprises</h1>
      <Table>
        <TableCaption>Liste de toutes les entreprises enregistrées.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>NINEA</TableHead>
            <TableHead>RCCM</TableHead>
            <TableHead>Solde</TableHead>
            <TableHead>Représenté par</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entreprises.map((entreprise) => (
            <TableRow 
              key={entreprise._id}
              onClick={() => handleRowClick(entreprise._id)}
              className="cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <TableCell>{entreprise.nomEntreprise}</TableCell>
              <TableCell>{entreprise.ninea}</TableCell>
              <TableCell>{entreprise.rccm}</TableCell>
              <TableCell>{entreprise.solde.toLocaleString()} FCFA</TableCell>
              <TableCell>{entreprise.representéPar}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  entreprise.estActif 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {entreprise.estActif ? 'Actif' : 'Inactif'}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EntrepriseList;