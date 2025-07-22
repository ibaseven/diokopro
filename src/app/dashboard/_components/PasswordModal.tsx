"use client"

import { useState, useRef, useEffect } from "react";
import { LockKeyhole, AlertCircle } from "lucide-react";
import { verifyAdminPassword } from "@/actions/bureau";
import { fetchJSON } from "@/lib/api";
import { ENTERPRISES_ENDPOINT } from "@/actions/endpoint";

interface PasswordModalProps {
  onSuccess: () => void;
  onCancel: () => void;
  userRole?: string;
  enterpriseId?: string; // Ajout de l'ID de l'entreprise
}

export function PasswordModal({ onSuccess, onCancel, userRole, enterpriseId }: PasswordModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Seuls les superAdmin ont un accès privilégié (pas de mot de passe requis)
  const hasPrivilegedAccess = userRole === "superAdmin";
  
  // Si l'utilisateur a un accès privilégié, accorder l'accès immédiatement
  useEffect(() => {
    if (hasPrivilegedAccess) {
      onSuccess();
    }
  }, [hasPrivilegedAccess, onSuccess]);
  
  // Récupérer l'email de l'administrateur au chargement (seulement si nécessaire)
  useEffect(() => {
    if (hasPrivilegedAccess) return; // Pas besoin de récupérer l'email pour les accès privilégiés
    
    const fetchAdminEmail = async () => {
      try {
        let endpoint = ENTERPRISES_ENDPOINT;
        
        // Si on a un ID d'entreprise spécifique, l'utiliser
        if (enterpriseId) {
          endpoint = `${ENTERPRISES_ENDPOINT}/${enterpriseId}`;
        }
        
        const data = await fetchJSON(endpoint);
        console.log("Données entreprises reçues:", data);
        
        let enterpriseData = data;
        
        // Si c'est un tableau, prendre le premier élément ou celui correspondant à l'ID
        if (Array.isArray(data)) {
          if (enterpriseId) {
            enterpriseData = data.find(enterprise => enterprise.id === enterpriseId) || data[0];
          } else {
            enterpriseData = data[0];
          }
        }
        
        // Vérifier que nous avons des données d'entreprise avec des gérants
        if (enterpriseData && enterpriseData.gerants) {
          // Chercher le gérant avec le rôle "admin"
          const admin = enterpriseData.gerants.find((gerant) => gerant.role === 'admin');
          
          if (admin && admin.email) {
            setAdminEmail(admin.email);
            console.log("Email admin trouvé:", admin.email);
          } else {
            console.error("Aucun administrateur trouvé dans les données");
            setError("Aucun administrateur trouvé pour cette entreprise");
          }
        } else {
          console.error("Format de données inattendu:", enterpriseData);
          setError("Impossible de récupérer les informations de l'entreprise");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'email de l'administrateur:", error);
        setError("Erreur de connexion au serveur");
      }
    };
    
    fetchAdminEmail();
  }, [hasPrivilegedAccess, enterpriseId]);
  
  useEffect(() => {
    // Focus sur le champ de saisie quand le modal s'ouvre
    if (inputRef.current && !hasPrivilegedAccess) {
      inputRef.current.focus();
    }
  }, [hasPrivilegedAccess]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Double vérification pour les accès privilégiés
    if (hasPrivilegedAccess) {
      onSuccess();
      return;
    }
    
    if (!password.trim()) {
      setError("Veuillez saisir un mot de passe");
      return;
    }
    
    if (!adminEmail) {
      setError("Impossible de vérifier le mot de passe : email administrateur non trouvé");
      return;
    }
    
    try {
      setIsLoading(true);
      setError("");
      
      // Utilisation de l'action serveur pour vérifier le mot de passe
      const result = await verifyAdminPassword(adminEmail, password);
      
      if (result.success) {
        onSuccess();
      } else {
        setError(result.message || "Mot de passe administrateur incorrect");
      }
    } catch (err) {
      setError("Une erreur s'est produite lors de la vérification du mot de passe");
      console.error("Erreur de vérification du mot de passe:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Si l'utilisateur a un accès privilégié, ne pas afficher la modal
  if (hasPrivilegedAccess) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="text-center pt-10 pb-5">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <LockKeyhole className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">Accès sécurisé</h2>
        </div>
        
        <div className="px-6 pb-8">
          <p className="mb-8 text-center">
            Veuillez saisir le mot de passe pour accéder au bureau.
          </p>
          
          {adminEmail ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <input
                  id="admin-password"
                  ref={inputRef}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Entrez le mot de passe administrateur"
                  disabled={isLoading}
                />
                
                {error && (
                  <div className="mt-2 flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? "Vérification..." : "Confirmer"}
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full p-3 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                  disabled={isLoading}
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-red-500">
                {error || "Impossible de charger les informations de l'administrateur"}
              </p>
              <button
                onClick={onCancel}
                className="mt-4 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}