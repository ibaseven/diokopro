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
import { Badge } from '@/components/ui/badge';
import ClientPaymentFilterButton from './ClientPaymentFilterButton';

interface ClientListProps {
  clients: any[];
  totalClients: number;
  onClientClick: (client: any) => void;
  searchTerm: string;
}

const ClientList: React.FC<ClientListProps> = ({ 
  clients, 
  totalClients, 
  onClientClick, 
  searchTerm 
}) => {
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [filteredClients, setFilteredClients] = useState(clients);

  // Appliquer les filtres lorsque les clients ou le filtre de paiement changent
  useEffect(() => {
    let result = [...clients];
    
    // Appliquer le filtre de paiement
    if (paymentFilter === 'paid') {
      result = result.filter(client => client.aDejaPaye === true);
    } else if (paymentFilter === 'unpaid') {
      result = result.filter(client => client.aDejaPaye === false);
    }
    
    setFilteredClients(result);
  }, [clients, paymentFilter]);

  const handlePaymentFilterChange = (filterOption: 'all' | 'paid' | 'unpaid') => {
    setPaymentFilter(filterOption);
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Liste des clients</h2>
          <ClientPaymentFilterButton 
            onFilterChange={handlePaymentFilterChange} 
            currentFilter={paymentFilter} 
          />
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {filteredClients.length} client(s) {paymentFilter === 'paid' ? 'payés' : 
            paymentFilter === 'unpaid' ? 'non payés' : 'au total'}
        </Badge>
      </div>

      <Table>
        <TableCaption>Liste des clients{paymentFilter === 'paid' ? ' payés' : 
          paymentFilter === 'unpaid' ? ' non payés' : ''}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Prénom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Téléphone</TableHead>
            <TableHead>Adresse</TableHead>
            <TableHead>NIN</TableHead>
            <TableHead>Services</TableHead>
            <TableHead>Paiement</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <TableRow
                key={client._id}
                onClick={() => onClientClick(client)}
                className="cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <TableCell className="font-medium">{client.nom}</TableCell>
                <TableCell>{client.prenom}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.telephone}</TableCell>
                <TableCell>{client.adresse}</TableCell>
                <TableCell>{client.nin}</TableCell>
                <TableCell>
                  {client.servicesChoisis && client.servicesChoisis.length > 0 ? (
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
                <TableCell>
                  <Badge variant={client.aDejaPaye ? "success" : "warning"}>
                    {client.aDejaPaye ? "Payé" : "Non payé"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                {searchTerm ? "Aucun client ne correspond à votre recherche" : 
                 paymentFilter !== 'all' ? `Aucun client ${paymentFilter === 'paid' ? 'payé' : 'non payé'} trouvé` : 
                 "Aucun client trouvé"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientList;