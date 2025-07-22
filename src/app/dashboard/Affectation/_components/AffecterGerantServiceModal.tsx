"use client";
import React, { useState, useEffect } from "react";
import { CircleX, User } from "lucide-react";
import { toast } from "sonner";
import { affecterGerantService } from "@/actions/match";


interface User {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
}

interface Service {
  _id: string;
  nomService: string;
  entrepriseId: string;
}

interface AffecterGerantServiceModalProps {
  services?: Service[];
  gerants?: User[];
  entrepriseId: string;
}

interface ValidationErrors {
  [key: string]: string[];
}

const AffecterGerantServiceModal = ({ services = [], gerants = [], entrepriseId }: AffecterGerantServiceModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState({
    serviceId: "",
    gerantId: "",
    entrepriseId: entrepriseId || "",
  });

  useEffect(() => {
   
    console.log("Gérants disponibles:", gerants);
    setFormData(prev => ({ ...prev, entrepriseId }));
  }, [services, gerants, entrepriseId]);

  const openModal = () => {
    setIsOpen(true);
    setErrors({});
  };

  const closeModal = () => {
    setIsOpen(false);
    setFormData({
      serviceId: "",
      gerantId: "",
      entrepriseId: entrepriseId || "",
    });
    setErrors({});
  };

  const handleSubmit = async () => {
    setErrors({});

    if (!formData.serviceId || !formData.gerantId) {
      const newErrors: ValidationErrors = {};
      if (!formData.serviceId) newErrors.serviceId = ["Le service est requis"];
      if (!formData.gerantId) newErrors.gerantId = ["Le gérant est requis"];

      setErrors(newErrors);
      toast.error("Veuillez sélectionner un service et un gérant");
      return;
    }

    setIsLoading(true);
    try {
      const response = await affecterGerantService(formData);
      console.log("Réponse reçue:", response);

      if (response.type === "success") {
        toast.success(response.message || "Gérant affecté au service avec succès !");
        closeModal();
      } else if (response.errors) {
        setErrors(response.errors);
        const firstError = Object.values(response.errors)[0]?.[0];
        if (firstError) {
          toast.error(firstError);
        }
      } else {
        toast.error(response.error || "Une erreur est survenue");
        setErrors({ global: [response.error || "Une erreur est survenue"] });
      }
    } catch (error: any) {
      console.error("Erreur complète:", error);
      const errorMessage = error.message || "Une erreur inattendue est survenue";
      toast.error(errorMessage);
      setErrors({ global: [errorMessage] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: [] }));
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
        onClick={openModal}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        type="button"
      >
        Affecter un gérant à un service
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold mb-6">Affecter un gérant à un service</h2>
              <button
                onClick={closeModal}
                className="text-gray-600 hover:text-gray-800 focus:outline-none"
                type="button"
              >
                <CircleX className="w-6 h-6" />
              </button>
            </div>

            {errors.global && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {errors.global[0]}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700">Service</label>
                <select
                  name="serviceId"
                  className={`w-full border ${errors.serviceId ? 'border-red-500' : 'border-gray-300'
                    } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  value={formData.serviceId}
                  onChange={handleSelectChange}
                >
                  <option value="">Sélectionnez un service</option>
                  {Array.isArray(services) &&
                    services.map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.nomService}
                      </option>
                    ))}
                </select>
                {getFieldError('serviceId')}
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Gérant</label>
                <div className={`flex items-center border ${errors.gerantId ? 'border-red-500' : 'border-gray-300'
                  } rounded-md p-2`}>
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  <select
                    name="gerantId"
                    className="flex-1 outline-none"
                    value={formData.gerantId}
                    onChange={handleSelectChange}
                  >
                    <option value="">Sélectionnez un gérant</option>
                    {Array.isArray(gerants) &&
                      gerants.map((gerant) => (
                        <option key={gerant._id} value={gerant._id}>
                          {gerant.nom} {gerant.prenom} ({gerant.email})
                        </option>
                      ))}
                  </select>
                </div>
                {getFieldError('gerantId')}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-6 py-2 bg-[#ee7606] hover:bg-[#d56a05] text-white rounded-md disabled:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                  type="button"
                >
                  {isLoading ? "Chargement..." : "Affecter"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AffecterGerantServiceModal;