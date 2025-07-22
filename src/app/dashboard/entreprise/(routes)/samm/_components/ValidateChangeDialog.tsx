import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { validatePendingChange } from '@/actions/pending';
import { PendingChange } from '../_Models/pendingchange.model';


interface ValidateChangeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    selectedChange: PendingChange | null;
    entrepriseId: string;
}

const ValidateChangeDialog: React.FC<ValidateChangeDialogProps> = ({
    isOpen,
    onClose,
    selectedChange,
    entrepriseId,
}) => {
    const [otp, setOtp] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleValidate = async () => {
        if (!selectedChange || !entrepriseId) return;

        setIsProcessing(true);
        try {
            const result = await validatePendingChange({
                pendingChangeId: selectedChange.pendingChangeId,
                entrepriseId,
                otp,
            });

            if (result.type === 'error') {
                throw new Error(result.error || Object.values(result.errors || {})[0]?.[0]);
            }

            toast.success(result.message || "La modification a été validée avec succès");
            onClose();
            window.location.reload();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
        } finally {
            setIsProcessing(false);
            setOtp('');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Valider la modification</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Input
                        placeholder="Entrez le code OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                        Annuler
                    </Button>
                    <Button onClick={handleValidate} disabled={!otp || isProcessing}>
                        {isProcessing ? "Validation..." : "Valider"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ValidateChangeDialog;