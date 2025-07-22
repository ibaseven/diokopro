"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Pencil, Trash2 } from 'lucide-react';
import { ClientType, ServiceType, ClientDetailType } from '../models/clients.model';
import { Toaster, toast } from "sonner";
import { useRouter } from 'next/navigation';
import { deleteClient, updateClient } from '@/actions/clientreq';

interface ClientsDetailsProps {
  entreprise: ClientDetailType[];
  services: ServiceType[] | null;
  client: ClientType;
  isLoading?: boolean;
  error?: string | null;
  currentEnterpriseId: string;
}

const ClientDetails: React.FC<ClientsDetailsProps> = ({
  entreprise,
  services,
  client,
  isLoading = false,
  error = null,
  currentEnterpriseId
}) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editedClient, setEditedClient] = useState(client || {});

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-500">Erreur: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!entreprise || !client) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-yellow-50">
        <CardContent className="pt-6">
          <p className="text-yellow-600">Aucune donnée trouvée</p>
        </CardContent>
      </Card>
    );
  }

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = () => {
    setIsDeleting(true);
  };

  const handleUpdate = async () => {
    try {
      const formData = {
        ...editedClient,
        clientId: client._id,
        entrepriseId: currentEnterpriseId,
        serviceId: client.servicesChoisis[0]._id
      };

      const result = await updateClient(formData);

      if (result.type === 'success') {
        toast.success("Client mis à jour avec succès");
        setIsEditing(false);
        router.refresh();
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const result = await deleteClient({
        clientId: client._id,
        entrepriseId: currentEnterpriseId,
        serviceId: client.servicesChoisis[0]._id
      });

      if (result.type === 'success') {
        toast.success("Client supprimé avec succès");
        router.push(`/dashboard/entreprise/${currentEnterpriseId}/clients`);
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            {client.nom} {client.prenom}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-600">Nom</h3>
                <p>{client.nom}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-600">Prénom</h3>
                <p>{client.prenom}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-600">Email</h3>
              <p>{client.email || 'Non renseigné'}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-600">Téléphone</h3>
              <p>{client.telephone || 'Non renseigné'}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-600">Entreprise</h3>
              <p>{entreprise[0].nom}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-600">Services choisis</h3>
              {client.servicesChoisis && client.servicesChoisis.length > 0 ? (
                <ul className="list-disc pl-5">
                  {client.servicesChoisis.map((service, index) => (
                    <li key={index}>{service.nomService}</li>
                  ))}
                </ul>
              ) : (
                <p>Aucun service choisi</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label>Nom</label>
                <Input
                  value={editedClient.nom}
                  onChange={(e) => setEditedClient({
                    ...editedClient,
                    nom: e.target.value
                  })}
                />
              </div>
              <div className="space-y-2">
                <label>Prénom</label>
                <Input
                  value={editedClient.prenom}
                  onChange={(e) => setEditedClient({
                    ...editedClient,
                    prenom: e.target.value
                  })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label>Email</label>
              <Input
                type="email"
                value={editedClient.email}
                onChange={(e) => setEditedClient({
                  ...editedClient,
                  email: e.target.value
                })}
              />
            </div>
            <div className="space-y-2">
              <label>Téléphone</label>
              <Input
                type="tel"
                value={editedClient.telephone}
                onChange={(e) => setEditedClient({
                  ...editedClient,
                  telephone: e.target.value
                })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdate}>
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cela supprimera définitivement le client
              et toutes ses données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleting(false)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ClientDetails;