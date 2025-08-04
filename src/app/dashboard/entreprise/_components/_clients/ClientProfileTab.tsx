

import React from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';
import { Client, Service, NiveauService } from '@/app/lib/types';

interface ClientProfileTabProps {
  client: Client;
  isEditing: boolean;
  formData: Partial<Client>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  
  // Service management props
  services: Service[];
  isAddingService: boolean;
  selectedServiceId: string;
  selectedNiveauService: string;
  selectedServiceNiveaux: NiveauService[];
  
  // Event handlers
  onAddService?: () => void;
  onRemoveFromService?: (serviceId: string) => void;
  toggleAddServiceMode: () => void;
  handleServiceChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleNiveauServiceChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  showRemoveFromServiceConfirmation: (serviceId: string) => void;
}

const ClientProfileTab: React.FC<ClientProfileTabProps> = ({
  client,
  isEditing,
  formData,
  onInputChange,
  services,
  isAddingService,
  selectedServiceId,
  selectedNiveauService,
  selectedServiceNiveaux,
  onAddService,
  onRemoveFromService,
  toggleAddServiceMode,
  handleServiceChange,
  handleNiveauServiceChange,
  showRemoveFromServiceConfirmation
}) => {
  
  // Formater la date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Date invalide";
    }
  };

  return (
    <div className="grid gap-4 py-4">
      {/* Informations de base */}
      <div className="grid grid-cols-4 items-center gap-4">
        <div className="font-semibold text-right">Nom:</div>
        <div className="col-span-3">
          {isEditing ? (
            <Input
              name="nom"
              value={formData.nom || ''}
              onChange={onInputChange}
            />
          ) : (
            client.nom
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <div className="font-semibold text-right">Prénom:</div>
        <div className="col-span-3">
          {isEditing ? (
            <Input
              name="prenom"
              value={formData.prenom || ''}
              onChange={onInputChange}
            />
          ) : (
            client.prenom
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <div className="font-semibold text-right">Email:</div>
        <div className="col-span-3">
          {isEditing ? (
            <Input
              name="email"
              value={formData.email || ''}
              onChange={onInputChange}
            />
          ) : (
            client.email
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <div className="font-semibold text-right">Téléphone:</div>
        <div className="col-span-3">
          {isEditing ? (
            <Input
              name="telephone"
              value={formData.telephone || ''}
              onChange={onInputChange}
            />
          ) : (
            client.telephone
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <div className="font-semibold text-right">Adresse:</div>
        <div className="col-span-3">
          {isEditing ? (
            <Input
              name="adresse"
              value={formData.adresse || ''}
              onChange={onInputChange}
            />
          ) : (
            client.adresse || "-"
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <div className="font-semibold text-right">NIN:</div>
        <div className="col-span-3">
          {isEditing ? (
            <Input
              name="nin"
              value={formData.nin || ''}
              onChange={onInputChange}
            />
          ) : (
            client.nin || "-"
          )}
        </div>
      </div>

      {/* Informations supplémentaires en mode consultation uniquement */}
      {!isEditing && (
        <>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-semibold text-right">Statut:</div>
            <div className="col-span-3">
              <Badge variant={client.estNouveau ? "default" : "secondary"}>
                {client.estNouveau ? "Nouveau client" : "Client existant"}
              </Badge>
            </div>
          </div>

          {client.dateCreation && (
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="font-semibold text-right">Date de création:</div>
              <div className="col-span-3">
                {new Date(client.dateCreation).toLocaleDateString('fr-FR')}
              </div>
            </div>
          )}

          {/* Nouvelles informations basées sur les données fournies */}
          {client.montantTotal && (
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="font-semibold text-right">Montant total:</div>
              <div className="col-span-3 font-medium text-green-600">
                {client.montantTotal.toLocaleString('fr-FR')} FCFA
              </div>
            </div>
          )}

          {client.dateProgrammee && (
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="font-semibold text-right">Date programmée:</div>
              <div className="col-span-3">
                {formatDate(client.dateProgrammee)}
              </div>
            </div>
          )}

          {client.frequencePaiement && (
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="font-semibold text-right">Fréquence paiement:</div>
              <div className="col-span-3">
                <Badge variant="outline">{client.frequencePaiement}</Badge>
              </div>
            </div>
          )}

          {/* États de paiement */}
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-semibold text-right">État paiement:</div>
            <div className="col-span-3 space-y-1">
              {client.aDejaPaye !== undefined && (
                <Badge variant={client.aDejaPaye ? "success" : "secondary"}>
                  {client.aDejaPaye ? "✅ Déjà payé" : "❌ Pas encore payé"}
                </Badge>
              )}
              {client.aFAirePayer !== undefined && (
                <Badge variant={client.aFAirePayer ? "default" : "secondary"} className="ml-1">
                  {client.aFAirePayer ? "💰 À payer" : "🚫 Ne doit pas payer"}
                </Badge>
              )}
            </div>
          </div>

          {/* Niveaux de services choisis */}
          {client.niveauServicesChoisis && client.niveauServicesChoisis.length > 0 && (
            <div className="grid grid-cols-4 items-start gap-4">
              <div className="font-semibold text-right">Niveaux choisis:</div>
              <div className="col-span-3">
                <div className="flex flex-wrap gap-1">
                  {client.niveauServicesChoisis.map((niveau, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {niveau}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section Services */}
          <div className="grid grid-cols-4 items-start gap-4">
            <div className="font-semibold text-right">Services:</div>
            <div className="col-span-3">
              {client.servicesChoisis && client.servicesChoisis.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {client.servicesChoisis.map((service, index) => (
                    <div key={index} className="flex items-center gap-1 mb-1">
                      <Badge variant="secondary">
                        {service.nomService}
                      </Badge>
                      {onRemoveFromService && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => showRemoveFromServiceConfirmation(service._id)}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Retirer
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500">Aucun service choisi</span>
              )}
              
              {/* Bouton pour ajouter un service */}
              {onAddService && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={toggleAddServiceMode}
                >
                  {isAddingService ? (
                    <>Annuler</>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter un service
                    </>
                  )}
                </Button>
              )}
              
              {/* Formulaire d'ajout de service */}
              {isAddingService && (
                <div className="mt-4 p-3 border rounded-md bg-gray-50">
                  <h4 className="font-medium mb-2">Ajouter un service</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="service-select">Service</Label>
                      <select
                        id="service-select"
                        className="w-full border border-gray-300 rounded-md p-2 mt-1"
                        value={selectedServiceId}
                        onChange={handleServiceChange}
                      >
                        <option value="">Sélectionner un service</option>
                        {Array.isArray(services) && services.length > 0 ? (
                          services
                            // Filtrer les services déjà sélectionnés
                            .filter(service => 
                              !client.servicesChoisis?.some(clientService => 
                                clientService._id === service._id
                              )
                            )
                            .map(service => (
                              <option key={service._id} value={service._id}>
                                {service.nomService}
                              </option>
                            ))
                        ) : (
                          <option value="" disabled>Aucun service disponible</option>
                        )}
                      </select>
                    </div>
                    
                    {selectedServiceId && selectedServiceNiveaux.length > 0 && (
                      <div>
                        <Label htmlFor="niveau-select">Niveau de service</Label>
                        <select
                          id="niveau-select"
                          className="w-full border border-gray-300 rounded-md p-2 mt-1"
                          value={selectedNiveauService}
                          onChange={handleNiveauServiceChange}
                        >
                          <option value="">Sélectionner un niveau</option>
                          {selectedServiceNiveaux.map((niveau, index) => (
                            <option key={niveau._id || index} value={niveau.nom}>
                              {niveau.nom} - {niveau.tarif} FCFA
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        onClick={onAddService}
                        disabled={!selectedServiceId || !selectedNiveauService}
                      >
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClientProfileTab;