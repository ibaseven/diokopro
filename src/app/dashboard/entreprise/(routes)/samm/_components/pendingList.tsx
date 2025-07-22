"use client";

import React, { useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ValidateChangeDialog from './ValidateChangeDialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { PendingChange, PendingChangesListProps } from '../_Models/pendingchange.model';
import RejectChangeDialog from './ RejectChangeDialog';


const PendingChangesList: React.FC<PendingChangesListProps> = ({
    pendingChanges = [],
    entrepriseId,
    isLoading = false,
    error = null,
}) => {
    const [selectedChange, setSelectedChange] = useState<PendingChange | null>(null);
    const [isValidateOpen, setIsValidateOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('fr-FR');
    };

    const getStatusBadgeStyles = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-700';
            case 'approved':
                return 'bg-green-100 text-green-700';
            case 'rejected':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getActionBadgeStyles = (action: string) => {
        switch (action) {
            case 'create':
                return 'bg-blue-100 text-blue-700';
            case 'update':
                return 'bg-purple-100 text-purple-700';
            case 'delete':
                return 'bg-orange-100 text-orange-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
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
    
    // Calculate pagination
    const totalPages = Math.ceil(pendingChanges.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = pendingChanges.slice(indexOfFirstItem, indexOfLastItem);
    
    // Handle page navigation
    const goToNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };
    
    const goToPreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    return (
        <>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Demandes de Modifications en Attente</h1>
                <Table>
                    <TableCaption>Liste des demandes de modifications.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Utilisateur Concerné</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Date de Création</TableHead>
                            <TableHead>Expire le</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentItems.map((change) => (
                            <TableRow key={change.pendingChangeId} className="hover:bg-gray-100 transition-colors">
                                <TableCell>
                                    <Badge variant="outline">{change.type}</Badge>
                                </TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-sm ${getActionBadgeStyles(change.action)}`}>
                                        {change.action}
                                        {change.updateType && ` - ${change.updateType}`}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {`${change.changes.prenom} ${change.changes.nom}`}
                                    <br />
                                    <span className="text-sm text-gray-500">{change.changes.email}</span>
                                </TableCell>
                                <TableCell>{change.service?.description || '-'}</TableCell>
                                <TableCell>{formatDate(change.createdAt)}</TableCell>
                                <TableCell>{formatDate(change.expiresAt)}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-sm ${getStatusBadgeStyles(change.status)}`}>
                                        {change.status}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {change.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedChange(change);
                                                    setIsValidateOpen(true);
                                                }}
                                            >
                                                Valider
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700"
                                                onClick={() => {
                                                    setSelectedChange(change);
                                                    setIsRejectOpen(true);
                                                }}
                                            >
                                                Rejeter
                                            </Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-600">
                            Page {currentPage} sur {totalPages} ({pendingChanges.length} demandes)
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Précédent
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                            >
                                Suivant
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <ValidateChangeDialog
                isOpen={isValidateOpen}
                onClose={() => setIsValidateOpen(false)}
                selectedChange={selectedChange}
                entrepriseId={entrepriseId}
            />

            <RejectChangeDialog
                isOpen={isRejectOpen}
                onClose={() => setIsRejectOpen(false)}
                selectedChange={selectedChange}
                entrepriseId={entrepriseId}
            />
        </>
    );
};

export default PendingChangesList;