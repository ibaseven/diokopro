import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { X, Trash2, Edit, Plus, CreditCard, Calendar, Tag, User } from 'lucide-react';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import OtpInput from '../_Agent/OtpInput';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface Expediteur {
  id: string;
  nom: string;
  prenom: string;
}

interface Entreprise {
  id: string;
}

interface Paiement {
  _id: string;
  paiementId?: string;
  montant: number;
  datePaiement: string;
  statut: string;
  expediteur?: Expediteur;
  entreprise?: Entreprise;
}

interface VirementRecu {
  _id: string;
  datePaiement?: string;
  montant?: number;
  paiementId?: string;
  statut?: string;
  expediteur?: Expediteur;
  entreprise?: Entreprise;
}

interface Agent {
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
  servicesAffecte?: Service[];
  paiementsEffectues?: Paiement[];
  virementsRecus?: VirementRecu[];
}

interface AgentDialogProps {
  agent: Agent | null;
  entrepriseId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedAgent: any) => Promise<any>;
  onDelete?: (formData: any) => Promise<any>;
  onRemoveFromService?: (formData: any) => Promise<any>;
  onAddService?: (formData: any) => Promise<any>;
  verifyOtp: (formData: any) => Promise<any>;
  services?: Service[];
}

const AgentDialog: React.FC<AgentDialogProps> = ({ 
  agent, 
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
  
  // Form state
  const [formData, setFormData] = useState<Partial<Agent>>({});
  
  // Operation states
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRemovingFromService, setIsRemovingFromService] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedNiveauService, setSelectedNiveauService] = useState('');
  const [selectedServiceNiveaux, setSelectedServiceNiveaux] = useState<NiveauService[]>([]);
  const [isAddingService, setIsAddingService] = useState(false);
  
  // Payment and transfer states
  const [selectedPayment, setSelectedPayment] = useState<Paiement | null>(null);
  const [selectedTransfer, setSelectedTransfer] = useState<VirementRecu | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showTransferDetails, setShowTransferDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // OTP states
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [pendingChangeId, setPendingChangeId] = useState('');
  const [operationType, setOperationType] = useState<'update' | 'delete' | 'removeFromService' | 'addService'>('update');
  
  // Reset form when agent changes
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
      setSelectedNiveauService('');
      setIsAddingService(false);
      setSelectedPayment(null);
      setSelectedTransfer(null);
      setShowPaymentDetails(false);
      setShowTransferDetails(false);
      setActiveTab("profile");
    }
  }, [agent]);

  // Force profile tab when editing starts
  useEffect(() => {
    if (isEditing) {
      setActiveTab("profile");
    }
  }, [isEditing]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle service selection
  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSelectedServiceId(selectedId);
    
    // Get available levels for this service
    const selectedService = services.find(service => service._id === selectedId);
    if (selectedService && selectedService.niveauxDisponibles) {
      setSelectedServiceNiveaux(selectedService.niveauxDisponibles);
      setSelectedNiveauService(''); // Reset selected service level
    } else {
      setSelectedServiceNiveaux([]);
    }
  };

  // Handle service level selection
  const handleNiveauServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedNiveauService(e.target.value);
  };
  
  // Handle agent update
  const handleUpdate = async () => {
    if (!agent || !onUpdate) return;
    
    const updatedAgent = {
      ...agent,
      ...formData,
      agentId: agent._id,
      entrepriseId: entrepriseId,
      serviceId: agent.servicesAffecte?.[0]?._id
    };
    
    try {
      setIsVerifying(true);
      setOperationType('update');
      const result = await onUpdate(updatedAgent);
      
      if (!result) {
        console.error("Update result undefined");
        toast.error("Error updating agent");
        setIsVerifying(false);
        return;
      }
      
      console.log("Update result:", result);
      
      if (result.data?.pendingChangeId) {
        // If we have a pendingChangeId, we need to collect an OTP
        setPendingChangeId(result.data.pendingChangeId);
        setIsEditing(false);
        setShowOtpVerification(true);
        toast.info(result.message || "An OTP code has been sent to the administrator");
      } else if (result.type === 'success' || result.data?.type === 'success') {
        // If the update is successful without OTP
        toast.success("The agent has been updated successfully!");
        onClose();
        router.refresh();
      } else {
        toast.error(result.error || "Error during update");
      }
    } catch (error) {
      console.error("Error during update:", error);
      toast.error("An error occurred");
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Handle adding a service to the agent
  const handleAddService = async () => {
    if (!agent || !onAddService || !selectedServiceId || !selectedNiveauService) {
      toast.error("Please select a service and a level");
      return;
    }
    
    setIsAddingService(false); // Close service addition mode
    
    try {
      setIsVerifying(true);
      setOperationType('addService');
      
      // Prepare data for service addition
      const addServiceData = {
        agentId: agent._id,
        serviceId: selectedServiceId,
        niveauService: selectedNiveauService,
        entrepriseId: entrepriseId
      };
      
      console.log("Service addition data:", addServiceData);
      
      const result = await onAddService(addServiceData);
      
      if (!result) {
        toast.error("Error adding service");
        setIsVerifying(false);
        return;
      }
      
      console.log("Service addition result:", result);
      
      // Check all possible OTP response formats
      if (
        // Standard format
        (result.type === 'pending' && result.data?.pendingChangeId) ||
        // Alternative format
        (result.pendingChangeId) ||
        // Specific format
        (result.message && result.message.includes("attente de validation") && result.pendingChangeId)
      ) {
        // Extract pendingChangeId according to response format
        const pendingId = result.data?.pendingChangeId || result.pendingChangeId;
        
        // If OTP is needed for service addition
        setPendingChangeId(pendingId);
        setShowOtpVerification(true);
        toast.info(result.message || "An OTP code has been sent to the administrator to confirm service addition");
        
        console.log("OTP mode activated, pendingChangeId:", pendingId);
      } else if (result.type === 'success') {
        // If addition is successful without OTP
        toast.success("The service has been added successfully!");
        onClose();
        router.refresh();
      } else {
        // Error case or other unhandled case
        toast.error(result.message || result.error || "Error adding service");
      }
    } catch (error) {
      console.error("Error during service addition:", error);
      toast.error("An error occurred during service addition");
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Handle agent deletion
  const handleDeleteAgent = async () => {
    setIsDeleting(false); // Close confirmation dialog
    
    if (!agent || !onDelete) return;
    
    try {
      setIsVerifying(true);
      setOperationType('delete');
      
      // Prepare data for deletion
      const deleteData = {
        agentId: agent._id,
        entrepriseId: entrepriseId
      };
      
      const result = await onDelete(deleteData);
      
      console.log("Deletion result:", result);
      
      if (!result) {
        toast.error("Error during deletion");
        setIsVerifying(false);
        return;
      }
      
      // Check for specific errors in the result
      if (result.type === 'error' && result.errors) {
        // If specific errors are returned, display them
        const errorMessages = Object.values(result.errors)
          .flat()
          .join(', ');
        toast.error(`Error: ${errorMessages}`);
        return;
      }
      
      if (result.type === 'pending' && result.data?.pendingChangeId) {
        // If OTP is needed for deletion
        setPendingChangeId(result.data.pendingChangeId);
        setShowOtpVerification(true);
        toast.info(result.message || "An OTP code has been sent to the administrator to confirm deletion");
      } else if (result.type === 'success') {
        // If deletion is successful without OTP
        toast.success("The agent has been deleted successfully!");
        onClose();
        router.refresh();
      } else {
        // For any other non-specific error
        toast.error(result.message || "Error during deletion");
      }
    } catch (error) {
      console.error("Error during delete:", error);
      toast.error("An error occurred during deletion");
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Handle removing agent from a service
  const handleRemoveFromService = async (serviceId: string) => {
    setIsRemovingFromService(false); // Close confirmation dialog
    
    if (!agent || !onRemoveFromService) return;
    
    try {
      setIsVerifying(true);
      setOperationType('removeFromService');
      setSelectedServiceId(serviceId);
      
      // Prepare data for service removal
      const removeData = {
        agentId: agent._id,
        serviceId: serviceId,
        entrepriseId: entrepriseId
      };
      
      const result = await onRemoveFromService(removeData);
      
      console.log("Service removal result:", result);
      
      if (!result) {
        toast.error("Error during service removal");
        setIsVerifying(false);
        return;
      }
      
      if (result.type === 'pending' && result.data?.pendingChangeId) {
        // If OTP is needed for service removal
        setPendingChangeId(result.data.pendingChangeId);
        setShowOtpVerification(true);
        toast.info(result.message || "An OTP code has been sent to the administrator to confirm service removal");
      } else if (result.type === 'success') {
        // If removal is successful without OTP
        toast.success("The agent has been removed from the service successfully!");
        onClose();
        router.refresh();
      } else {
        toast.error(result.message || "Error during service removal");
      }
    } catch (error) {
      console.error("Error during service removal:", error);
      toast.error("An error occurred during service removal");
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Handle OTP verification
  const handleOtpVerification = async () => {
    if (!pendingChangeId) {
      console.error("No pending change identifier");
      toast.error("An error occurred. Please try again.");
      return;
    }

    if (!otpCode || otpCode.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP code");
      return;
    }

    setIsVerifying(true);
    try {
      // Prepare data for OTP verification
      const otpData = {
        otp: otpCode,
        code: otpCode,
        pendingChangeId: pendingChangeId,
        actionType: operationType,
        serviceId: ['removeFromService', 'addService'].includes(operationType) ? selectedServiceId : undefined,
        niveauService: operationType === 'addService' ? selectedNiveauService : undefined,
        entrepriseId: entrepriseId
      };
      
      console.log("OTP verification with:", otpData);
      
      // Call OTP verification function
      const result = await verifyOtp(otpData);
      
      // Check if result exists
      if (!result) {
        console.error("OTP verification result undefined");
        toast.error("OTP verification failed");
        return;
      }
      
      console.log("OTP verification result:", result);
      
      // Check all possible success response formats
      if (result.success || result.type === 'success' || result.status === 'success' || 
          (result.data && (result.data.type === 'success' || result.data.status === 'success'))) {
        let successMessage = "";
        
        switch(operationType) {
          case 'update':
            successMessage = "The agent has been updated successfully!";
            break;
          case 'delete':
            successMessage = "The agent has been deleted successfully!";
            break;
          case 'removeFromService':
            successMessage = "The agent has been removed from the service successfully!";
            break;
          case 'addService':
            successMessage = "The service has been added to the agent successfully!";
            break;
          default:
            successMessage = "Operation successful!";
        }
        
        toast.success(successMessage);
        
        // Close dialog and refresh page
        onClose();
        router.refresh();
      } else {
        // Error handling
        const errorMsg = result.message || result.error || "OTP verification failed";
        toast.error(errorMsg);
        
        // Display detailed errors if available
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
      toast.error("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle showing payment details
  const handleShowPaymentDetails = (payment: Paiement) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
    setShowTransferDetails(false);
  };

  // Handle showing transfer details
  const handleShowTransferDetails = (transfer: VirementRecu) => {
    setSelectedTransfer(transfer);
    setShowTransferDetails(true);
    setShowPaymentDetails(false);
  };

  // Functions to display confirmation dialogs
  const showDeleteConfirmation = () => {
    setIsDeleting(true);
  };
  
  const showRemoveFromServiceConfirmation = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setIsRemovingFromService(true);
  };

  // Function to activate service addition mode
  const toggleAddServiceMode = () => {
    setIsAddingService(!isAddingService);
    if (!isAddingService) {
      setSelectedServiceId('');
      setSelectedNiveauService('');
      setSelectedServiceNiveaux([]);
    }
  };

  // Format date
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

  // Get CSS class based on payment status
  const getStatusBadgeVariant = (status: string) => {
    if (!status) return "default";
    
    if (status.includes('réussi') || status.includes('payé')) return "success";
    if (status.includes('échoué')) return "destructive";
    if (status.includes('attente')) return "warning";
    return "default";
  };

  // Check if a transfer is valid (has significant data)
  const isValidTransfer = (transfer: VirementRecu) => {
    return transfer && (
      transfer.montant !== undefined || 
      transfer.datePaiement || 
      transfer.statut || 
      transfer.expediteur
    );
  };

  // To display transfer details
  const renderTransferDetails = (transfer: VirementRecu) => {
    if (!transfer) return null;
    
    return (
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
    );
  };

  // Filter valid transfers (with data)
  const getValidTransfers = () => {
    if (!agent?.virementsRecus || agent.virementsRecus.length === 0) return [];
    return agent.virementsRecus.filter(isValidTransfer);
  };

  // Count items in tabs
  const transfersCount = getValidTransfers().length;

  if (!agent) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open && !isVerifying) onClose();
      }}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          {/* Payment details display */}
          {showPaymentDetails && selectedPayment ? (
            <>
              <DialogHeader>
                <DialogTitle>Payment Details</DialogTitle>
                <DialogDescription>
                  Information about the payment made
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  <div className="font-semibold">Amount:</div>
                  <div>{selectedPayment.montant.toLocaleString('fr-FR')} FCFA</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div className="font-semibold">Date:</div>
                  <div>{formatDate(selectedPayment.datePaiement)}</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-gray-500" />
                  <div className="font-semibold">Status:</div>
                  <Badge variant={getStatusBadgeVariant(selectedPayment.statut)}>
                    {selectedPayment.statut}
                  </Badge>
                </div>
                
                {selectedPayment.expediteur && (
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <div className="font-semibold">Sender:</div>
                    <div>
                      {selectedPayment.expediteur.nom} {selectedPayment.expediteur.prenom}
                    </div>
                  </div>
                )}
                
                {selectedPayment.paiementId && (
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">Payment ID:</div>
                    <div className="text-xs text-gray-500 truncate max-w-[200px]">
                      {selectedPayment.paiementId}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-4">
                <Button onClick={() => setShowPaymentDetails(false)}>
                  Back
                </Button>
              </div>
            </>
          ) : showTransferDetails && selectedTransfer ? (
            <>
              <DialogHeader>
                <DialogTitle>Transfer Details</DialogTitle>
                <DialogDescription>
                  Information about the transfer received
                </DialogDescription>
              </DialogHeader>
              
              {renderTransferDetails(selectedTransfer)}
              
              <div className="flex justify-end mt-4">
                <Button onClick={() => setShowTransferDetails(false)}>
                  Back
                </Button>
              </div>
            </>
          ) : showOtpVerification ? (
            <div>
              <OtpInput
                length={6}
                onComplete={(code) => {
                  setOtpCode(code);
                }}
                onSubmit={handleOtpVerification}
                disabled={isVerifying}
                isLoading={isVerifying}
                title={(() => {
                  switch(operationType) {
                    case 'update': return "OTP Verification - Modification";
                    case 'delete': return "OTP Verification - Deletion";
                    case 'removeFromService': return "OTP Verification - Service Removal";
                    case 'addService': return "OTP Verification - Service Addition";
                    default: return "OTP Verification";
                  }
                })()}
                description={(() => {
                  switch(operationType) {
                    case 'update': return "An OTP code has been sent to confirm agent modification.";
                    case 'delete': return "An OTP code has been sent to confirm permanent deletion.";
                    case 'removeFromService': return "An OTP code has been sent to confirm service removal.";
                    case 'addService': return "An OTP code has been sent to confirm service addition.";
                    default: return "A 6-digit verification code has been sent to the administrator.";
                  }
                })()}
              />
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Agent Details</DialogTitle>
                <DialogDescription>
                  {agent.nom} {agent.prenom}
                </DialogDescription>
              </DialogHeader>
              
              <Tabs 
                defaultValue="profile" 
                className="w-full" 
                value={activeTab} 
                onValueChange={(value) => {
                  if (!isEditing) {
                    setActiveTab(value);
                  }
                }}
              >
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="transfers" className="relative">
                    Transfers
                    {transfersCount > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1">{transfersCount}</Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="mt-0">
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <div className="font-semibold text-right">Last Name:</div>
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
                      <div className="font-semibold text-right">First Name:</div>
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
                      <div className="font-semibold text-right">Phone:</div>
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
                      <div className="font-semibold text-right">Address:</div>
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
                      <div className="font-semibold text-right">Status:</div>
                      <div className="col-span-3">
                        <Badge variant={agent.estNouveau ? "default" : "secondary"}>
                          {agent.estNouveau ? "New agent" : "Existing agent"}
                        </Badge>
                      </div>
                    </div>

                    {agent.dateCreation && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <div className="font-semibold text-right">Creation date:</div>
                        <div className="col-span-3">
                          {new Date(agent.dateCreation).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-4 items-start gap-4">
                      <div className="font-semibold text-right">Services:</div>
                      <div className="col-span-3">
                        {agent.servicesAffecte && agent.servicesAffecte.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {agent.servicesAffecte.map((service, index) => (
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
                                    Remove
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">No services selected</span>
                        )}
                        
                        {/* Service addition button */}
                        {onAddService && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={toggleAddServiceMode}
                          >
                            {isAddingService ? (
                              <>Cancel</>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-1" />
                                Add a service
                              </>
                            )}
                          </Button>
                        )}
                        
                        {/* Service addition form */}
                        {isAddingService && (
                          <div className="mt-4 p-3 border rounded-md bg-gray-50">
                            <h4 className="font-medium mb-2">Add a service</h4>
                            
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="service-select">Service</Label>
                                <select
                                  id="service-select"
                                  className="w-full border border-gray-300 rounded-md p-2 mt-1"
                                  value={selectedServiceId}
                                  onChange={handleServiceChange}
                                >
                                  <option value="">Select a service</option>
                                  {Array.isArray(services) && services.length > 0 ? (
                                    services
                                      // Filter out already selected services
                                      .filter(service => 
                                        !agent.servicesAffecte?.some(agentService => 
                                          agentService._id === service._id
                                        )
                                      )
                                      .map(service => (
                                        <option key={service._id} value={service._id}>
                                          {service.nomService}
                                        </option>
                                      ))
                                  ) : (
                                    <option value="" disabled>No services available</option>
                                  )}
                                </select>
                              </div>
                              
                              {selectedServiceId && selectedServiceNiveaux.length > 0 && (
                                <div>
                                  <Label htmlFor="niveau-select">Service level</Label>
                                  <select
                                    id="niveau-select"
                                    className="w-full border border-gray-300 rounded-md p-2 mt-1"
                                    value={selectedNiveauService}
                                    onChange={handleNiveauServiceChange}
                                  >
                                    <option value="">Select a level</option>
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
                                  Add
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="transfers" className="mt-0">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Received transfers</h3>
                    {getValidTransfers().length > 0 ? (
                      <div className="space-y-2">
                        {getValidTransfers().map((virement, index) => (
                          <div 
                            key={index} 
                            className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleShowTransferDetails(virement)}
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
                        No transfers received
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
                    Delete
                  </Button>
                )}
                
                <div className="ml-auto flex gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleUpdate} disabled={isVerifying}>
                        {isVerifying ? "Saving..." : "Save"}
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for permanent deletion */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is irreversible. It will permanently delete the agent
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleting(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAgent}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Confirmation dialog for service removal */}
      <AlertDialog open={isRemovingFromService} onOpenChange={setIsRemovingFromService}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this agent from the selected service?
              This action will require OTP verification.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsRemovingFromService(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleRemoveFromService(selectedServiceId)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Remove from service
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AgentDialog;