// components/agent/AgentTransfersTab.tsx

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CreditCard } from 'lucide-react';
import { Agent, VirementRecu } from '@/app/lib/types'; // Adjust the import path as necessary

interface AgentTransfersTabProps {
  agent: Agent;
  onShowTransferDetails: (transfer: VirementRecu) => void;
}

const AgentTransfersTab: React.FC<AgentTransfersTabProps> = ({
  agent,
  onShowTransferDetails
}) => {
  
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    if (!status) return "default";
    
    if (status.includes('réussi') || status.includes('payé')) return "success";
    if (status.includes('échoué')) return "destructive";
    if (status.includes('attente')) return "warning";
    return "default";
  };

  const isValidTransfer = (transfer: VirementRecu) => {
    return transfer && (
      transfer.montant !== undefined || 
      transfer.datePaiement || 
      transfer.statut || 
      transfer.expediteur
    );
  };

  const getValidTransfers = () => {
    if (!agent?.virementsRecus || agent.virementsRecus.length === 0) return [];
    return agent.virementsRecus.filter(isValidTransfer);
  };

  const validTransfers = getValidTransfers();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Received transfers</h3>
      
      {validTransfers.length > 0 ? (
        <div className="space-y-2">
          {validTransfers.map((virement, index) => (
            <div 
              key={index} 
              className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onShowTransferDetails(virement)}
            >
              <div className="flex-1">
                <div className="font-medium">
                  {virement.montant !== undefined 
                    ? `${virement.montant.toLocaleString('fr-FR')} FCFA` 
                    : 'Amount not available'}
                </div>
                <div className="text-xs text-gray-500">
                  {virement.datePaiement 
                    ? formatDate(virement.datePaiement) 
                    : (virement.expediteur?.nom ? `From: ${virement.expediteur.nom}` : 'Details not available')}
                </div>
              </div>
              {virement.statut && (
                <Badge variant={getStatusBadgeVariant(virement.statut)}>
                  {virement.statut}
                </Badge>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500 border border-dashed rounded-md">
          <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <div className="font-medium">No transfers received</div>
          <div className="text-sm">This agent hasn't received any transfers yet</div>
        </div>
      )}
    </div>
  );
};

export default AgentTransfersTab;