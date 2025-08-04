// components/agent/AgentTransferDetails.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar, Tag, User } from 'lucide-react';
import { VirementRecu } from '@/app/lib/types';


interface AgentTransferDetailsProps {
  transfer: VirementRecu;
  onBack: () => void;
}

const AgentTransferDetails: React.FC<AgentTransferDetailsProps> = ({
  transfer,
  onBack
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

  return (
    <>
      <div className="grid gap-4 py-4">
        {transfer.montant !== undefined && (
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-500" />
            <div className="font-semibold">Amount:</div>
            <div>{transfer.montant.toLocaleString('fr-FR')} FCFA</div>
          </div>
        )}
        
        {transfer.datePaiement && (
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div className="font-semibold">Date:</div>
            <div>{formatDate(transfer.datePaiement)}</div>
          </div>
        )}
        
        {transfer.statut && (
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-gray-500" />
            <div className="font-semibold">Status:</div>
            <Badge variant={getStatusBadgeVariant(transfer.statut)}>
              {transfer.statut}
            </Badge>
          </div>
        )}
        
        {transfer.expediteur && (
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            <div className="font-semibold">Sender:</div>
            <div>
              {transfer.expediteur.nom} {transfer.expediteur.prenom}
            </div>
          </div>
        )}
        
        {transfer.paiementId && (
          <div className="flex items-center gap-2">
            <div className="font-semibold">Payment ID:</div>
            <div className="text-xs text-gray-500 truncate max-w-[200px]">
              {transfer.paiementId}
            </div>
          </div>
        )}
        
        {transfer._id && (
          <div className="flex items-center gap-2">
            <div className="font-semibold">ID:</div>
            <div className="text-xs text-gray-500 truncate max-w-[200px]">
              {transfer._id}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-end mt-4">
        <Button onClick={onBack}>
          Back
        </Button>
      </div>
    </>
  );
};

export default AgentTransferDetails;