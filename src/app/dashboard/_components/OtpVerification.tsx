"use client"

import React from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";

interface OtpVerificationProps {
  otpCode: string;
  setOtpCode: (value: string) => void;
  verifyOtp: () => Promise<void>;
  isLoading: boolean;
  entityType?: "service" | "gérant" | "client"; // Type optionnel qui permet de réutiliser le composant
}

const OtpVerification = ({
  otpCode,
  setOtpCode,
  verifyOtp,
  isLoading,
  entityType = "service", // Par défaut c'est "service" pour la rétrocompatibilité
}: OtpVerificationProps) => {
  
  const handleVerify = async () => {
    // Vérification que le code a exactement 6 chiffres
    if (otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
      toast.error("Le code doit contenir exactement 6 chiffres");
      return;
    }
    
    try {
      await verifyOtp();
    } catch (error) {
      toast.error("Échec de la vérification. Veuillez réessayer.");
    }
  };
  
  // Gère la validation des entrées - accepte uniquement les chiffres
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permet seulement les chiffres et limite à 6 caractères
    if (/^\d*$/.test(value) && value.length <= 6) {
      setOtpCode(value);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="mb-4 text-gray-700">
          Un code de vérification à 6 chiffres a été envoyé à l'administrateur pour confirmer la modification du {entityType}
        </p>
        <div className="mb-6 mt-8">
          <label htmlFor="otp-code" className="block text-sm font-medium text-gray-700 mb-2">
            Code de vérification
          </label>
          <input
            id="otp-code"
            type="text"
            inputMode="numeric"
            pattern="\d*"
            className="w-full max-w-xs mx-auto p-4 text-center text-2xl tracking-wider border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
            placeholder="Entrez le code"
            value={otpCode}
            onChange={handleOtpChange}
            maxLength={6}
            autoFocus
          />
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={handleVerify}
          disabled={isLoading || otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)}
          className="px-6 py-3 bg-[#ee7606] text-white rounded-md disabled:bg-opacity-70 flex items-center"
        >
          {isLoading ? (
            "Vérification..."
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" /> Valider le {entityType}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default OtpVerification;