"use server";

import { z } from "zod";
import { createdOrUpdated } from "@/lib/api";
import { ACTIVATE_ENTREPRISE_URL, REFUSE_ENTREPRISE_URL } from "./endpoint"; 

// Schéma pour la validation des données
const UpdateEntrepriseStatusSchema = z.object({
  entrepriseId: z.string().min(1, { message: "L'ID de l'entreprise est obligatoire" }),
  estActif: z.boolean({ message: "Le statut doit être un booléen" })
});
const RefuseEntrepriseSchema = z.object({
  entrepriseId: z.string().min(1, { message: "L'ID de l'entreprise est obligatoire" }),
  raisonRefus: z.string().min(1, { message: "La raison du refus est obligatoire" })
});
export const refuseEntreprise = async (formData) => {
  console.log("Début refuseEntreprise - Données reçues:", formData);

  try {
    // Validation des données
    const validation = RefuseEntrepriseSchema.safeParse(formData);

    if (!validation.success) {
      console.log("Échec validation:", validation.error.flatten());
      return { type: "error", errors: validation.error.flatten().fieldErrors };
    }

    const { entrepriseId, raisonRefus } = validation.data;

    console.log("Données validées:", { entrepriseId, raisonRefus });
    console.log("URL de l'API:", `${REFUSE_ENTREPRISE_URL}/${entrepriseId}`);

    // Utilisation de la fonction createdOrUpdated pour effectuer une requête PUT
    const response = await createdOrUpdated({
      url: `${REFUSE_ENTREPRISE_URL}/${entrepriseId}`,
      data: { estActif: false, raisonRefus }, // Refuser l'entreprise avec une raison
      updated: true
    });

    console.log("Réponse API:", response);

    // Vérifiez si la réponse est réussie
    if (response) {  
      return {
        type: "success",
        message: `L'entreprise a été refusée avec succès.`,
        data: response
      };
    } else {

     
      return {
        type: "error",
        error: response.error || "Erreur lors du refus de l'entreprise."
        
      };
    }
  } catch (error) {
    console.error("Erreur dans refuseEntreprise:", error);

    // Gestion des erreurs spécifiques de l'API
    if (error.response?.data?.message) {
      return { type: "error", error: error.response.data.message };
    }

    // Gestion des erreurs génériques
    return { type: "error", error: "Erreur lors du refus de l'entreprise." };
  }
};

export const updateEntrepriseStatus = async (formData) => {
  console.log("Début updateEntrepriseStatus - Données reçues:", formData);

  try {
    // Validation des données
    const validation = UpdateEntrepriseStatusSchema.safeParse(formData);

    if (!validation.success) {
      console.log("Échec validation:", validation.error.flatten());
      return { type: "error", errors: validation.error.flatten().fieldErrors };
    }

    const { entrepriseId, estActif } = validation.data;

    console.log("Données validées:", { entrepriseId, estActif });
    console.log("URL de l'API:", `${ACTIVATE_ENTREPRISE_URL}/${entrepriseId}`);

    // Utilisation de la fonction createdOrUpdated comme dans vos autres actions
    const response = await createdOrUpdated({
      url: `${ACTIVATE_ENTREPRISE_URL}/${entrepriseId}`,
      data: { estActif },
      updated: true
    });

    console.log("Réponse API:", response);
    return {
      type: "success",
      message: `L'entreprise a été ${estActif ? 'acceptée' : 'refusée'} avec succès`,
      data: response
    };
  } catch (error) {
    console.error("Erreur dans updateEntrepriseStatus:", error);

    if (error.response?.data?.message) {
      return { type: "error", error: error.response.data.message };
    }

    return { type: "error", error: `Erreur lors de ${formData.estActif ? 'l\'acceptation' : 'du refus'} de l'entreprise` };
  }
};