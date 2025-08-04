"use server";

import { z } from "zod";
import { createdOrUpdated } from "@/lib/api";
import { ACCEPTED_PENDING_ENDPOINT, REJECT_PENDING_ENDPOINT } from "./endpoint";

const ValidationSchema = z.object({
  pendingChangeId: z.string().min(1, { message: "L'ID de la modification est obligatoire" }),
  otp: z.string().min(1, { message: "Le code OTP est obligatoire" }),
  entrepriseId: z.string().min(1, { message: "L'ID de l'entreprise est obligatoire" }),
});

const RejectionSchema = z.object({
  pendingChangeId: z.string().min(1, { message: "L'ID de la modification est obligatoire" }),
  rejectionReason: z.string().min(1, { message: "La raison du rejet est obligatoire" }),
  entrepriseId: z.string().min(1, { message: "L'ID de l'entreprise est obligatoire" }),
  otp: z.string().min(1, { message: "Le code OTP est obligatoire" }),
});

export const validatePendingChange = async (formData: {
    pendingChangeId: string;
    otp: string;
    entrepriseId: string;
  }) => {
    try {
      const validation = ValidationSchema.safeParse(formData);
  
      if (!validation.success) {
        return { 
          type: "error", 
          errors: validation.error.flatten().fieldErrors 
        };
      }
  
      const { entrepriseId, pendingChangeId, otp } = validation.data;
  //console.log(`${ACCEPTED_PENDING_ENDPOINT}/${entrepriseId}`);
  
      const response = await createdOrUpdated({
        url: `${ACCEPTED_PENDING_ENDPOINT}/${entrepriseId}`,
        data: { pendingChangeId, otp },
      });
  
      return { 
        type: "success", 
        message: "La modification a été validée avec succès",
        data: response 
      };
    } catch (error) {
      console.error("Erreur dans validatePendingChange:", error);
      
      if (error.response?.data?.message) {
        return { type: "error", error: error.response.data.message };
      }
      
      return { type: "error", error: "Erreur lors de la validation de la modification" };
    }
  };

  export const rejectPendingChange = async (formData: {
    pendingChangeId: string;
    rejectionReason: string;
    entrepriseId: string;
  }) => {
    try {
      const validation = RejectionSchema.safeParse(formData);
  
      if (!validation.success) {
        return { 
          type: "error", 
          errors: validation.error.flatten().fieldErrors 
        };
      }
  
      const { entrepriseId, pendingChangeId, rejectionReason,otp } = validation.data;
  
      const response = await createdOrUpdated({
        url: `${REJECT_PENDING_ENDPOINT}/${entrepriseId}`,
        data: { pendingChangeId, rejectionReason,otp },
        updated: true
      });
  
      return { 
        type: "success", 
        message: "La modification a été rejetée avec succès",
        data: response 
      };
    } catch (error) {
      console.error("Erreur dans rejectPendingChange:", error);
      
      if (error.response?.data?.message) {
        return { type: "error", error: error.response.data.message };
      }
      
      return { type: "error", error: "Erreur lors du rejet de la modification" };
    }
  };