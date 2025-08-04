"use server";

import { z } from "zod";
import { createdOrUpdated } from "@/lib/api";
import { ASSIGN_MANAGER_URL } from "./endpoint"; // Assurez-vous d'ajouter cette URL dans votre fichier endpoint.js

const AffecterGerantSchema = z.object({
  serviceId: z.string().min(1, { message: "L'ID du service est obligatoire" }),
  gerantId: z.string().min(1, { message: "L'ID du gérant est obligatoire" }),
  entrepriseId: z.string().min(1, { message: "L'ID de l'entreprise est obligatoire" }),
});

export const affecterGerantService = async (formData) => {
  //console.log("Début affecterGerantService - Données reçues:", formData);

  try {
    const validation = AffecterGerantSchema.safeParse(formData);

    if (!validation.success) {
      //console.log("Échec validation:", validation.error.flatten());
      return { type: "error", errors: validation.error.flatten().fieldErrors };
    }

    const { entrepriseId, serviceId, gerantId } = validation.data;

    //console.log("Données validées:", { serviceId, gerantId });
    //console.log("URL de l'API:", `${ASSIGN_MANAGER_URL}/${entrepriseId}`);

    const response = await createdOrUpdated({ 
      url: `${ASSIGN_MANAGER_URL}/${entrepriseId}`, 
      data: { serviceId, gerantId },
      updated: true 
    });

    //console.log("Réponse API:", response);
    return { 
      type: "success", 
      message: "Gérant affecté au service avec succès", 
      data: response 
    };
  } catch (error) {
    console.error("Erreur dans affecterGerantService:", error);
    
    if (error.response?.data?.message) {
      return { type: "error", error: error.response.data.message };
    }
    
    return { type: "error", error: "Erreur lors de l'affectation du gérant au service" };
  }
};