"use client";
import React, { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PaginationControls from '../../_components/PaginationControlsProps';

interface Service {
  _id: string;
  nomService: string;
  description?: string;
  tarifactionBase?: number;
  gerants?: string[];
  entreprise?: string;
  niveauxDisponibles?: string[];
  tarifsParNiveau?: number[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface Client {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  nin: string;
  servicesChoisis: Service[];
  paiementsEffectues: any[];
  estNouveau: boolean;
  dateCreation: string;
}

interface ClientsViewProps {
  entrepriseId: string;
  initialClients: Client[];
}

const ITEMS_PER_PAGE = 5;

const ClientsView: React.FC<ClientsViewProps> = ({ entrepriseId, initialClients }) => {
  const [showClients, setShowClients] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  // Pagination calculations
  const totalPages = Math.ceil(initialClients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentClients = initialClients.slice(startIndex, endIndex);

  const toggleClientsView = () => {
    setShowClients(!showClients);
  };

  const handleClientClick = (clientId: string) => {
    // Navigate to client details page
    router.push(`/dashboard/clients/${clientId}`);
  };

  return (
    <div className="p-6">
    

      {/* Button to toggle clients view */}
      <Button 
        onClick={toggleClientsView}
        className="mb-6"
      >
        {showClients ? "Masquer les clients" : "Afficher la liste des clients"}
      </Button>

      {/* Clients list - only shown when showClients is true */}
      {showClients && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Liste des clients</h2>
            <Badge variant="outline" className="px-3 py-1">
              {initialClients.length} client(s)
            </Badge>
          </div>

          <Table>
            <TableCaption>Liste complète des clients</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Prénom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>NIN</TableHead>
                <TableHead>Services</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentClients.length > 0 ? (
                currentClients.map((client) => (
                  <TableRow
                    key={client._id}
                    onClick={() => handleClientClick(client._id)}
                    className="cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <TableCell className="font-medium">{client.nom}</TableCell>
                    <TableCell>{client.prenom}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.telephone}</TableCell>
                    <TableCell>{client.adresse}</TableCell>
                    <TableCell>{client.nin}</TableCell>
                    <TableCell>
                      {client.servicesChoisis.length > 0 ? (
                        <div className="space-y-1">
                          {client.servicesChoisis.map((service, index) => (
                            <Badge key={index} variant="secondary" className="mr-1">
                              {service.nomService}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        "Aucun"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Aucun client trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {initialClients.length > ITEMS_PER_PAGE && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsCount={initialClients.length}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ClientsView;