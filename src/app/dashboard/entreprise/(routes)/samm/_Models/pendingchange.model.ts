export interface PendingChange {
    pendingChangeId: string;
    type: 'Agent' | 'Client';
    action: 'create' | 'update' | 'delete';
    updateType?: string;
    status: 'pending' | 'approved' | 'rejected';
    target: {
        nom: string;
        prenom: string;
        email: string;
    };
    changes: {
        nom: string,
        prenom: string,
        email: string,
        telephone: string,
        adresse: string,
        nin: string
      }
    service?: {
        nom: string;
        description: string;
    };
    createdAt: string;
    expiresAt: string;
    rejectionReason?: string;
}

export interface PendingChangesListProps {
    pendingChanges?: PendingChange[];
    isLoading?: boolean;
    error?: string | null;
    entrepriseId: string;
}