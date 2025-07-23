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
import { X, Trash2, Edit, Plus } from 'lucide-react';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import OtpInput from '../_Agent/OtpInput';


interface NiveauService {
  nom: string;
  tarif: number;
  _id?: string;
}

interface Service {
  _id: string;
  nomService: string;
  niveauxDisponibles?: NiveauService[];
  entrepriseId?: string;
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
  paiementsEffectues?: any[];
}

interface ClientDialogProps {
  client: Client | null;
  entrepriseId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedClient: any) => Promise<any>;
  onDelete?: (formData: any) => Promise<any>;
  onRemoveFromService?: (formData: any) => Promise<any>;
  onAddService?: (formData: any) => Promise<any>; // New prop for adding service
  verifyOtp: (formData: any) => Promise<any>;
  services?: Service[]; // Services disponibles
}

const ClientDialog: React.FC<ClientDialogProps> = ({ 
  client, 
  entrepriseId,
  isOpen, 
  onClose, 
  onUpdate,
  onDelete,
  onRemoveFromService,
  onAddService,
  verifyOtp,
  services = []
}) => {
  const router = useRouter();
  
  // États pour la gestion du formulaire
  const [formData, setFormData] = useState<Partial<Client>>({});
  
  // États pour la gestion des opérations
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRemovingFromService, setIsRemovingFromService] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedNiveauService, setSelectedNiveauService] = useState('');
  const [selectedServiceNiveaux, setSelectedServiceNiveaux] = useState<NiveauService[]>([]);
  const [isAddingService, setIsAddingService] = useState(false);

  // États pour la gestion de l'OTP
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [pendingChangeId, setPendingChangeId] = useState('');
  const [operationType, setOperationType] = useState<'update' | 'delete' | 'removeFromService' | 'addService'>('update');
  
  // Réinitialiser le formulaire lorsque le client change
  useEffect(() => {
    if (client) {
      setFormData({
        nom: client.nom || '',
        prenom: client.prenom || '',
        email: client.email || '',
        telephone: client.telephone || '',
        adresse: client.adresse || '',
        nin: client.nin || '',
      });
      setIsEditing(false);
      setShowOtpVerification(false);
      setOtpCode('');
      setPendingChangeId('');
      setOperationType('update');
      setSelectedServiceId('');
      setSelectedNiveauService('');
      setIsAddingService(false);
    }
  }, [client]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSelectedServiceId(selectedId);
    
    // Récupérer les niveaux disponibles pour ce service
    const selectedService = services.find(service => service._id === selectedId);
    if (selectedService && selectedService.niveauxDisponibles) {
      setSelectedServiceNiveaux(selectedService.niveauxDisponibles);
      setSelectedNiveauService(''); // Réinitialiser le niveau de service sélectionné
    } else {
      setSelectedServiceNiveaux([]);
    }
  };

  const handleNiveauServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedNiveauService(e.target.value);
  };
  
  // Gérer la mise à jour du client
  const handleUpdate = async () => {
    if (!client || !onUpdate) return;
    
    const updatedClient = {
      ...client,
      ...formData,
      clientId: client._id,
      entrepriseId: entrepriseId,
      serviceId: client.servicesChoisis?.[0]?._id
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
  
  // Gérer l'ajout d'un service au client
 // Gérer l'ajout d'un service au client
const handleAddService = async () => {
  if (!client || !onAddService || !selectedServiceId || !selectedNiveauService) {
    toast.error("Veuillez sélectionner un service et un niveau");
    return;
  }
  
  setIsAddingService(false); // Ferme le mode d'ajout de service
  
  try {
    setIsVerifying(true);
    setOperationType('addService');
    
    // Préparer les données pour l'ajout de service
    const addServiceData = {
      clientId: client._id,
      serviceId: selectedServiceId,
      niveauService: selectedNiveauService,
      entrepriseId: entrepriseId
    };
    
    console.log("Données d'ajout de service:", addServiceData);
    
    const result = await onAddService(addServiceData);
    
    if (!result) {
      toast.error("Erreur lors de l'ajout du service");
      setIsVerifying(false);
      return;
    }
    
    console.log("Résultat d'ajout de service:", result);
    
    // Vérifier tous les formats possibles de réponse OTP
    if (
      // Format standard
      (result.type === 'pending' && result.data?.pendingChangeId) ||
      // Format alternatif
      (result.pendingChangeId) ||
      // Format spécifique que vous avez partagé
      (result.message && result.message.includes("attente de validation") && result.pendingChangeId)
    ) {
      // Extraire le pendingChangeId selon le format de la réponse
      const pendingId = result.data?.pendingChangeId || result.pendingChangeId;
      
      // Si un OTP est nécessaire pour l'ajout de service
      setPendingChangeId(pendingId);
      setShowOtpVerification(true);
      toast.info(result.message || "Un code OTP a été envoyé à l'administrateur pour confirmer l'ajout du service");
      
      console.log("Mode OTP activé, pendingChangeId:", pendingId);
    } else if (result.type === 'success') {
      // Si l'ajout est réussi sans besoin d'OTP
      toast.success("Le service a été ajouté avec succès!");
      onClose();
      router.refresh();
    } else {
      // Cas d'erreur ou autre cas non géré
      toast.error(result.message || result.error || "Erreur lors de l'ajout du service");
    }
  } catch (error) {
    console.error("Error during service addition:", error);
    toast.error("Une erreur est survenue lors de l'ajout du service");
  } finally {
    setIsVerifying(false);
  }
};
  
  // Gérer la suppression définitive du client
  const handleDeleteClient = async () => {
    setIsDeleting(false); // Ferme la boîte de dialogue de confirmation
    
    if (!client || !onDelete) return;
    
    try {
      setIsVerifying(true);
      setOperationType('delete');
      
      // Préparer les données pour la suppression
      const deleteData = {
        clientId: client._id,
        entrepriseId: entrepriseId
      };
      
      const result = await onDelete(deleteData);
      
      console.log("Résultat de suppression:", result);
      
      if (!result) {
        toast.error("Erreur lors de la suppression");
        setIsVerifying(false);
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
    
    if (!client || !onRemoveFromService) return;
    
    try {
      setIsVerifying(true);
      setOperationType('removeFromService');
      setSelectedServiceId(serviceId);
      
      // Préparer les données pour la suppression du service
      const removeData = {
        clientId: client._id,
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
// Gérer la vérification OTP
const handleOtpVerification = async () => {
  if (!pendingChangeId) {
    console.error("Aucun identifiant de changement en attente");
    toast.error("Une erreur est survenue. Veuillez réessayer.");
    return;
  }

  if (!otpCode || otpCode.length !== 6) {
    toast.error("Veuillez entrer un code OTP valide à 6 chiffres");
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
      serviceId: ['removeFromService', 'addService'].includes(operationType) ? selectedServiceId : undefined,
      niveauService: operationType === 'addService' ? selectedNiveauService : undefined,
      entrepriseId: entrepriseId // Assurez-vous d'inclure l'entrepriseId
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
    
    // Vérifier tous les formats possibles de réponse de succès
    if (result.success || result.type === 'success' || result.status === 'success' || 
        (result.data && (result.data.type === 'success' || result.data.status === 'success'))) {
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
        case 'addService':
          successMessage = "Le service a été ajouté au client avec succès!";
          break;
        default:
          successMessage = "Opération réussie!";
      }
      
      toast.success(successMessage);
      
      // Fermer la boîte de dialogue et rafraîchir la page
      onClose();
      router.refresh();
    } else {
      // Gestion des erreurs
      const errorMsg = result.message || result.error || "Échec de la vérification OTP";
      toast.error(errorMsg);
      
      // Afficher les erreurs détaillées si disponibles
      if (result.errors) {
        Object.values(result.errors).forEach((errorArray: any) => {
          if (Array.isArray(errorArray)) {
            errorArray.forEach((error: string) => {
              toast.error(error);
            });
          }
        });
      }
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    toast.error("Échec de la vérification. Veuillez réessayer.");
  } finally {
    setIsVerifying(false);
  }
};
  // Fonctions pour afficher les boîtes de dialogue de confirmation
  const showDeleteConfirmation = () => {
    setIsDeleting(true);
  };
  
  const showRemoveFromServiceConfirmation = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setIsRemovingFromService(true);
  };

  // Fonction pour activer le mode d'ajout de service
  const toggleAddServiceMode = () => {
    setIsAddingService(!isAddingService);
    if (!isAddingService) {
      setSelectedServiceId('');
      setSelectedNiveauService('');
      setSelectedServiceNiveaux([]);
    }
  };

  if (!client) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open && !isVerifying) onClose();
      }}>
        <DialogContent className="sm:max-w-md">
          
          
          {showOtpVerification ? (
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
                    case 'addService': return "Vérification OTP - Ajout de service";
                    default: return "Vérification OTP";
                  }
                })()}
                description={(() => {
                  switch(operationType) {
                    case 'update': return "Un code OTP a été envoyé pour confirmer la modification du client.";
                    case 'delete': return "Un code OTP a été envoyé pour confirmer la suppression définitive.";
                    case 'removeFromService': return "Un code OTP a été envoyé pour confirmer le retrait du service.";
                    case 'addService': return "Un code OTP a été envoyé pour confirmer l'ajout du service.";
                    default: return "Un code de vérification à 6 chiffres a été envoyé à l'administrateur.";
                  }
                })()}
              />
            </div>
          ) : (
            <>
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
                      client.nom
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
                      client.prenom
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
                      client.email
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
                      client.telephone
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
                      client.adresse || "-"
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
                      client.nin || "-"
                    )}
                  </div>
                </div>

                {!isEditing && (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <div className="font-semibold text-right">Statut:</div>
                      <div className="col-span-3">
                        <Badge variant={client.estNouveau ? "default" : "secondary"}>
                          {client.estNouveau ? "Nouveau client" : "Client existant"}
                        </Badge>
                      </div>
                    </div>

                    {client.dateCreation && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <div className="font-semibold text-right">Date de création:</div>
                        <div className="col-span-3">
                          {new Date(client.dateCreation).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-4 items-start gap-4">
                      <div className="font-semibold text-right">Services:</div>
                      <div className="col-span-3">
                        {client.servicesChoisis && client.servicesChoisis.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {client.servicesChoisis.map((service, index) => (
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
                        
                        {/* Bouton pour ajouter un service */}
                        {onAddService && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={toggleAddServiceMode}
                          >
                            {isAddingService ? (
                              <>Annuler</>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-1" />
                                Ajouter un service
                              </>
                            )}
                          </Button>
                        )}
                        
                        {/* Formulaire d'ajout de service */}
                        {isAddingService && (
                          <div className="mt-4 p-3 border rounded-md bg-gray-50">
                            <h4 className="font-medium mb-2">Ajouter un service</h4>
                            
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="service-select">Service</Label>
                                <select
                                  id="service-select"
                                  className="w-full border border-gray-300 rounded-md p-2 mt-1"
                                  value={selectedServiceId}
                                  onChange={handleServiceChange}
                                >
                                  <option value="">Sélectionner un service</option>
                                  {Array.isArray(services) && services.length > 0 ? (
                                    services
                                      // Filtrer les services déjà sélectionnés
                                      .filter(service => 
                                        !client.servicesChoisis?.some(clientService => 
                                          clientService._id === service._id
                                        )
                                      )
                                      .map(service => (
                                        <option key={service._id} value={service._id}>
                                          {service.nomService}
                                        </option>
                                      ))
                                  ) : (
                                    <option value="" disabled>Aucun service disponible</option>
                                  )}
                                </select>
                              </div>
                              
                              {selectedServiceId && selectedServiceNiveaux.length > 0 && (
                                <div>
                                  <Label htmlFor="niveau-select">Niveau de service</Label>
                                  <select
                                    id="niveau-select"
                                    className="w-full border border-gray-300 rounded-md p-2 mt-1"
                                    value={selectedNiveauService}
                                    onChange={handleNiveauServiceChange}
                                  >
                                    <option value="">Sélectionner un niveau</option>
                                    {selectedServiceNiveaux.map((niveau, index) => (
                                      <option key={niveau._id || index} value={niveau.nom}>
                                        {niveau.nom} - {niveau.tarif} FCFA
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                              
                              <div className="flex justify-end mt-2">
                                <Button
                                  size="sm"
                                  onClick={handleAddService}
                                  disabled={!selectedServiceId || !selectedNiveauService}
                                >
                                  Ajouter
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 items-start gap-4">
                      <div className="font-semibold text-right">Paiements:</div>
                      <div className="col-span-3">
                        {client.paiementsEffectues && client.paiementsEffectues.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {client.paiementsEffectues.map((paiement, index) => (
                              <Badge key={index} variant="outline">
                                Paiement #{index + 1}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">Aucun paiement effectué</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              
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

export default ClientDialog;