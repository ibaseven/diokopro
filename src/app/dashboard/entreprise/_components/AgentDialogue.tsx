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
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface AgentDialogProps {
  agent: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedAgent: any) => void;
}

const AgentDialog: React.FC<AgentDialogProps> = ({ 
  agent, 
  isOpen, 
  onClose, 
  onUpdate 
}) => {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [role, setRole] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (agent) {
      setNom(agent.nom || '');
      setPrenom(agent.prenom || '');
      setEmail(agent.email || '');
      setTelephone(agent.telephone || '');
      setAdresse(agent.adresse || '');
      setRole(agent.role || '');
      setIsActive(agent.isActive);
      setIsEditing(false);
    }
  }, [agent]);

  const handleUpdate = () => {
    if (!agent) return;
    
    const updatedAgent = {
      ...agent,
      nom,
      prenom,
      email,
      telephone,
      adresse,
      role,
      isActive
    };
    
    onUpdate(updatedAgent);
    setIsEditing(false);
  };

  if (!agent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>{isEditing ? "Modifier l'agent" : "Détails de l'agent"}</span>
           
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifiez les informations de l'agent" : "Informations complètes sur l'agent"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {isEditing ? (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nom" className="text-right">Nom:</Label>
                <Input
                  id="nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="prenom" className="text-right">Prénom:</Label>
                <Input
                  id="prenom"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email:</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="telephone" className="text-right">Téléphone:</Label>
                <Input
                  id="telephone"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="adresse" className="text-right">Adresse:</Label>
                <Input
                  id="adresse"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Rôle:</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionnez un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive" className="text-right">Actif:</Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="isActive">{isActive ? 'Oui' : 'Non'}</Label>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold text-right">Nom:</div>
                <div className="col-span-3">{agent.nom}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold text-right">Prénom:</div>
                <div className="col-span-3">{agent.prenom}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold text-right">Email:</div>
                <div className="col-span-3">{agent.email}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold text-right">Téléphone:</div>
                <div className="col-span-3">{agent.telephone}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold text-right">Adresse:</div>
                <div className="col-span-3">{agent.adresse || "-"}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold text-right">Rôle:</div>
                <div className="col-span-3">{agent.role}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold text-right">Statut:</div>
                <div className="col-span-3">
                  <Badge variant={agent.isActive ? "success" : "destructive"}>
                    {agent.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              </div>
              {agent.dateCreation && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-semibold text-right">Date de création:</div>
                  <div className="col-span-3">
                    {new Date(agent.dateCreation).toLocaleDateString('fr-FR')}
                  </div>
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

export default AgentDialog;