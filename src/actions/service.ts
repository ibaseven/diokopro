"use server";

import { z } from "zod";
import { createdOrUpdated } from "@/lib/api";
import { BASE_URL, SERVICE_URL } from "./endpoint";

// Schéma de validation pour les données du service
const ServiceSchema = z.object({
  nomService: z.string().min(1, { message: "Le nom du service est obligatoire" }),
  description: z.string().min(1, { message: "La description est obligatoire" }),
  tarifactionBase: z.number().min(0, { message: "Le tarif de base ne peut pas être négatif" }),
  niveauxDisponibles: z.array(z.object({
    nom: z.string().min(1, { message: "Le nom du niveau est obligatoire" }),
    tarif: z.number().min(0, { message: "Le tarif ne peut pas être négatif" })
  })).min(1, { message: "Au moins un niveau de service est requis" })
});

// Création d'un service
const createService = async (entrepriseId, formData) => {
  //console.log("🏁 Début createService dans service.ts");
  //console.log("📦 Données reçues:", formData);
  //console.log("🏢 EntrepriseId:", entrepriseId);

  try {
    // Validation des données
    //console.log("🔍 Début validation Zod");
    const validation = ServiceSchema.safeParse(formData);

    if (!validation.success) {
      //console.log("❌ Échec validation Zod:", validation.error.flatten());
      return { type: "error", errors: validation.error.flatten().fieldErrors };
    }
    //console.log("✅ Validation Zod réussie");

    const { nomService, description, tarifactionBase, niveauxDisponibles } = validation.data;

    // Préparation des données pour l'API
    const reqBody = {
      nomService,
      description,
      tarifactionBase,
      niveauxDisponibles
    };
    //console.log("📝 Données préparées pour l'API:", reqBody);
    //console.log("🔗 URL de l'API:", `${SERVICE_URL}/entreprise/${entrepriseId}`);

    // Appel à l'API
    //console.log("🚀 Envoi de la requête à l'API...");
    const response = await createdOrUpdated({ 
      url: `${SERVICE_URL}/entreprise/${entrepriseId}`, 
      data: reqBody 
    });
    //console.log("✨ Réponse de l'API:", response);

    return { type: "success", data: response };
  } catch (error) {
    console.error("💥 Erreur dans createService:", error);
    console.error("💥 Détails de l'erreur:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    if (error.response?.data?.message) {
      return { type: "error", error: error.response.data.message };
    }
    return { type: "error", error: "Erreur lors de la création du service" };
  }
};

const OTPValidationSchema = z.object({
  pendingChangeId: z.string().min(1, { message: "L'ID de changement est obligatoire" }),
  otp: z.string().min(6, { message: "Le code OTP doit contenir au moins 6 caractères" })
    .max(6, { message: "Le code OTP ne doit pas dépasser 6 caractères" })
    .regex(/^\d+$/, { message: "Le code OTP doit contenir uniquement des chiffres" })
});

const validateOTP = async (pendingChangeId, otp, entrepriseId) => {
  //console.log("🏁 Début validateOTP");
  //console.log("📦 Données reçues:", { pendingChangeId, otp, entrepriseId });

  try {
    // Validation des données
    //console.log("🔍 Début validation Zod");
    const validation = OTPValidationSchema.safeParse({ pendingChangeId, otp });

    if (!validation.success) {
      //console.log("❌ Échec validation Zod:", validation.error.flatten());
      return { 
        success: false, 
        error: "Données invalides", 
        errors: validation.error.flatten().fieldErrors 
      };
    }
    //console.log("✅ Validation Zod réussie");

    const validatedData = validation.data;

    // Préparation des données pour l'API
    const reqBody = {
      pendingChangeId: validatedData.pendingChangeId,
      otp: validatedData.otp
    };
    //console.log("📝 Données préparées pour l'API:", reqBody);

    // Appel à l'API
    //console.log("🚀 Envoi de la requête à l'API...");
    const response = await createdOrUpdated({ 
      url: `${BASE_URL}/validate-change/entreprise/${entrepriseId}`, 
      data: reqBody 
    });
    //console.log("✨ Réponse de l'API:", response);

    return { 
      success: true, 
      data: response 
    };
  } catch (error) {
    console.error("💥 Erreur dans validateServiceOTP:", error);
    console.error("💥 Détails de l'erreur:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    if (error.response?.data?.message) {
      return { 
        success: false, 
        error: error.response.data.message 
      };
    }
    return { 
      success: false, 
      error: "Erreur lors de la validation du code OTP" 
    };
  }
};

export { createService, validateOTP };