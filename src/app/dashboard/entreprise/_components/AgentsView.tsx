"use client";
import React, { useState } from 'react';
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
import PaginationControls from './PaginationControlsProps';
import { useRouter } from 'next/navigation';

interface Agent {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse?: string;
  role: string;
  isActive: boolean;
  dateCreation?: string;
  entrepriseId?: string;
}

interface AgentsViewProps {
  agents: Agent[];
  entrepriseId: string;
}

const ITEMS_PER_PAGE = 5;

const AgentsView: React.FC<AgentsViewProps> = ({ agents, entrepriseId }) => {
  const [showAgents, setShowAgents] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  // Pagination calculations
  const totalPages = Math.ceil(agents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, agents.length);
  const currentAgents = agents.slice(startIndex, endIndex);

  const toggleAgentsView = () => {
    setShowAgents(!showAgents);
  };

  const handleAgentClick = (agentId: string) => {
    // Navigate to agent details page
    router.push(`/dashboard/agents/${agentId}`);
  };

  return (
    <div className="p-6">
      {/* Button to toggle agents view */}
      <Button 
        onClick={toggleAgentsView}
        className="mb-6"
      >
        {showAgents ? "Masquer la liste des agents" : "Afficher la liste des agents"}
      </Button>

      {/* Agents list - only shown when showAgents is true */}
      {showAgents && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Liste des agents</h2>
            <Badge variant="outline" className="px-3 py-1">
              {agents.length} agent(s)
            </Badge>
          </div>

          <Table>
            <TableCaption>Liste complète des agents</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Prénom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Adresse</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentAgents.length > 0 ? (
                currentAgents.map((agent) => (
                  <TableRow
                    key={agent._id}
                    onClick={() => handleAgentClick(agent._id)}
                    className="cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <TableCell className="font-medium">{agent.nom}</TableCell>
                    <TableCell>{agent.prenom}</TableCell>
                    <TableCell>{agent.email}</TableCell>
                    <TableCell>{agent.telephone}</TableCell>
                    <TableCell>{agent.role}</TableCell>
                    <TableCell>
                      <Badge variant={agent.isActive ? "success" : "destructive"}>
                        {agent.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell>{agent.adresse || "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Aucun agent trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {agents.length > ITEMS_PER_PAGE && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsCount={agents.length}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AgentsView;