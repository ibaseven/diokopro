"use client";
import React, { useState, useCallback } from 'react';
import { Toaster, toast } from "sonner";

import BalanceEntreprise from '../Balance/BalanceEntreprise';
import ServiceDialog from '../_services/ServiceDialog';
import ClientDialog from '../_clients/ClientDialog';
import AgentDialog from '../_Agent/AgentDialog';
import GerantDialog from '../_gerant/GerantDialog';
import { updateClient, deleteClient, removeClientFromService, addServiceToClient, addServiceToAgent, removeAgentFromService } from '@/actions/clientreq';
import { validateOTP } from '@/actions/service';
import { updatedGerant } from '@/actions/gerant';
import { deleteAgent, updatedAgent } from '@/actions/Agent';
import MetricsCards from './Components/MetricsCards';
import AgentsList from './Components/AgentsList';
import ClientsList from './Components/ClientsList';
import ServicesList from './Components/ServicesList';

const CombinedView = ({
    services,
    serviceId,
    balance,
    clients,
    agentNotTopayer,
    agentapayer,
    agents,
    gerants,
    clientNotTopayer,
    entrepriseId,
    nomEntreprise
}) => {
    // États pour les éléments sélectionnés
    const [selectedService, setSelectedService] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [selectedGerant, setSelectedGerant] = useState(null);

    // États pour les dialogues
    const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
    const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
    const [isAgentDialogOpen, setIsAgentDialogOpen] = useState(false);
    const [isGerantDialogOpen, setIsGerantDialogOpen] = useState(false);

    // Gestionnaires d'événements optimisés avec useCallback
    const handleServiceClick = useCallback((service) => {
        setSelectedService(service);
        setIsServiceDialogOpen(true);
    }, []);

    const handleClientClick = useCallback((client) => {
        setSelectedClient(client);
        setIsClientDialogOpen(true);
    }, []);

    const handleAgentClick = useCallback((agent) => {
        setSelectedAgent(agent);
        setIsAgentDialogOpen(true);
    }, []);

    const handleGerantClick = useCallback((gerant) => {
        setSelectedGerant(gerant);
        setIsGerantDialogOpen(true);
    }, []);
const handleAddServiceToAgent = useCallback(async (data) => {
    try {
        if (!data.agentId || !data.serviceId || !data.niveauService) {
            toast.error("Données de service invalides");
            return { type: 'error', error: "Données de service invalides" };
        }

        // S'assurer que l'entrepriseId est inclus
        const serviceData = {
            ...data,
            entrepriseId: entrepriseId
        };

        // Appeler l'action d'ajout de service pour agent
        // Vous devrez créer/importer cette fonction depuis vos actions
        const result = await addServiceToAgent(serviceData);
        
        console.log("Résultat de l'ajout de service à l'agent:", result);
        
        // Adapter la structure de réponse
        if (result.pendingChangeId) {
            return {
                type: 'pending',
                message: result.message || "Un code OTP a été envoyé à l'administrateur",
                data: {
                    pendingChangeId: result.pendingChangeId
                }
            };
        } else if (result.type === 'success') {
            toast.success(result.message || "Service ajouté avec succès");
        } else if (result.type === 'error') {
            toast.error(result.error || "Échec de l'ajout du service");
        }
        
        return result;
    } catch (error) {
        console.error("Erreur lors de l'ajout du service à l'agent:", error);
        toast.error("Une erreur est survenue lors de l'ajout du service");
        return { type: 'error', error: "Une erreur est survenue" };
    }
}, [entrepriseId]);
    // Gestion des mises à jour - optimisée avec useCallback pour éviter les re-créations de fonctions
    const handleUpdateClient = useCallback(async (updatedClient) => {
        try {
            if (!updatedClient || !updatedClient._id) {
                toast.error("Données du client invalides");
                return { type: 'error', error: "Données du client invalides" };
            }

            const clientData = {
                ...updatedClient,
                clientId: updatedClient._id,
                entrepriseId: entrepriseId,
                serviceId: updatedClient.servicesChoisis?.[0]?._id
            };

            const result = await updateClient(clientData);
            if (result.type === 'success') {
                toast.success(result.message || "Client mis à jour avec succès");
            } else if (result.type === 'error') {
                toast.error(result.error || "Échec de la mise à jour");
            }
            return result;
        } catch (error) {
            toast.error("Une erreur est survenue");
            return { type: 'error', error: "Une erreur est survenue" };
        }
    }, [entrepriseId]);

const handleAddServiceToClient = useCallback(async (data) => {
    try {
        if (!data.clientId || !data.serviceId || !data.niveauService) {
            toast.error("Données de service invalides");
            return { type: 'error', error: "Données de service invalides" };
        }

        // S'assurer que l'entrepriseId est inclus
        const serviceData = {
            ...data,
            entrepriseId: entrepriseId
        };

        // Appeler l'action d'ajout de service
        const result = await addServiceToClient(serviceData);
        
        console.log("Résultat de l'ajout de service:", result);
        
        // Adapter la structure de réponse pour correspondre à ce que ClientDialog attend
        if (result.pendingChangeId) {
            // Format de réponse que vous avez partagé
            return {
                type: 'pending',
                message: result.message || "Un code OTP a été envoyé à l'administrateur",
                data: {
                    pendingChangeId: result.pendingChangeId
                }
            };
        } else if (result.type === 'success') {
            toast.success(result.message || "Service ajouté avec succès");
        } else if (result.type === 'error') {
            toast.error(result.error || "Échec de l'ajout du service");
        }
        
        return result;
    } catch (error) {
        console.error("Erreur lors de l'ajout du service:", error);
        toast.error("Une erreur est survenue lors de l'ajout du service");
        return { type: 'error', error: "Une erreur est survenue" };
    }
}, [entrepriseId]);

    const handleUpdateAgent = useCallback(async (updateAgent) => {
        try {
            if (!updateAgent || !updateAgent._id) {
                toast.error("Données de l'agent invalides");
                return { type: 'error', error: "Données de l'agent invalides" };
            }

            const agentData = {
                ...updateAgent,
                agentId: updateAgent._id,
                entrepriseId: entrepriseId,
            };

            const result = await updatedAgent(agentData);
            if (result.type === 'success') {
                toast.success(result.message || "Agent mis à jour avec succès");
            } else if (result.type === 'error') {
                toast.error(result.error || "Échec de la mise à jour");
            }
            return result;
        } catch (error) {
            toast.error("Une erreur est survenue");
            return { type: 'error', error: "Une erreur est survenue" };
        }
    }, [entrepriseId]);

    const handleUpdateGerant = useCallback(async (updatedGerant) => {
        try {
            if (!updatedGerant || !updatedGerant._id) {
                toast.error("Données du gérant invalides");
                return { type: 'error', error: "Données du gérant invalides" };
            }

            const gerantData = {
                ...updatedGerant,
                agentId: updatedGerant._id,
                entrepriseId: entrepriseId,
            };

            const result = await updatedGerant(gerantData);
            if (result.type === 'success') {
                toast.success(result.message || "Gérant mis à jour avec succès");
            } else if (result.type === 'error') {
                toast.error(result.error || "Échec de la mise à jour");
            }
            return result;
        } catch (error) {
            toast.error("Une erreur est survenue");
            return { type: 'error', error: "Une erreur est survenue" };
        }
    }, [entrepriseId]);

    const handleUpdateService = useCallback((updatedService) => {
        // Si vous avez une fonction pour mettre à jour les services, l'intégrer ici
        console.log("Updating service:", updatedService);
        setIsServiceDialogOpen(false);
    }, []);

    const handleVerifyClientOtp = useCallback(async (formData) => {
        try {
            const { code, pendingChangeId } = formData;

            if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
                return {
                    type: 'error',
                    error: "Le code OTP doit contenir exactement 6 chiffres"
                };
            }

            const changeId = String(pendingChangeId);
            const result = await validateOTP(changeId, code, entrepriseId);

            if (result && result.success) {
                return {
                    type: 'success',
                    message: result.data?.message || "Validation réussie"
                };
            } else {
                let errorMsg = "Échec de la vérification OTP";

                if (result?.error) {
                    errorMsg = result.error;
                } else if (result?.errors) {
                    if (result.errors.otp && result.errors.otp.length > 0) {
                        errorMsg = result.errors.otp[0];
                    } else if (result.errors.pendingChangeId && result.errors.pendingChangeId.length > 0) {
                        errorMsg = result.errors.pendingChangeId[0];
                    }
                }

                return { type: 'error', error: errorMsg };
            }
        } catch (error) {
            return {
                type: 'error',
                error: error.message || "Échec de la vérification OTP"
            };
        }
    }, [entrepriseId]);

    const handleRemoveClientFromService = useCallback(async (formData) => {
        try {
            const result = await removeClientFromService(formData);
            if (result.type === 'success') {
                toast.success(result.message || "Client retiré du service avec succès");
            } else if (result.type === 'error') {
                toast.error(result.error || "Échec du retrait du service");
            }
            return result;
        } catch (error) {
            toast.error('Une erreur est survenue lors du retrait du service');
            return { type: 'error', error: "Une erreur est survenue" };
        }
    }, []);

     const handleRemoveAgentFromService = useCallback(async (formData) => {
        try {
            const result = await removeAgentFromService(formData);
            if (result.type === 'success') {
                toast.success(result.message || "Client retiré du service avec succès");
            } else if (result.type === 'error') {
                toast.error(result.error || "Échec du retrait du service");
            }
            return result;
        } catch (error) {
            toast.error('Une erreur est survenue lors du retrait du service');
            return { type: 'error', error: "Une erreur est survenue" };
        }
    }, []);

    const handleDeleteClient = useCallback(async (formData) => {
        try {
            const result = await deleteClient(formData);
            if (result.type === 'success') {
                toast.success(result.message || "Client supprimé avec succès");
                setIsClientDialogOpen(false);
            } else if (result.type === 'error') {
                toast.error(result.error || "Échec de la suppression");
            }
            return result;
        } catch (error) {
            toast.error('Une erreur est survenue lors de la suppression');
            return { type: 'error', error: "Une erreur est survenue" };
        }
    }, []);

    const handleDeleteAgent = useCallback(async (formData) => {
        try {
            const result = await deleteAgent(formData);
            if (result.type === 'success') {
                toast.success(result.message || "Agent supprimé avec succès");
                setIsAgentDialogOpen(false);
            } else if (result.type === 'error') {
                toast.error(result.error || "Échec de la suppression");
            }
            return result;
        } catch (error) {
            toast.error('Une erreur est survenue lors de la suppression');
            return { type: 'error', error: "Une erreur est survenue" };
        }
    }, []);

    return (
        <div className="p-2">
            <Toaster position="top-center" />

            {/* Section des métriques */}
            <MetricsCards 
                agentsCount={agents.length} 
                clientsCount={clients.length} 
                servicesCount={services.length} 
                entrepriseId={entrepriseId}
                nomEntreprise={nomEntreprise}
                services={services}
            />

            {/* Section principale avec les listes */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    {/* Liste des Agents */}
                    <AgentsList 
                        agents={agents} 
                        onAgentClick={handleAgentClick} 
                    />

                    {/* Liste des Clients */}
                    <ClientsList 
                        clients={clients} 
                        onClientClick={handleClientClick} 
                    />
                </div>

                {/* Panneau latéral avec services */}
                <div className='mt-[-175px] space-y-6 lg:w-[300px]'>
                    <div className="col-span-1">
                        <BalanceEntreprise balances={balance} entrepriseId={entrepriseId}
       />
                    </div>
                    <div className="space-y-6">
                        {/* Liste des Services */}
                        <ServicesList 
                            services={services} 
                            onServiceClick={handleServiceClick} 
                        />
                    </div>
                </div>
            </div>

            {/* Dialogs pour chaque type d'entité */}
            {isServiceDialogOpen && (
                <ServiceDialog
                    service={selectedService}
                    isOpen={isServiceDialogOpen}
                    onClose={() => setIsServiceDialogOpen(false)}
                    onUpdate={handleUpdateService}
                />
            )}

            {isClientDialogOpen && (
                <ClientDialog
                    client={selectedClient}
                    entrepriseId={entrepriseId}
                    isOpen={isClientDialogOpen}
                    onClose={() => setIsClientDialogOpen(false)}
                    onUpdate={handleUpdateClient}
                    onDelete={handleDeleteClient}
                    onRemoveFromService={handleRemoveClientFromService}
                    onAddService={handleAddServiceToClient}
                    verifyOtp={handleVerifyClientOtp}
                    services={services}
                />
            )}

            {isAgentDialogOpen && (
                <AgentDialog
                    agent={selectedAgent}
                    isOpen={isAgentDialogOpen}
                    onClose={() => setIsAgentDialogOpen(false)}
                    onUpdate={handleUpdateAgent}
                    onDelete={handleDeleteAgent}
                    verifyOtp={handleVerifyClientOtp}
                    entrepriseId={entrepriseId}
                     onRemoveFromService={handleRemoveAgentFromService}
                    services={services}
                     onAddService={handleAddServiceToAgent}
                />
            )}

            {isGerantDialogOpen && (
                <GerantDialog
                    gerant={selectedGerant}
                    isOpen={isGerantDialogOpen}
                    entrepriseId={entrepriseId}
                    onClose={() => setIsGerantDialogOpen(false)}
                    onUpdate={handleUpdateGerant}
                    onDelete={handleDeleteClient}
                    verifyOtp={handleVerifyClientOtp}
                />
            )}
        </div>
    );
};

export default CombinedView;