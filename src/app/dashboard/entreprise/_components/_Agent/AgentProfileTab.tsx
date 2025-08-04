// components/agent/AgentProfileTab.tsx

import React from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';
import { Agent, Service, NiveauService } from '@/app/lib/types'; // Adjust the import path as necessary

interface AgentProfileTabProps {
  agent: Agent;
  isEditing: boolean;
  formData: Partial<Agent>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  
  // Service management
  services: Service[];
  isAddingService: boolean;
  selectedServiceId: string;
  selectedNiveauService: string;
  selectedServiceNiveaux: NiveauService[];
  
  // Handlers
  onAddService?: () => void;
  onRemoveFromService?: (serviceId: string) => void;
  toggleAddServiceMode: () => void;
  handleServiceChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleNiveauServiceChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  showRemoveFromServiceConfirmation: (serviceId: string) => void;
}

const AgentProfileTab: React.FC<AgentProfileTabProps> = ({
  agent,
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

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <div className="font-semibold text-right">Last Name:</div>
        <div className="col-span-3">
          {isEditing ? (
            <Input
              name="nom"
              value={formData.nom || ''}
              onChange={onInputChange}
            />
          ) : (
            agent.nom
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <div className="font-semibold text-right">First Name:</div>
        <div className="col-span-3">
          {isEditing ? (
            <Input
              name="prenom"
              value={formData.prenom || ''}
              onChange={onInputChange}
            />
          ) : (
            agent.prenom
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
            agent.email
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <div className="font-semibold text-right">Phone:</div>
        <div className="col-span-3">
          {isEditing ? (
            <Input
              name="telephone"
              value={formData.telephone || ''}
              onChange={onInputChange}
            />
          ) : (
            agent.telephone
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <div className="font-semibold text-right">Address:</div>
        <div className="col-span-3">
          {isEditing ? (
            <Input
              name="adresse"
              value={formData.adresse || ''}
              onChange={onInputChange}
            />
          ) : (
            agent.adresse || "-"
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
            agent.nin || "-"
          )}
        </div>
      </div>

      {!isEditing && (
        <>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-semibold text-right">Status:</div>
            <div className="col-span-3">
              <Badge variant={agent.estNouveau ? "default" : "secondary"}>
                {agent.estNouveau ? "New agent" : "Existing agent"}
              </Badge>
            </div>
          </div>

          {agent.dateCreation && (
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="font-semibold text-right">Creation date:</div>
              <div className="col-span-3">
                {new Date(agent.dateCreation).toLocaleDateString('fr-FR')}
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 items-start gap-4">
            <div className="font-semibold text-right">Services:</div>
            <div className="col-span-3">
              {agent.servicesAffecte && agent.servicesAffecte.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {agent.servicesAffecte.map((service, index) => (
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
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500">No services selected</span>
              )}
              
              {onAddService && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={toggleAddServiceMode}
                >
                  {isAddingService ? (
                    <>Cancel</>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1" />
                      Add a service
                    </>
                  )}
                </Button>
              )}
              
              {isAddingService && (
                <div className="mt-4 p-3 border rounded-md bg-gray-50">
                  <h4 className="font-medium mb-2">Add a service</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="service-select">Service</Label>
                      <select
                        id="service-select"
                        className="w-full border border-gray-300 rounded-md p-2 mt-1"
                        value={selectedServiceId}
                        onChange={handleServiceChange}
                      >
                        <option value="">Select a service</option>
                        {Array.isArray(services) && services.length > 0 ? (
                          services
                            .filter(service => 
                              !agent.servicesAffecte?.some(agentService => 
                                agentService._id === service._id
                              )
                            )
                            .map(service => (
                              <option key={service._id} value={service._id}>
                                {service.nomService}
                              </option>
                            ))
                        ) : (
                          <option value="" disabled>No services available</option>
                        )}
                      </select>
                    </div>
                    
                    {selectedServiceId && selectedServiceNiveaux.length > 0 && (
                      <div>
                        <Label htmlFor="niveau-select">Service level</Label>
                        <select
                          id="niveau-select"
                          className="w-full border border-gray-300 rounded-md p-2 mt-1"
                          value={selectedNiveauService}
                          onChange={handleNiveauServiceChange}
                        >
                          <option value="">Select a level</option>
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
                        Add
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

export default AgentProfileTab;