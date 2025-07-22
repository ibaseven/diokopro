"use server";

import { z } from "zod";
import { createdOrUpdated } from "@/lib/api";
import { CLIENT_URL, DELETE_CLIENT_URL, DELETE_CLIENT_URL_FOR_A_SERVICE, UPDATE_CLIENT_URL } from "./endpoint";
import axios from "axios";
import { cookies } from "next/headers";

// Schéma modifié pour inclure les paramètres de paiement
const ClientSchema = z.object({
  nom: z.string().min(1, { message: "Le nom est obligatoire" }),
  prenom: z.string().min(1, { message: "Le prénom est obligatoire" }),
  email: z.string().email({ message: "Format d'email invalide" }),
  telephone: z.string().min(10, { message: "Le numéro de téléphone est obligatoire" }),
  adresse: z.string().min(1, { message: "L'adresse est obligatoire" }),
  nin: z.string().optional(),
  serviceId: z.string().min(1, { message: "L'ID du service est obligatoire" }),
  entrepriseId: z.string().min(1, { message: "L'ID de l'entreprise est obligatoire" }),
  niveauService: z.string().min(1, { message: "Le niveau de service est obligatoire" }),
  useTarifBase: z.boolean().optional(),

  // Champs de paiement
  salaire: z.number().optional(),
  frequencePaiement: z.enum(['mensuel', 'hebdomadaire', 'quotidien', 'horaire', 'minute', 'unique']).optional().default('mensuel'),
  intervallePaiement: z.number().optional(),
  jourPaiement: z.number().optional(),
  aPayer: z.boolean().optional().default(true),

  // Nouvelle propriété ajoutée pour la date de programmation
  dateProgrammee: z.union([z.string(), z.date()]),
});

const UpdateClientSchema = ClientSchema.partial().extend({
  clientId: z.string().min(1, { message: "L'ID du client est obligatoire" }),
});

const RemoveFromServiceSchema = z.object({
  clientId: z.string().min(1, { message: "L'ID du client est obligatoire" }),
  serviceId: z.string().min(1, { message: "L'ID du service est obligatoire" }),
  entrepriseId: z.string().min(1, { message: "L'ID de l'entreprise est obligatoire" })
});

const DeleteClientSchema = z.object({
  clientId: z.string().min(1, { message: "L'ID du client est obligatoire" }),
  entrepriseId: z.string().min(1, { message: "L'ID de l'entreprise est obligatoire" })
});

export const createClient = async (formData) => {
  console.log("Début createClient - Données reçues:", formData);

  try {
    // Convertir les champs numériques si nécessaire
    const processedData = {
      ...formData,
      salaire: typeof formData.salaire === 'string' ? Number(formData.salaire) : formData.salaire,
      intervallePaiement: typeof formData.intervallePaiement === 'string' ? Number(formData.intervallePaiement) : formData.intervallePaiement,
      jourPaiement: typeof formData.jourPaiement === 'string' ? Number(formData.jourPaiement) : formData.jourPaiement,
    };

    const validation = ClientSchema.safeParse(processedData);

    if (!validation.success) {
      console.log("Échec validation:", validation.error.flatten());
      return { type: "error", errors: validation.error.flatten().fieldErrors };
    }

    const { entrepriseId, serviceId, niveauService, useTarifBase, ...clientData } = validation.data;

    console.log("Données validées:", { ...clientData, niveauService, useTarifBase });
    console.log("URL de l'API:", `${CLIENT_URL}/${entrepriseId}/service/${serviceId}`);

    // Préparer les données à envoyer à l'API
    const dataToSend = { 
      ...clientData,
      // Si niveauService est "tarifBase" ou useTarifBase est true, on indique 
      // au serveur qu'on utilise le tarif de base
      useTarifBase: useTarifBase || niveauService === "tarifBase",
      // On envoie quand même le niveau de service, mais seulement si on n'utilise pas le tarif de base
      niveauService: (useTarifBase || niveauService === "tarifBase") ? null : niveauService
    };

    const response = await createdOrUpdated({ 
      url: `${CLIENT_URL}/${entrepriseId}/service/${serviceId}`, 
      data: dataToSend
    });

    console.log("Réponse API:", response);
    return { type: "success", data: response };
  } catch (error) {
    console.error("Erreur dans createClient:", error);
    
    if (error.response?.data?.message) {
      return { type: "error", error: error.response.data.message };
    }
    
    return { type: "error", error: "Erreur lors de la création du client" };
  }
};

export const updateClient = async (formData) => {
  console.log("Début updateClient - Données reçues:", formData);

  try {
    // Convertir les champs numériques si nécessaire
    const processedData = {
      ...formData,
      salaire: typeof formData.salaire === 'string' ? Number(formData.salaire) : formData.salaire,
      intervallePaiement: typeof formData.intervallePaiement === 'string' ? Number(formData.intervallePaiement) : formData.intervallePaiement,
      jourPaiement: typeof formData.jourPaiement === 'string' ? Number(formData.jourPaiement) : formData.jourPaiement,
    };

    const validation = UpdateClientSchema.safeParse(processedData);

    if (!validation.success) {
      console.log("Échec validation:", validation.error.flatten());
      return { type: "error", errors: validation.error.flatten().fieldErrors };
    }

    const { entrepriseId, serviceId, clientId, niveauService, useTarifBase, ...clientData } = validation.data;

    console.log("Données validées:", { ...clientData, niveauService, useTarifBase });
    console.log("URL de l'API:", `${UPDATE_CLIENT_URL}/${entrepriseId}/service/${serviceId}/client/${clientId}`);

    // Préparer les données à envoyer à l'API
    const dataToSend = { 
      ...clientData,
      // Ajouter ces champs seulement s'ils sont définis dans la demande de mise à jour
      ...(niveauService !== undefined && {
        useTarifBase: useTarifBase || niveauService === "tarifBase",
        niveauService: (useTarifBase || niveauService === "tarifBase") ? null : niveauService
      })
    };

    const response = await createdOrUpdated({ 
      url: `${UPDATE_CLIENT_URL}/${entrepriseId}/service/${serviceId}/client/${clientId}`, 
      data: dataToSend,
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
};

export const removeClientFromService = async (formData) => {
  console.log("Début removeClientFromService - Données reçues:", formData);

  try {
    const formObject = formData instanceof FormData
      ? Object.fromEntries(formData.entries())
      : formData;
    
    const validation = RemoveFromServiceSchema.safeParse(formObject);

    if (!validation.success) {
      console.log("Échec validation:", validation.error.flatten());
      return { type: "error", errors: validation.error.flatten().fieldErrors };
    }

    const { entrepriseId, serviceId, clientId } = validation.data;

    const apiUrl = `${DELETE_CLIENT_URL_FOR_A_SERVICE}/${entrepriseId}/service/${serviceId}/client/${clientId}`;
    console.log("URL de l'API pour retrait du service:", apiUrl);

    // Suppression logique via createOrUpdate
    const response = await createdOrUpdated({
      url: apiUrl,
      data: { clientId, serviceId, isDeleted: true },
      updated: true
    });
    
    // Log complet de la réponse pour diagnostic
    console.log("Réponse complète:", response);
    
    // Vérifier si la réponse est correctement formatée
    if (!response) {
      console.error("Réponse vide de l'API");
      return { type: "error", error: "Réponse vide de l'API" };
    }
    
    // Vérifier si un ID de changement en attente est présent dans la réponse
    // Adapter selon la structure réelle de votre réponse
    if (response.pendingChangeId || (response.data && response.data.pendingChangeId)) {
      const pendingId = response.pendingChangeId || response.data.pendingChangeId;
      return {
        type: "pending",
        message: "Un code OTP a été envoyé pour confirmer le retrait du service",
        data: { pendingChangeId: pendingId }
      };
    }
    
    // Si tout s'est bien passé mais sans OTP
    return { 
      type: "success", 
      message: "Client retiré du service avec succès",
      data: { type: 'success' }
    };
  } catch (error) {
    console.error("Erreur dans removeClientFromService:", error);
    
    if (error.response?.data?.message) {
      return { type: "error", error: error.response.data.message };
    }
    
    return { type: "error", error: "Erreur lors du retrait du client du service" };
  }
};

export async function deleteClient(formData) {
  console.log("Début deleteClient - Données reçues:", formData);

  try {
    const token = (await cookies()).get("token")?.value;
    
    if (!token) {
      return { 
        type: "error", 
        message: "Non autorisé. Veuillez vous connecter." 
      };
    }
    
    const formObject = formData instanceof FormData
      ? Object.fromEntries(formData.entries())
      : formData;
    
    const validation = DeleteClientSchema.safeParse(formObject);
    
    if (!validation.success) {
      console.log("Échec validation:", validation.error.flatten());
      return { type: "error", errors: validation.error.flatten().fieldErrors };
    }
    
    const { entrepriseId, clientId } = validation.data;
    const deleteUrl = `${DELETE_CLIENT_URL}/${entrepriseId}/client/${clientId}`;
    
    console.log("URL de l'API pour suppression définitive:", deleteUrl);
    
    // Requête de suppression avec l'autorisation
    const response = await axios({
      method: 'delete',
      url: deleteUrl,
      headers: { 
        'Accept': "application/json",
        'Content-Type': "application/json", 
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log("Réponse de suppression définitive:", response.data);
    
    // Vérifier si un ID de changement en attente est retourné (pour l'OTP)
    if (response.data?.pendingChangeId) {
      return {
        type: "pending",
        message: "Un code OTP a été envoyé pour confirmer la suppression définitive",
        data: { pendingChangeId: response.data.pendingChangeId }
      };
    }
    
    return { 
      type: "success",
      success: true,
      message: "Client supprimé avec succès",
      data: { type: 'success' }
    };
    
  } catch (error) {
    console.error("Erreur lors de la suppression du client:", error);
    
    if (error.response) {
      console.log("Statut:", error.response.status);
      console.log("Données:", error.response.data);
      
      if (error.response.status === 404) {
        return {
          type: "error",
          message: "Client non trouvé"
        };
      }
    }
    
    return {
      type: "error",
      message: error?.response?.data?.message || "Erreur lors de la suppression du client"
    };
  }
}