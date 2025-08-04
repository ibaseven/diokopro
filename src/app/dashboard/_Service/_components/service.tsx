"use client"

import React, { useState } from "react";
import { CircleX, Plus, Trash } from "lucide-react";
import { createService, validateOTP } from "@/actions/service";
import { toast } from "sonner";
import OtpInput from "../../entreprise/_components/_Agent/OtpInput";
import { Button } from "@/components/ui/button";

interface Enterprise {
  _id: string;
  nomEntreprise: string;
}

interface CreateServiceModalProps {
  enterprises: Enterprise[];
}

const CreateServiceModal = ({ enterprises }: CreateServiceModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [niveaux, setNiveaux] = useState([{ nom: "standard", tarif: "" }]);
  const [formData, setFormData] = useState({
    nomService: "",
    description: "",
    tarifactionBase: "",
  });
  
  // États pour la vérification OTP
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [pendingChangeId, setPendingChangeId] = useState("");
  const [errors, setErrors] = useState<{[key: string]: string[]}>({});

  // Utiliser le premier ID d'entreprise s'il existe, sinon utiliser une chaîne vide
  const enterpriseId = Array.isArray(enterprises) && enterprises.length > 0 
    ? enterprises[0]._id 
    : enterprises && enterprises._id 
      ? enterprises._id 
      : "";

  const addNiveau = () => {
    setNiveaux([...niveaux, { nom: "", tarif: 0 }]);
  };

  const removeNiveau = (index: number) => {
    if (niveaux.length > 1) {
      setNiveaux(niveaux.filter((_, i) => i !== index));
    } else {
      toast.error("Vous devez garder au moins un niveau de service");
    }
  };

  const updateNiveau = (index: number, field: "nom" | "tarif", value: string | number) => {
    const newNiveaux = [...niveaux];
    newNiveaux[index] = { ...newNiveaux[index], [field]: value };
    setNiveaux(newNiveaux);
  };

  const handleSubmit = async () => {
    // Réinitialiser les erreurs
    setErrors({});
    const newErrors: {[key: string]: string[]} = {};
    let hasErrors = false;

    // Vérification de chaque champ obligatoire
    if (!enterpriseId) {
      newErrors.enterprise = ["Aucune entreprise disponible"];
      hasErrors = true;
    }
    
    if (!formData.nomService || formData.nomService.trim() === "") {
      newErrors.nomService = ["Le nom du service est requis"];
      hasErrors = true;
    }
    
    if (!formData.description || formData.description.trim() === "") {
      newErrors.description = ["La description est requise"];
      hasErrors = true;
    }
    
    // Vérifier si au moins un niveau a un nom
    const hasValidLevel = niveaux.some(niveau => niveau.nom && niveau.nom.trim() !== "");
    if (!hasValidLevel) {
      newErrors.niveaux = ["Au moins un niveau doit avoir un nom valide"];
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);
    try {
     // console.log("Envoi des données pour création du service:", {...formData, niveaux, enterpriseId});
      const response = await createService(enterpriseId, {
        ...formData,
        niveauxDisponibles: niveaux,
      });
      //console.log("Réponse API création service:", response);

      // Gérer tous les cas possibles de réponse
      if (response.type === "success" && response.data?.pendingChangeId) {
        // Cas où le service a été créé mais nécessite une validation OTP
        toast.success("Demande de création envoyée ! Veuillez entrer le code OTP envoyé à l'administrateur");
       
        setPendingChangeId(response.data.pendingChangeId);
        setShowOtpVerification(true);
       // console.log("OTP Verification activée, pendingChangeId:", response.data.pendingChangeId);
      } else if (response.message && response.pendingChangeId) {
        // Format de réponse alternatif du middleware requireOTPValidation
        toast.success("Demande de création envoyée ! Veuillez entrer le code OTP envoyé à l'administrateur");
        setPendingChangeId(response.pendingChangeId);
        setShowOtpVerification(true);
        //console.log("OTP Verification activée, pendingChangeId:", response.pendingChangeId);
      } else if (response.type === "success") {
        // Cas où le service a été créé sans besoin de validation OTP
        toast.success("Service créé avec succès !");
        resetModal();
      } else if (response.errors) {
        // Cas d'erreurs de validation
        setErrors(response.errors);
        Object.values(response.errors).forEach((errorArray: any) => {
          errorArray.forEach((error: string) => {
            toast.error(error);
          });
        });
      } else {
        // Autres cas d'erreur
        toast.error(response.error || "Une erreur est survenue lors de la création du service");
      }
    } catch (error) {
      console.error("Erreur lors de la création du service:", error);
      toast.error("Une erreur inattendue est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otpCode || otpCode.length < 6) {
      toast.error("Veuillez entrer un code OTP valide à 6 chiffres");
      return;
    }

    if (!enterpriseId) {
      toast.error("Entreprise non disponible");
      return;
    }

    setIsLoading(true);
    try {
     // console.log("Validation OTP:", { pendingChangeId, otpCode, entrepriseId: enterpriseId });
      // Vérification OTP avec le pendingChangeId et l'entrepriseId
      const response = await validateOTP(pendingChangeId, otpCode, enterpriseId);
     // console.log("Réponse API validation OTP:", response);
      
      if (response.success) {
        toast.success("Service validé avec succès !");
        resetModal();
      } else {
        toast.error(response.error || "Code OTP invalide ou expiré");
        
        // Si des erreurs de validation sont présentes, les afficher
        if (response.errors) {
          Object.values(response.errors).forEach((errorArray: any) => {
            errorArray.forEach((error: string) => {
              toast.error(error);
            });
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors de la validation OTP:", error);
      toast.error("Échec de la vérification du code OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    await verifyOtp();
  };

  const resetModal = () => {
    setIsOpen(false);
    setShowOtpVerification(false);
    setOtpCode("");
    setPendingChangeId("");
    setFormData({ nomService: "", description: "", tarifactionBase: 0 });
    setNiveaux([{ nom: "standard", tarif: 0 }]);
    setErrors({});
  };

  // Fonction helper pour afficher les erreurs d'un champ
  const getFieldError = (fieldName: string) => {
    return errors[fieldName]?.length > 0 ? (
      <span className="text-red-500 text-sm mt-1">{errors[fieldName][0]}</span>
    ) : null;
  };

  return (
    <>
      {/* Cercle avec bordure orange et icône plus */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-orange-400 hover:border-orange-500 transition-colors duration-200 focus:outline-none"
        aria-label="Créer un service"
        type="button"
      >
        <Plus className="w-6 h-6 text-orange-500" strokeWidth={2} />
      </button>
     
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold mb-6">
                {showOtpVerification ? "Vérification du service" : "Créer un service"}
              </h2>
              <Button onClick={resetModal} className="text-gray-600 hover:text-gray-800">
                <CircleX className="w-6 h-6" />
              </Button>
            </div>

            {!showOtpVerification ? (
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-700">Nom du service <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.nomService} 
                    onChange={(e) => setFormData({ ...formData, nomService: e.target.value })} 
                    placeholder="Ex: Consultation juridique" 
                    className={`w-full border ${errors.nomService ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                    required
                  />
                  {errors.nomService?.length > 0 ? (
                    <span className="text-red-500 text-sm mt-1">{errors.nomService[0]}</span>
                  ) : (
                    <span className="text-xs text-gray-500 mt-1">Ce champ est obligatoire</span>
                  )}
                </div>

                <div>
                  <label className="block mb-1 font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
                  <textarea 
                    value={formData.description} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                    placeholder="Description détaillée du service" 
                    className={`w-full border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 min-h-[100px]`}
                    required
                  />
                  {errors.description?.length > 0 ? (
                    <span className="text-red-500 text-sm mt-1">{errors.description[0]}</span>
                  ) : (
                    <span className="text-xs text-gray-500 mt-1">Ce champ est obligatoire</span>
                  )}
                </div>

                <div>
                  <label className="block mb-1 font-medium text-gray-700">Tarif de base</label>
                  <input 
                    type="text" 
                    value={formData.tarifactionBase} 
                    onChange={(e) => setFormData({ ...formData, tarifactionBase: parseFloat(e.target.value) || 0 })} 
                    className="w-full border border-gray-300 rounded-md p-2" 
                    placeholder="Tarif de base" 
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-medium text-gray-700">Niveaux de service <span className="text-red-500">*</span></label>
                    <Button 
                      onClick={addNiveau} 
                      variant="outline"
                      className="text-blue-500 hover:text-blue-700 flex items-center text-xs h-8"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Ajouter un niveau
                    </Button>
                  </div>
                  
                  {errors.niveaux?.length > 0 && (
                    <span className="text-red-500 text-sm block mb-2">{errors.niveaux[0]}</span>
                  )}
                  
                  <div className="space-y-3 border border-gray-200 rounded-md p-3 bg-gray-50">
                    {niveaux.map((niveau, index) => (
                      <div key={index} className="flex gap-4 items-center">
                        <div className="flex-1">
                          <label className="text-xs text-gray-600 mb-1 block">Nom</label>
                          <input 
                            type="text" 
                            value={niveau.nom} 
                            onChange={(e) => updateNiveau(index, "nom", e.target.value)} 
                            placeholder="Ex: standard, premium..." 
                            className="border border-gray-300 rounded-md p-2 w-full text-sm" 
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-gray-600 mb-1 block">Tarif</label>
                          <input 
                            type="number" 
                            min="0" 
                            value={niveau.tarif} 
                            onChange={(e) => updateNiveau(index, "tarif", parseFloat(e.target.value) || 0)} 
                            className="border border-gray-300 rounded-md p-2 w-full text-sm" 
                            placeholder="0" 
                          />
                        </div>
                        <div className="pt-5">
                          <Button 
                            onClick={() => removeNiveau(index)} 
                            variant="outline"
                            className="text-red-500 hover:text-red-700 h-9 w-9 p-0 flex items-center justify-center"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block">Au moins un niveau est obligatoire</span>
                </div>

                <div className="flex justify-end mt-6">
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isLoading} 
                    className="px-6 py-2 bg-[#ee7606] hover:bg-[#d56a05] text-white rounded-md disabled:bg-opacity-70"
                  >
                    {isLoading ? "Chargement..." : "Créer"}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <OtpInput
                  length={6}
                  onComplete={(code) => {
                    setOtpCode(code);
                  }}
                  onSubmit={handleOtpVerification}
                  disabled={isLoading}
                  isLoading={isLoading}
                  title="Vérification OTP - Création du service"
                  description="Un code OTP a été envoyé pour confirmer la création du service. Veuillez saisir le code à 6 chiffres reçu par l'administrateur."
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CreateServiceModal;