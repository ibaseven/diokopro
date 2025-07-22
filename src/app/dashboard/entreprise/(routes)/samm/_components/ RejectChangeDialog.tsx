import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { rejectPendingChange } from '@/actions/pending';
import { PendingChange } from '../_Models/pendingchange.model';


interface RejectChangeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    selectedChange: PendingChange | null;
    entrepriseId: string;
}

const RejectChangeDialog: React.FC<RejectChangeDialogProps> = ({
    isOpen,
    onClose,
    selectedChange,
    entrepriseId,
}) => {
    const [rejectionReason, setRejectionReason] = useState('');
    const [otp, setOtp] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleReject = async () => {
        if (!selectedChange) return;

        setIsProcessing(true);
        try {
            const result = await rejectPendingChange({
                pendingChangeId: selectedChange.pendingChangeId,
                rejectionReason,
                otp,
                entrepriseId,
            });

            if (result.type === 'error') {
                throw new Error(result.error || Object.values(result.errors || {})[0]?.[0]);
            }

            toast.success(result.message || "La modification a été rejetée avec succès");
            onClose();
            window.location.reload();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
        } finally {
            setIsProcessing(false);
            setRejectionReason('');
            setOtp('');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rejeter la modification</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Input
                        placeholder="Raison du rejet"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    />
                    <Input
                        placeholder="Entrez le code OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="mt-2"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                        Annuler
                    </Button>
                    <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason || !otp || isProcessing}>
                        {isProcessing ? "Rejet..." : "Rejeter"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default RejectChangeDialog;