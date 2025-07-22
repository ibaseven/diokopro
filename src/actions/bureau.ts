"use server";

import axios from "axios";
import { LoginSchema } from "@/schemas/loginschema";

// Définissez l'URL de connexion ici
const LOGIN_URL = "http://localhost:5000/api/auth/sign";

export const login = async (state: any, formData: FormData) => {
  try {
    // Validation avec zod
    const validatedFields = LoginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!validatedFields.success) {
      return { success: false, errors: validatedFields.error.flatten().fieldErrors };
    }

    const { email, password } = validatedFields.data;

    // Faire une requête POST pour connecter l'utilisateur
    const res = await axios.post(LOGIN_URL, {
      email,
      password,
    });

    console.log("Login response:", res.data); // Debugging: Log the response

    // Si la connexion réussit, retourner les données de l'utilisateur
    if (res.data && res.status === 200) {
      // Vous pouvez stocker les informations pertinentes dans la session côté client si nécessaire
      return {
        success: true,
        user: res.data.user || res.data, // selon la structure de votre réponse
        message: "Connexion réussie"
      };
    } else {
      return {
        success: false,
        message: res.data.message || "Échec de la connexion"
      };
    }
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      success: false,
      message: error?.response?.data?.message || "Une erreur s'est produite lors de la connexion"
    };
  }
};

// Version simplifiée de la déconnexion qui ne fait que retourner un statut
export async function logout() {
  // Ici, vous pouvez effectuer toute logique de nettoyage côté client
  // Par exemple, supprimer les données de session du localStorage
  return { success: true, message: "Déconnexion réussie" };
}

// Cette fonction peut être utilisée pour vérifier le mot de passe administrateur
export async function verifyAdminPassword(email: string, password: string) {
  try {
    const res = await axios.post(LOGIN_URL, {
      email,
      password,
    });
    
    if (res.data && res.status === 200) {
      return { success: true };
    } else {
      return { 
        success: false, 
        message: res.data.message || "Mot de passe incorrect" 
      };
    }
  } catch (error: any) {
    console.error("Verification error:", error);
    return {
      success: false,
      message: error?.response?.data?.message || "Erreur de vérification"
    };
  }
}