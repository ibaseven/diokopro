"use client";
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { X, Trash2, Edit, CreditCard, Calendar, Tag, User, ArrowDown, ArrowUp } from 'lucide-react';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import OtpInput from '../_Agent/OtpInput';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Interface for Buffer objects (often found in MongoDB)
interface BufferData {
  data: number[];
  type: string;
}

// Interface for expediteur/sender 
interface Expediteur {
  id: string;
  nom: string;
  prenom: string;
}

// Interface for entreprise
interface Entreprise {
  id: string;
}

// Interface for standard payment
interface Paiement {
  _id: string;
  paiementId?: string;
  montant: number;
  datePaiement: string;
  statut: string;
  expediteur?: Expediteur;
  entreprise?: Entreprise;
}

// Interface for transfers received
interface VirementRecu {
  _id: string;
  buffer?: BufferData;
  datePaiement?: string;
  montant?: number;
  paiementId?: string;
  statut?: string;
  expediteur?: Expediteur;
  entreprise?: Entreprise;
}

interface Service {
  _id: string;
  nomService: string;
}

interface Client {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse?: string;
  nin?: string;
  estNouveau: boolean;
  dateCreation?: string;
  entrepriseId?: string;
  servicesChoisis?: Service[];
  paiementsEffectues?: Paiement[];
  virementsRecus?: VirementRecu[];
}

interface ClientDialogProps {
  agent: Client | null;
  entrepriseId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedClient: any) => Promise<any>;
  onDelete?: (formData: any) => Promise<any>;
  onRemoveFromService?: (formData: any) => Promise<any>;
  verifyOtp: (formData: any) => Promise<any>;
}

const AgentDialog: React.FC<ClientDialogProps> = ({ 
  agent, 
  entrepriseId,
  isOpen, 
  onClose, 
  onUpdate,
  onDelete,
  onRemoveFromService,
  verifyOtp
}) => {
  const router = useRouter();
  
  // États pour la gestion du formulaire
  const [formData, setFormData] = useState<Partial<Client>>({});
  
  // États pour la gestion des opérations
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRemovingFromService, setIsRemovingFromService] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Paiement | null>(null);
  const [selectedTransfer, setSelectedTransfer] = useState<VirementRecu | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showTransferDetails, setShowTransferDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // États pour la gestion de l'OTP
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [pendingChangeId, setPendingChangeId] = useState('');
  const [operationType, setOperationType] = useState<'update' | 'delete' | 'removeFromService'>('update');
  
  // Réinitialiser le formulaire lorsque le client change
 // Update the useEffect hook to include setting activeTab to "profile" when isEditing changes
useEffect(() => {
  if (agent) {
    setFormData({
      nom: agent.nom || '',
      prenom: agent.prenom || '',
      email: agent.email || '',
      telephone: agent.telephone || '',
      adresse: agent.adresse || '',
      nin: agent.nin || '',
    });
    setIsEditing(false);
    setShowOtpVerification(false);
    setOtpCode('');
    setPendingChangeId('');
    setOperationType('update');
    setSelectedServiceId('');
    setSelectedPayment(null);
    setSelectedTransfer(null);
    setShowPaymentDetails(false);
    setShowTransferDetails(false);
    setActiveTab("profile");
  }
}, [agent]);

// Also add an effect to force profile tab when editing starts
useEffect(() => {
  if (isEditing) {
    setActiveTab("profile");
  }
}, [isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // Gérer la mise à jour du client
  const handleUpdate = async () => {
    if (!agent || !onUpdate) return;
    
    const updatedClient = {
      ...agent,
      ...formData,
      clientId: agent._id,
      entrepriseId: entrepriseId,
      serviceId: agent.servicesChoisis?.[0]?._id
    };
    
    try {
      setIsVerifying(true);
      setOperationType('update');
      const result = await onUpdate(updatedClient);
      
      if (!result) {
        console.error("Résultat de mise à jour indéfini");
        toast.error("Erreur lors de la mise à jour");
        setIsVerifying(false);
        return;
      }
      
      console.log("Résultat de mise à jour:", result);
      
      if (result.data?.pendingChangeId) {
        // Si nous avons un pendingChangeId, nous devons collecter un OTP
        setPendingChangeId(result.data.pendingChangeId);
        setIsEditing(false);
        setShowOtpVerification(true);
        toast.info(result.message || "Un code OTP a été envoyé à l'administrateur");
      } else if (result.type === 'success' || result.data?.type === 'success') {
        // Si la mise à jour est réussie sans besoin d'OTP
        toast.success("Le client a été mis à jour avec succès!");
        onClose();
        router.refresh();
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Error during update:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Gérer la suppression définitive du client
 // Gérer la suppression définitive du client
const handleDeleteClient = async () => {
  setIsDeleting(false); // Ferme la boîte de dialogue de confirmation
  
  if (!agent || !onDelete) return;
  
  try {
    setIsVerifying(true);
    setOperationType('delete');
    
    // Préparer les données pour la suppression en incluant à la fois clientId et agentId
    const deleteData = {
      clientId: agent._id,
      agentId: agent._id, // Ajout de l'agentId en plus du clientId
      entrepriseId: entrepriseId
    };
    
    console.log("Données de suppression:", deleteData);
    
    const result = await onDelete(deleteData);
    
    console.log("Résultat de suppression:", result);
    
    if (!result) {
      toast.error("Erreur lors de la suppression");
      setIsVerifying(false);
      return;
    }
    
    // Vérification d'erreurs spécifiques dans le résultat
    if (result.type === 'error' && result.errors) {
      // Si des erreurs spécifiques sont retournées, les afficher
      const errorMessages = Object.values(result.errors)
        .flat()
        .join(', ');
      toast.error(`Erreur: ${errorMessages}`);
      return;
    }
    
    if (result.type === 'pending' && result.data?.pendingChangeId) {
      // Si un OTP est nécessaire pour la suppression
      setPendingChangeId(result.data.pendingChangeId);
      setShowOtpVerification(true);
      toast.info(result.message || "Un code OTP a été envoyé à l'administrateur pour confirmer la suppression");
    } else if (result.type === 'success') {
      // Si la suppression est réussie sans besoin d'OTP
      toast.success("Le client a été supprimé avec succès!");
      onClose();
      router.refresh();
    } else {
      // Pour tout autre type d'erreur non spécifique
      toast.error(result.message || "Erreur lors de la suppression");
    }
  } catch (error) {
    console.error("Error during delete:", error);
    toast.error("Une erreur est survenue lors de la suppression");
  } finally {
    setIsVerifying(false);
  }
};
  
  // Gérer la suppression du client d'un service
  const handleRemoveFromService = async (serviceId: string) => {
    setIsRemovingFromService(false); // Ferme la boîte de dialogue de confirmation
    
    if (!agent || !onRemoveFromService) return;
    
    try {
      setIsVerifying(true);
      setOperationType('removeFromService');
      setSelectedServiceId(serviceId);
      
      // Préparer les données pour la suppression du service
      const removeData = {
        clientId: agent._id,
        serviceId: serviceId,
        entrepriseId: entrepriseId
      };
      
      const result = await onRemoveFromService(removeData);
      
      console.log("Résultat de suppression du service:", result);
      
      if (!result) {
        toast.error("Erreur lors de la suppression du service");
        setIsVerifying(false);
        return;
      }
      
      if (result.type === 'pending' && result.data?.pendingChangeId) {
        // Si un OTP est nécessaire pour la suppression du service
        setPendingChangeId(result.data.pendingChangeId);
        setShowOtpVerification(true);
        toast.info(result.message || "Un code OTP a été envoyé à l'administrateur pour confirmer la suppression du service");
      } else if (result.type === 'success') {
        // Si la suppression est réussie sans besoin d'OTP
        toast.success("Le client a été retiré du service avec succès!");
        onClose();
        router.refresh();
      } else {
        toast.error(result.message || "Erreur lors de la suppression du service");
      }
    } catch (error) {
      console.error("Error during service removal:", error);
      toast.error("Une erreur est survenue lors de la suppression du service");
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Gérer la vérification OTP
  const handleOtpVerification = async () => {
    if (!pendingChangeId) {
      console.error("Aucun identifiant de changement en attente");
      toast.error("Une erreur est survenue. Veuillez réessayer.");
      return;
    }

    setIsVerifying(true);
    try {
      // Préparer les données pour la vérification OTP
      const otpData = {
        otp: otpCode,
        code: otpCode, // Garder "code" également au cas où
        pendingChangeId: pendingChangeId,
        actionType: operationType,
        serviceId: operationType === 'removeFromService' ? selectedServiceId : undefined
      };
      
      console.log("Vérification OTP avec:", otpData);
      
      // Appeler la fonction de vérification OTP
      const result = await verifyOtp(otpData);
      
      // Vérifier si le résultat existe
      if (!result) {
        console.error("Résultat de vérification OTP indéfini");
        toast.error("Échec de la vérification OTP");
        return;
      }
      
      console.log("Résultat de vérification OTP:", result);
      
      if (result.type === 'success' || result.status === 'success') {
        let successMessage = "";
        
        switch(operationType) {
          case 'update':
            successMessage = "Le client a été mis à jour avec succès!";
            break;
          case 'delete':
            successMessage = "Le client a été supprimé avec succès!";
            break;
          case 'removeFromService':
            successMessage = "Le client a été retiré du service avec succès!";
            break;
          default:
            successMessage = "Opération réussie!";
        }
        
        toast.success(successMessage);
        
        // Fermer la boîte de dialogue et rafraîchir la page
        onClose();
        router.refresh();
      } else {
        toast.error(result.message || "Échec de la vérification OTP");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Échec de la vérification. Veuillez réessayer.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Gérer l'affichage des détails de paiement
  const handleShowPaymentDetails = (payment: Paiement) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
    setShowTransferDetails(false);
  };

  // Gérer l'affichage des détails de virement
  const handleShowTransferDetails = (transfer: VirementRecu) => {
    setSelectedTransfer(transfer);
    setShowTransferDetails(true);
    setShowPaymentDetails(false);
  };

  // Fonctions pour afficher les boîtes de dialogue de confirmation
  const showDeleteConfirmation = () => {
    setIsDeleting(true);
  };
  
  const showRemoveFromServiceConfirmation = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setIsRemovingFromService(true);
  };

  // Formater la date
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
      return "Date invalide";
    }
  };

  // Obtenir la classe CSS en fonction du statut du paiement
  const getStatusBadgeVariant = (status: string) => {
    if (!status) return "default";
    
    if (status.includes('réussi') || status.includes('payé')) return "success";
    if (status.includes('échoué')) return "destructive";
    if (status.includes('attente')) return "warning";
    return "default";
  };

  // Vérifie si un virement est valide (a des données significatives)
  const isValidTransfer = (transfer: VirementRecu) => {
    return transfer && (
      transfer.montant !== undefined || 
      transfer.datePaiement || 
      transfer.statut || 
      transfer.expediteur
    );
  };

  // Pour afficher les détails du virement
  const renderTransferDetails = (transfer: VirementRecu) => {
    if (!transfer) return null;
    
    return (
      <div className="grid gap-4 py-4">
        {transfer.montant !== undefined && (
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-500" />
            <div className="font-semibold">Montant:</div>
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
            <div className="font-semibold">Statut:</div>
            <Badge variant={getStatusBadgeVariant(transfer.statut)}>
              {transfer.statut}
            </Badge>
          </div>
        )}
        
        {transfer.expediteur && (
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            <div className="font-semibold">Expéditeur:</div>
            <div>
              {transfer.expediteur.nom} {transfer.expediteur.prenom}
            </div>
          </div>
        )}
        
        {transfer.paiementId && (
          <div className="flex items-center gap-2">
            <div className="font-semibold">ID Paiement:</div>
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
    );
  };

  // Filtrer les virements valides (avec des données)
  const getValidTransfers = () => {
    if (!agent?.virementsRecus || agent.virementsRecus.length === 0) return [];
    return agent.virementsRecus.filter(isValidTransfer);
  };

  // Compter les items dans les onglets
  const paymentsCount = agent?.paiementsEffectues?.length || 0;
  const transfersCount = getValidTransfers().length;

  if (!agent) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open && !isVerifying) onClose();
      }}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          {/* Affichage des détails de paiement */}
          {showPaymentDetails && selectedPayment ? (
            <>
              <DialogHeader>
                <DialogTitle>Détails du paiement</DialogTitle>
                <DialogDescription>
                  Informations sur le paiement effectué
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  <div className="font-semibold">Montant:</div>
                  <div>{selectedPayment.montant.toLocaleString('fr-FR')} FCFA</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div className="font-semibold">Date:</div>
                  <div>{formatDate(selectedPayment.datePaiement)}</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-gray-500" />
                  <div className="font-semibold">Statut:</div>
                  <Badge variant={getStatusBadgeVariant(selectedPayment.statut)}>
                    {selectedPayment.statut}
                  </Badge>
                </div>
                
                {selectedPayment.expediteur && (
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <div className="font-semibold">Expéditeur:</div>
                    <div>
                      {selectedPayment.expediteur.nom} {selectedPayment.expediteur.prenom}
                    </div>
                  </div>
                )}
                
                {selectedPayment.paiementId && (
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">ID Paiement:</div>
                    <div className="text-xs text-gray-500 truncate max-w-[200px]">
                      {selectedPayment.paiementId}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-4">
                <Button onClick={() => setShowPaymentDetails(false)}>
                  Retour
                </Button>
              </div>
            </>
          ) : showTransferDetails && selectedTransfer ? (
            <>
              <DialogHeader>
                <DialogTitle>Détails du virement</DialogTitle>
                <DialogDescription>
                  Informations sur le virement reçu
                </DialogDescription>
              </DialogHeader>
              
              {renderTransferDetails(selectedTransfer)}
              
              <div className="flex justify-end mt-4">
                <Button onClick={() => setShowTransferDetails(false)}>
                  Retour
                </Button>
              </div>
            </>
          ) : showOtpVerification ? (
            <div>
              <OtpInput
                length={6}
                onComplete={(code) => {
                  // Mettre à jour uniquement le code OTP sans appeler automatiquement handleOtpVerification
                  setOtpCode(code);
                }}
                // Ajouter cette propriété pour séparer la soumission de la complétion
                onSubmit={handleOtpVerification}
                disabled={isVerifying}
                isLoading={isVerifying}
                title={(() => {
                  switch(operationType) {
                    case 'update': return "Vérification OTP - Modification";
                    case 'delete': return "Vérification OTP - Suppression";
                    case 'removeFromService': return "Vérification OTP - Retrait du service";
                    default: return "Vérification OTP";
                  }
                })()}
                description={(() => {
                  switch(operationType) {
                    case 'update': return "Un code OTP a été envoyé pour confirmer la modification du client.";
                    case 'delete': return "Un code OTP a été envoyé pour confirmer la suppression définitive.";
                    case 'removeFromService': return "Un code OTP a été envoyé pour confirmer le retrait du service.";
                    default: return "Un code de vérification à 6 chiffres a été envoyé à l'administrateur.";
                  }
                })()}
              />
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Détails du Gerant</DialogTitle>
                <DialogDescription>
                  {agent.nom} {agent.prenom}
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="profile" 
  className="w-full" 
  value={activeTab} 
  onValueChange={(value) => {
    // Only allow tab changes if not in editing mode
    if (!isEditing) {
      setActiveTab(value);
    }
  }}>
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="profile">Profil</TabsTrigger>
                  <TabsTrigger value="transfers" className="relative">
                    Virements
                    {transfersCount > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1">{transfersCount}</Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="mt-0">
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <div className="font-semibold text-right">Nom:</div>
                      <div className="col-span-3">
                        {isEditing ? (
                          <Input
                            name="nom"
                            value={formData.nom || ''}
                            onChange={handleInputChange}
                          />
                        ) : (
                          agent.nom
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <div className="font-semibold text-right">Prénom:</div>
                      <div className="col-span-3">
                        {isEditing ? (
                          <Input
                            name="prenom"
                            value={formData.prenom || ''}
                            onChange={handleInputChange}
                          />
                        ) : (
                          agent.prenom
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <div className="font-semibold text-right">Email:</div>
                      <div className="col-span-3">
                        {isEditing ? (
                          <Input
                            name="email"
                            value={formData.email || ''}
                            onChange={handleInputChange}
                          />
                        ) : (
                          agent.email
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <div className="font-semibold text-right">Téléphone:</div>
                      <div className="col-span-3">
                        {isEditing ? (
                          <Input
                            name="telephone"
                            value={formData.telephone || ''}
                            onChange={handleInputChange}
                          />
                        ) : (
                          agent.telephone
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <div className="font-semibold text-right">Adresse:</div>
                      <div className="col-span-3">
                        {isEditing ? (
                          <Input
                            name="adresse"
                            value={formData.adresse || ''}
                            onChange={handleInputChange}
                          />
                        ) : (
                          agent.adresse || "-"
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <div className="font-semibold text-right">NIN:</div>
                      <div className="col-span-3">
                        {isEditing ? (
                          <Input
                            name="nin"
                            value={formData.nin || ''}
                            onChange={handleInputChange}
                          />
                        ) : (
                          agent.nin || "-"
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <div className="font-semibold text-right">Statut:</div>
                      <div className="col-span-3">
                        <Badge variant={agent.estNouveau ? "default" : "secondary"}>
                          {agent.estNouveau ? "Nouveau client" : "Client existant"}
                        </Badge>
                      </div>
                    </div>

                    {agent.dateCreation && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <div className="font-semibold text-right">Date de création:</div>
                        <div className="col-span-3">
                          {new Date(agent.dateCreation).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-4 items-start gap-4">
                      <div className="font-semibold text-right">Services:</div>
                      <div className="col-span-3">
                        {agent.servicesChoisis && agent.servicesChoisis.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {agent.servicesChoisis.map((service, index) => (
                              <div key={index} className="flex items-center gap-1 mb-1">
                                <Badge variant="secondary">
                                  {service.nomService}
                                </Badge>
                                {onRemoveFromService && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => showRemoveFromServiceConfirmation(service._id)}
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Retirer
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">Aucun service choisi</span>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

               
                
                <TabsContent value="transfers" className="mt-0">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Virements reçus</h3>
                    {getValidTransfers().length > 0 ? (
                      <div className="space-y-2">
                        {getValidTransfers().map((virement, index) => (
                          <div 
                            key={index} 
                            className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleShowTransferDetails(virement)}
                          >
                            <ArrowDown className={`h-4 w-4 ${virement.statut?.includes('échoué') ? 'text-red-500' : 'text-green-500'}`} />
                            <div className="flex-1">
                              <div className="font-medium">
                                {virement.montant !== undefined 
                                  ? `${virement.montant.toLocaleString('fr-FR')} FCFA` 
                                  : 'Montant non disponible'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {virement.datePaiement 
                                  ? formatDate(virement.datePaiement) 
                                  : (virement.expediteur?.nom ? `De: ${virement.expediteur.nom}` : 'Détails non disponibles')}
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
                        Aucun virement reçu
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-between mt-4 gap-2">
                {!isEditing && onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={showDeleteConfirmation}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                )}
                
                <div className="ml-auto flex gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleUpdate} disabled={isVerifying}>
                        {isVerifying ? "Enregistrement..." : "Enregistrer"}
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue de confirmation pour la suppression définitive */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cela supprimera définitivement le client
              et toutes ses données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleting(false)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClient}
              className="bg-red-500 hover:bg-red-600"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Boîte de dialogue de confirmation pour le retrait d'un service */}
      <AlertDialog open={isRemovingFromService} onOpenChange={setIsRemovingFromService}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer du service</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir retirer ce client du service sélectionné ?
              Cette action nécessitera une vérification OTP.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsRemovingFromService(false)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleRemoveFromService(selectedServiceId)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Retirer du service
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AgentDialog;