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
import PaymentFilterButton from './PaymentFilterProps';

interface AgentListProps {
  agents: any[];
  totalAgents: number;
  onAgentClick: (agent: any) => void;
  searchTerm: string;
}

const AgentList: React.FC<AgentListProps> = ({
  agents,
  totalAgents,
  onAgentClick,
  searchTerm
}) => {
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [filteredAgents, setFilteredAgents] = useState(agents);

  // Appliquer les filtres lorsque les agents ou le filtre de paiement changent
  useEffect(() => {
    let result = [...agents];
    
    // Appliquer le filtre de paiement
    if (paymentFilter === 'paid') {
      result = result.filter(agent => agent.dejaPaye === true);
    } else if (paymentFilter === 'unpaid') {
      result = result.filter(agent => agent.dejaPaye === false);
    }
    
    setFilteredAgents(result);
  }, [agents, paymentFilter]);

  const handlePaymentFilterChange = (filterOption: 'all' | 'paid' | 'unpaid') => {
    setPaymentFilter(filterOption);
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Liste des agents</h2>
          <PaymentFilterButton 
            onFilterChange={handlePaymentFilterChange} 
            currentFilter={paymentFilter} 
          />
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {filteredAgents.length} agent(s) {paymentFilter === 'paid' ? 'payés' : 
            paymentFilter === 'unpaid' ? 'non payés' : 'au total'}
        </Badge>
      </div>

      <Table>
        <TableCaption>Liste des agents{paymentFilter === 'paid' ? ' payés' : 
          paymentFilter === 'unpaid' ? ' non payés' : ''}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Prénom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Téléphone</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Nom Service</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Adresse</TableHead>
            <TableHead>Paiement</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAgents.length > 0 ? (
            filteredAgents.map((agent) => (
              <TableRow
                key={agent._id}
                onClick={() => onAgentClick(agent)}
                className="cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <TableCell className="font-medium">{agent.nom}</TableCell>
                <TableCell>{agent.prenom}</TableCell>
                <TableCell>{agent.email}</TableCell>
                <TableCell>{agent.telephone}</TableCell>
                <TableCell>{agent.role}</TableCell>
                <TableCell>
                  {agent.servicesAffecte && agent.servicesAffecte.length > 0 ? (
                    <div className="space-y-1">
                      {agent.servicesAffecte.map((service, index) => (
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
                  <Badge variant={agent.isActive ? "success" : "destructive"}>
                    {agent.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </TableCell>
                <TableCell>{agent.adresse || "-"}</TableCell>
                <TableCell>
                  <Badge variant={agent.dejaPaye ? "success" : "warning"}>
                    {agent.dejaPaye ? "Payé" : "Non payé"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                {searchTerm ? "Aucun agent ne correspond à votre recherche" : 
                 paymentFilter !== 'all' ? `Aucun agent ${paymentFilter === 'paid' ? 'payé' : 'non payé'} trouvé` : 
                 "Aucun agent trouvé"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AgentList;