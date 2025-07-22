import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

interface ServiceDialogProps {
  service: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedService: any) => void;
}

const ServiceDialog: React.FC<ServiceDialogProps> = ({ 
  service, 
  isOpen, 
  onClose, 
  onUpdate 
}) => {
  const [nomService, setNomService] = useState('');
  const [description, setDescription] = useState('');
  const [tarifactionBase, setTarifactionBase] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (service) {
      setNomService(service.nomService || '');
      setDescription(service.description || '');
      setTarifactionBase(service.tarifactionBase?.toString() || '');
      setIsEditing(false);
    }
  }, [service]);

  const handleUpdate = () => {
    if (!service) return;
    
    const updatedService = {
      ...service,
      nomService,
      description,
      tarifactionBase: parseInt(tarifactionBase, 10) || 0,
    };
    
    onUpdate(updatedService);
    setIsEditing(false);
  };

  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>{isEditing ? "Modifier le service" : "Détails du service"}</span>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifiez les informations du service" : "Informations complètes sur le service"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {isEditing ? (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nomService" className="text-right">Nom:</Label>
                <Input
                  id="nomService"
                  value={nomService}
                  onChange={(e) => setNomService(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description:</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tarifactionBase" className="text-right">Tarif de base:</Label>
                <Input
                  id="tarifactionBase"
                  type="number"
                  value={tarifactionBase}
                  onChange={(e) => setTarifactionBase(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold text-right">Nom:</div>
                <div className="col-span-3">{service.nomService}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold text-right">Description:</div>
                <div className="col-span-3">{service.description || "-"}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold text-right">Tarif de base:</div>
                <div className="col-span-3">{service.tarifactionBase?.toLocaleString() || "-"} FCFA</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold text-right">Gérants:</div>
                <div className="col-span-3">{service.gerants?.join(", ") || "-"}</div>
              </div>
              {service.niveauxDisponibles && service.niveauxDisponibles.length > 0 && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-semibold text-right">Niveaux disponibles:</div>
                  <div className="col-span-3">{service.niveauxDisponibles.join(", ")}</div>
                </div>
              )}
              {service.createdAt && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-semibold text-right">Date de création:</div>
                  <div className="col-span-3">{new Date(service.createdAt).toLocaleDateString('fr-FR')}</div>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="flex justify-end mt-4 gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpdate}>
                Enregistrer
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              Modifier
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDialog;