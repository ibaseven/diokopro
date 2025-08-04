"use server";

import { z } from "zod";
import { createdOrUpdated } from "@/lib/api";
import { DEBITER_COMPTE_ENTREPRISE, RECHARGE_COMPTE_ENTREPRISE } from "./endpoint";

// Schémas de validation
const RechargeSchema = z.object({
  montant: z.number().min(1, { message: "Le montant doit être supérieur à 0" }),
});

const RetraitSchema = z.object({
  montant: z.number().min(1, { message: "Le montant doit être supérieur à 0" }),
  numAdmin: z.string().min(1, { message: "Le numéro de téléphone est obligatoire" }),
  wallet: z.string().min(1, { message: "Le portefeuille est obligatoire" }),
});

const CreditSchema = z.object({
  montant: z.number().min(1, { message: "Le montant doit être supérieur à 0" }),
  raison: z.string().optional(),
});

const MessageSchema = z.object({
  titre: z.string().min(1, { message: "Le titre est obligatoire" }),
  message: z.string().min(1, { message: "Le message est obligatoire" }),
});

// Action pour recharger le compte
export const rechargeCompte = async (
  entrepriseId: string,
  formData: { montant: number }
) => {
  try {
    const validation = RechargeSchema.safeParse(formData);

    if (!validation.success) {
      return {
        type: "error",
        errors: validation.error.flatten().fieldErrors,
      };
    }

    const response = await createdOrUpdated({
      url: `${RECHARGE_COMPTE_ENTREPRISE}/${entrepriseId}`,
      data: validation.data,
    });
//console.log(response);

    return {
      type: "success",
      message: "Lien de recharge créé avec succès",
      data: response,
    };
  } catch (error) {
    console.error("Erreur dans rechargeCompte:", error);

    if (error?.response?.data?.message) {
      return { type: "error", error: error.response.data.message };
    }

    return {
      type: "error",
      error: "Erreur lors de la création du lien de recharge",
    };
  }
};

// Action pour effectuer un retrait
export const retraitCompte = async (
  entrepriseId: string,
  formData: { montant: number; numAdmin: string; wallet: string }
) => {
  try {
    const validation = RetraitSchema.safeParse(formData);

    if (!validation.success) {
      return {
        type: "error",
        errors: validation.error.flatten().fieldErrors,
      };
    }

    const response = await createdOrUpdated({
      url: `${DEBITER_COMPTE_ENTREPRISE}/${entrepriseId}`,
      data: validation.data,
    });

    return {
      type: "success",
      message: "Retrait effectué avec succès",
      data: response,
    };
  } catch (error) {
    console.error("Erreur dans retraitCompte:", error);

    if (error?.response?.data?.message) {
      return { type: "error", error: error.response.data.message };
    }

    return { type: "error", error: "Erreur lors du retrait" };
  }
};

// Action pour créditer le compte (à adapter selon ton API)


// Action pour envoyer un message
export const envoyerMessage = async (
  entrepriseId: string,
  formData: { titre: string; message: string }
) => {
  try {
    const validation = MessageSchema.safeParse(formData);

    if (!validation.success) {
      return {
        type: "error",
        errors: validation.error.flatten().fieldErrors,
      };
    }

    // À adapter selon ton endpoint API
    const response = await createdOrUpdated({
      url: `/api/envoyer-message/entreprise/${entrepriseId}`,
      data: validation.data,
    });

    return {
      type: "success",
      message: "Message envoyé avec succès",
      data: response,
    };
  } catch (error) {
    console.error("Erreur dans envoyerMessage:", error);

    if (error?.response?.data?.message) {
      return { type: "error", error: error.response.data.message };
    }

    return { type: "error", error: "Erreur lors de l'envoi du message" };
  }
};

// Action pour récupérer le solde actuel
