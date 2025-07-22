"use client"

import React, { useState, useEffect } from "react";
import { CircleX, Plus, Mail } from "lucide-react";
import { createGerant } from "@/actions/gerant";
import { toast } from "sonner";
import { validateOTP } from "@/actions/service";
import { Button } from "@/components/ui/button";
import OtpInput from "../../entreprise/_components/_Agent/OtpInput";
import PhoneInput from "../../clientsPage/_components/phone";

interface Enterprise {
  _id: string;
  nomEntreprise: string;
}

interface CreateGerantModalProps {
  enterprises: Enterprise[];
  defaultEntrepriseId?: string; // ID d'entreprise par défaut, si disponible
}

const CreateGerantModal = ({ enterprises = [], defaultEntrepriseId = "" }: CreateGerantModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    telephone: "",
    entrepriseId: defaultEntrepriseId,
  });
  
  // Utiliser useEffect pour mettre à jour l'entrepriseId quand enterprises change
  useEffect(() => {
    // Si l'entrepriseId n'est pas défini et qu'il y a des entreprises disponibles, 
    // utiliser la première entreprise comme entreprise par défaut
    if (!formData.entrepriseId && enterprises.length > 0) {
      setFormData(prev => ({
        ...prev,
        entrepriseId: enterprises[0]._id
      }));
    }
    // Si defaultEntrepriseId est fourni, l'utiliser
    else if (defaultEntrepriseId && formData.entrepriseId !== defaultEntrepriseId) {
      setFormData(prev => ({
        ...prev,
        entrepriseId: defaultEntrepriseId
      }));
    }
  }, [enterprises, defaultEntrepriseId]);
  
  // États pour la vérification OTP
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [pendingChangeId, setPendingChangeId] = useState("");
  const [errors, setErrors] = useState<{[key: string]: string[]}>({});

  const handleSubmit = async () => {
    // Vérification des champs
    const newErrors: {[key: string]: string[]} = {};
    let hasErrors = false;

    if (!formData.nom || formData.nom.trim() === "") {
      newErrors.nom = ["Le nom est requis"];
      hasErrors = true;
    }
    
    if (!formData.prenom || formData.prenom.trim() === "") {
      newErrors.prenom = ["Le prénom est requis"];
      hasErrors = true;
    }
    
    if (!formData.email || formData.email.trim() === "") {
      newErrors.email = ["L'email est requis"];
      hasErrors = true;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = ["Format d'email invalide"];
      hasErrors = true;
    }
    
    if (!formData.password || formData.password.trim() === "") {
      newErrors.password = ["Le mot de passe est requis"];
      hasErrors = true;
    }
    
    if (!formData.telephone || formData.telephone.trim() === "") {
      newErrors.telephone = ["Le téléphone est requis"];
      hasErrors = true;
    }
    
    // Vérifier si une entreprise est sélectionnée
    if (!formData.entrepriseId) {
      // Si aucune entreprise n'est sélectionnée mais qu'il y en a de disponibles, utiliser la première
      if (enterprises.length > 0) {
        setFormData(prev => ({
          ...prev,
          entrepriseId: enterprises[0]._id
        }));
      } else {
        // Si aucune entreprise n'est disponible, afficher une erreur appropriée
        toast.error("Aucune entreprise disponible. Impossible de créer un gérant.");
        return;
      }
    }

    if (hasErrors) {
      setErrors(newErrors);
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    console.log(newErrors);

    setIsLoading(true);
    try {
      console.log("Envoi des données pour création du gérant:", formData);
      const response = await createGerant(formData);
      console.log("Réponse API création gérant:", response); // Debug log
  
      // Vérifier si la réponse inclut un ID de changement en attente (nécessitant une vérification OTP)
      if (
        (response.type === "success" && response.data?.pendingChangeId) || 
        (response.pendingChangeId)
      ) {
      
        const changeId = response.data?.pendingChangeId || response.pendingChangeId;
        toast.success("Demande de création envoyée ! Veuillez entrer le code OTP envoyé à l'administrateur");
        setPendingChangeId(changeId);
        setShowOtpVerification(true);
        console.log("OTP Verification activée, pendingChangeId:", changeId); // Debug log
      } else if (response.type === "success") {
        // Cas où le gérant a été créé sans besoin de validation OTP
        toast.success("Gérant créé avec succès !");
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
        toast.error(response.error || "Une erreur est survenue lors de la création du gérant");
        setErrors({ global: [response.error || "Une erreur est survenue"] });
      }
    } catch (error) {
      console.error("Erreur lors de la création du gérant:", error);
      toast.error("Une erreur inattendue est survenue");
      setErrors({ global: ["Une erreur inattendue est survenue"] });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (code: string) => {
    if (!code || code.length < 6) {
      toast.error("Veuillez entrer un code OTP valide à 6 chiffres");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Validation OTP:", { pendingChangeId, otpCode: code, entrepriseId: formData.entrepriseId });
      // Vérification OTP avec le pendingChangeId
      const response = await validateOTP(pendingChangeId, code, formData.entrepriseId);
      console.log("Réponse API validation OTP:", response); // Debug log
      
      if (response.success) {
        toast.success("Gérant validé avec succès !");
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
    await verifyOtp(otpCode);
  };

  const resetModal = () => {
    setIsOpen(false);
    setShowOtpVerification(false);
    setOtpCode("");
    setPendingChangeId("");
    setErrors({});
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      password: "",
      telephone: "",
      entrepriseId: defaultEntrepriseId || (enterprises.length > 0 ? enterprises[0]._id : ""),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: [] }));
  };

  // Fonction helper pour afficher les erreurs d'un champ
  const getFieldError = (fieldName: string) => {
    return errors[fieldName]?.length > 0 ? (
      <span className="text-red-500 text-sm mt-1">{errors[fieldName][0]}</span>
    ) : null;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-orange-400 hover:border-orange-500 transition-colors duration-200 focus:outline-none"
        aria-label="Créer un gérant"
        type="button"
      >
        <Plus className="w-6 h-6 text-orange-500" strokeWidth={2} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold mb-6">
                {showOtpVerification ? "Vérification du gérant" : "Créer un gérant"}
              </h2>
              <Button onClick={resetModal} className="text-gray-600 hover:text-gray-800">
                <CircleX className="w-6 h-6" />
              </Button>
            </div>

            {errors.global && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {errors.global[0]}
              </div>
            )}

            {showOtpVerification ? (
              <OtpInput
                length={6}
                onComplete={(code) => {
                  setOtpCode(code);
                }}
                onSubmit={handleOtpVerification}
                disabled={isLoading}
                isLoading={isLoading}
                title="Vérification OTP - Création du gérant"
                description="Un code OTP a été envoyé pour confirmer la création du gérant. Veuillez saisir le code à 6 chiffres reçu par l'administrateur."
              />
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-700">Nom <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="nom"
                    className={`w-full border ${errors.nom ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Nom"
                  />
                  {getFieldError('nom')}
                </div>

                <div>
                  <label className="block mb-1 font-medium text-gray-700">Prénom <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="prenom"
                    className={`w-full border ${errors.prenom ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    value={formData.prenom}
                    onChange={handleChange}
                    placeholder="Prénom"
                  />
                  {getFieldError('prenom')}
                </div>

                <div>
                  <label className="block mb-1 font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                  <div className={`flex items-center border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}>
                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      className="flex-1 outline-none"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email"
                    />
                  </div>
                  {getFieldError('email')}
                </div>

                <div>
                  <label className="block mb-1 font-medium text-gray-700">Mot de passe <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    name="password"
                    className={`w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mot de passe"
                  />
                  {getFieldError('password')}
                </div>

                <div>
                  <label className="block mb-1 font-medium text-gray-700">Téléphone <span className="text-red-500">*</span></label>
                  <PhoneInput
                    value={formData.telephone}
                    onChange={(_, fullNumber) => {
                      setFormData(prev => ({ ...prev, telephone: fullNumber }));
                      setErrors(prev => ({ ...prev, telephone: [] }));
                    }}
                    error={errors.telephone?.[0]}
                    required
                  />
                  {!errors.telephone?.length && (
                    <span className="text-xs text-gray-500 mt-1">Ce champ est obligatoire</span>
                  )}
                </div>

                {/* Le sélecteur d'entreprise est retiré visuellement mais l'entrepriseId est géré automatiquement */}

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="px-6 py-2 bg-[#ee7606] text-white rounded-md hover:bg-[#d56a05] disabled:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                  >
                    {isLoading ? "Chargement..." : "Créer"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CreateGerantModal;