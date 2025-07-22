import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { verifyOtp } from '@/actions/verifyOtp';
import OtpVerification from '@/app/dashboard/_components/OtpVerification';
interface GerantDialogProps {
  gerant: any;
  entrepriseId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedGerant: any) => void;
  onDelete?: () => void;
  verifyOtp: (code: string, pendingChangeId: string) => Promise<any>;
}

const GerantDialog: React.FC<GerantDialogProps> = ({
  gerant,
  entrepriseId,
  isOpen,
  onClose,
  onUpdate,
  verifyOtp,
}) => {
   const router = useRouter();
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [role, setRole] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
   const [pendingChangeId, setPendingChangeId] = useState('');
  useEffect(() => {
    if (gerant) {
      setNom(gerant.nom || '');
      setPrenom(gerant.prenom || '');
      setEmail(gerant.email || '');
      setTelephone(gerant.telephone || '');
      setRole(gerant.role || '');
      setIsEditing(false);
      setShowOtpVerification(false);
      setOtpCode('');
      setPendingChangeId('');
    }
  }, [gerant]);


  const handleUpdate = async () => {
    if (!gerant) return;

    const updatedGerant = {
      ...gerant,
      nom,
      prenom,
      email,
      telephone,
      entrepriseId: entrepriseId,
      role
    };

    try {
      setIsVerifying(true);
      const result = await onUpdate(updatedGerant);
      setIsVerifying(false);

      if (!result) {
        console.error("Résultat de mise à jour indéfini");
        toast.error("Erreur lors de la mise à jour");
        return;
      }

      console.log("Résultat de mise à jour:", result);

      if (result.data.pendingChangeId) {
        // Si nous avons un pendingChangeId, nous devons collecter un OTP
        setPendingChangeId(result.data.pendingChangeId);
        setIsEditing(false);
        setShowOtpVerification(true);
        toast.info(result.message || "Un code OTP a été envoyé à l'administrateur");
      } else if (result.type === 'success') {
        // Si la mise à jour est réussie sans besoin d'OTP
        toast.success("Le client a été mis à jour avec succès!");
        onClose();
        router.refresh();
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      setIsVerifying(false);
      console.error("Error during update:", error);
      toast.error("Une erreur est survenue");
    }
  };

  // Gérer la vérification OTP
  const handleOtpVerification = async () => {
    if (otpCode.length !== 6) {
      toast.error("Le code doit contenir 6 chiffres");
      return;
    }

    if (!pendingChangeId) {
      console.error("Aucun identifiant de changement en attente");
      toast.error("Une erreur est survenue. Veuillez réessayer.");
      return;
    }

    setIsVerifying(true);
    try {
      console.log("Vérification OTP avec:", { otpCode, pendingChangeId });

      // Appeler la fonction de vérification OTP
      const result = await verifyOtp(otpCode, pendingChangeId);

      // Vérifier si le résultat existe
      if (!result) {
        console.error("Résultat de vérification OTP indéfini");
        toast.error("Échec de la vérification OTP");
        setIsVerifying(false);
        return;
      }

      console.log("Résultat de vérification OTP:", result);

      if (result.type === 'success') {
        toast.success("Le client a été mis à jour avec succès!");

        // Fermer la boîte de dialogue et rafraîchir la page
        onClose();
        router.refresh();
      } else {
        toast.error(result.error || "Échec de la vérification OTP");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Échec de la vérification. Veuillez réessayer.");
    } finally {
      setIsVerifying(false);
    }
  };
  if (!gerant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isVerifying) onClose();
    }}>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>
              {isEditing
                ? "Modifier le client"
                : showOtpVerification
                  ? "Vérification OTP"
                  : "Détails du client"
              }
            </span>
            {!(showOtpVerification && isVerifying) && (
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            )}
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </DialogTitle>
          <DialogDescription>
            <DialogDescription>
              {isEditing
                ? "Modifiez les informations du client"
                : showOtpVerification
                  ? "Vérifiez le code OTP pour confirmer la modification"
                  : "Informations complètes sur le client"
              }
            </DialogDescription>
          </DialogDescription>
        </DialogHeader>
        {showOtpVerification ? (
          <OtpVerification
            otpCode={otpCode}
            setOtpCode={setOtpCode}
            verifyOtp={handleOtpVerification}
            isLoading={isVerifying}
            entityType="client"
          />
        ) : (
          <>
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
                    <Label htmlFor="role" className="text-right">Rôle:</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Sélectionnez un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="gérant">Gérant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="font-semibold text-right">Nom:</div>
                    <div className="col-span-3">{gerant.nom}</div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="font-semibold text-right">Prénom:</div>
                    <div className="col-span-3">{gerant.prenom}</div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="font-semibold text-right">Email:</div>
                    <div className="col-span-3">{gerant.email}</div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="font-semibold text-right">Téléphone:</div>
                    <div className="col-span-3">{gerant.telephone}</div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="font-semibold text-right">Rôle:</div>
                    <div className="col-span-3">
                      <Badge variant={gerant.role === 'admin' ? "success" : "secondary"}>
                        {gerant.role}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <div className="font-semibold text-right">Services affectés:</div>
                    <div className="col-span-3">
                      {gerant.servicesAffecte && gerant.servicesAffecte.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {gerant.servicesAffecte.map((service, index) => (
                            <Badge key={index} variant="outline">
                              {typeof service === 'string' ? service : service.nomService || `Service #${index + 1}`}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">Aucun service affecté</span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
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

export default GerantDialog;