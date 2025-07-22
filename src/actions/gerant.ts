"use server";

import { z } from "zod";
import { createdOrUpdated } from "@/lib/api";
import { DELETE_CLIENT_URL, GERANT_URL, UPDATE_GERANT_URL } from "./endpoint";

// Schéma de validation pour les données du gérant
const GerantSchema = z.object({
  nom: z.string().min(1, { message: "Le nom est obligatoire" }),
  prenom: z.string().min(1, { message: "Le prénom est obligatoire" }),
  email: z.string().email({ message: "L'email doit être valide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  telephone: z.string().min(9, { message: "Le numéro de téléphone doit contenir au moins 10 chiffres" }),
  entrepriseId: z.string().min(1, { message: "L'ID de l'entreprise est obligatoire" }),
});
const UpdateGerantschema = GerantSchema.partial().extend({
  gerantId: z.string().min(1, { message: "L'ID du client est obligatoire" }),
});
// Création d'un gérant
export const createGerant = async (formData) => {
  console.log("🏁 Début createGerant dans service.ts");
  console.log("📦 Données reçues:", formData);

  try {
    // Validation des données
    console.log("🔍 Début validation Zod");
    const validation = GerantSchema.safeParse(formData);

    if (!validation.success) {
      console.log("❌ Échec validation Zod:", validation.error.flatten());
      return { errors: validation.error.flatten().fieldErrors };
    }
    console.log("✅ Validation Zod réussie");

    const { nom, prenom, email, password, telephone, entrepriseId } = validation.data;
    console.log("🏢 EntrepriseId:", entrepriseId);

    // Préparation des données pour l'API
    const reqBody = {
      nom,
      prenom,
      email,
      password,
      telephone
    };
    console.log("📝 Données préparées pour l'API:", reqBody);
    console.log("🔗 URL de l'API:", `${GERANT_URL}/${entrepriseId}`);

    // Appel à l'API
    console.log("🚀 Envoi de la requête à l'API...");
    const response = await createdOrUpdated({ 
      url: `${GERANT_URL}/${entrepriseId}`, 
      data: reqBody 
    });
    console.log("✨ Réponse de l'API:", response);

    return { type: "success", message: "Gérant créé avec succès",data:response };
  } catch (error: any) {
    console.error("💥 Erreur dans createGerant:", error);
    console.error("💥 Détails de l'erreur:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    if (error.response?.data?.message) {
      return { error: error.response.data.message };
    }
    return { error: "Erreur lors de la création du gérant" };
  }
};
export const updatedGerant = async (formData) => {
  console.log("Début updategerant- Données reçues:", formData);

  try {
    const validation = UpdateGerantschema.safeParse(formData);

    if (!validation.success) {
      console.log("Échec validation:", validation.error.flatten());
      return { type: "error", errors: validation.error.flatten().fieldErrors };
    }

    const { entrepriseId,  gerantId, ...gerantData } = validation.data;

    console.log("Données validées:", gerantData);
    console.log("URL de l'API:", `${UPDATE_GERANT_URL}/${entrepriseId}/gerant/${gerantId}`);

    const response = await createdOrUpdated({ 
      url: `${UPDATE_GERANT_URL}/${entrepriseId}/gerant/${gerantId}`, 
      data: gerantData,
      updated: true
    });

    console.log("Réponse API:", response);
    return { type: "success", data: response };
  } catch (error) {
    console.error("Erreur dans updateClient:", error);
    
    if (error.response?.data?.message) {
      return { type: "error", error: error.response.data.message };
    }
    
    return { type: "error", error: "Erreur lors de la mise à jour du client" };
  }
}
export const deleteClient = async (formData) => {
  console.log("Début deleteClient - Données reçues:", formData);

  try {
    // Validation des données
    const validation = z.object({
      gerantId: z.string().min(1, { message: "L'ID du client est obligatoire" }),
      serviceId: z.string().min(1, { message: "L'ID du service est obligatoire" }),
      entrepriseId: z.string().min(1, { message: "L'ID de l'entreprise est obligatoire" })
    }).safeParse(formData);

    if (!validation.success) {
      console.log("Échec validation:", validation.error.flatten());
      return { type: "error", errors: validation.error.flatten().fieldErrors };
    }

    const { entrepriseId, serviceId, gerantId } = validation.data;

    const apiUrl = `${DELETE_CLIENT_URL}/${entrepriseId}/service/${serviceId}/client/${gerantId}`;
    console.log("URL de l'API:", apiUrl);

    // Suppression logique via createOrUpdate
    const response = await createdOrUpdated({
      url: `${DELETE_CLIENT_URL}/${entrepriseId}/service/${serviceId}/client/${gerantId}`,
      data: { gerantId, serviceId, isDeleted: true }, // Ajout du serviceId
      updated: true
    });
    

    return { type: "success", message: "Client supprimé avec succès" };
  } catch (error) {
    console.error("Erreur dans deleteClient:", error);
    
    if (error.response?.data?.message) {
      return { type: "error", error: error.response.data.message };
    }
    
    return { type: "error", error: "Erreur lors de la suppression du client" };
  }
};
