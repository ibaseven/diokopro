import { Card, CardContent, CardHeader } from '@/components/ui/card'
import React from 'react'
import { Wallet } from "lucide-react"

interface BalanceProps {
  totalSolde: number;
}

export default function BalanceEntrepriseAllEntreprise({ totalSolde }: BalanceProps) {
  // Formatter le montant pour ajouter des séparateurs de milliers
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('fr-FR');
  };

  return (
    <>
      <div className="space-y-6">
        {/* Account Management */}
        <Card className="shadow-sm flex border bg-[#09AFEF]">
          <CardHeader className="pb-2 flex justify-between items-center">
            <div className="bg-white p-2 rounded-full shadow-sm">
              <Wallet size={24} color="#09AFEF" strokeWidth={2} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-white">{formatAmount(totalSolde)} FCFA</h1>
                <p className="text-sm text-white/80">Solde disponible</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}