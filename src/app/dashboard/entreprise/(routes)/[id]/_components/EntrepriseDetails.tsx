import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EntrepriseDetailType } from '../../_models/entreprise.model';



interface EntrepriseDetailsProps {
  entreprise?: EntrepriseDetailType | null;
  isLoading?: boolean;
  error?: string | null;
  currentUser?: unknown; // Add this line
}
const EntrepriseDetails: React.FC<EntrepriseDetailsProps> = ({
  entreprise,
  isLoading = false,
  error = null,
}) => {
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

  if (!entreprise) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-yellow-50">
        <CardContent className="pt-6">
          <p className="text-yellow-600">Aucune entreprise trouvée</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {entreprise.nomEntreprise}
          <span 
            className={`ml-4 text-sm px-2 py-1 rounded ${
              entreprise.estActif 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}
          >
            {entreprise.estActif ? 'Actif' : 'Inactif'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-600">NINEA</h3>
              <p>{entreprise.ninea || 'Non renseigné'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-600">RCCM</h3>
              <p>{entreprise.rccm || 'Non renseigné'}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-600">Solde</h3>
            <p className="text-lg font-medium">
              {typeof entreprise.solde === 'number' 
                ? `${entreprise.solde.toLocaleString()} FCFA`
                : '0 FCFA'}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-600">Représenté par</h3>
            <p>{entreprise.representéPar || 'Non renseigné'}</p>
          </div>

          {entreprise.adresse && (
            <div>
              <h3 className="font-semibold text-gray-600">Adresse</h3>
              <p>{entreprise.adresse}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {entreprise.téléphone && (
              <div>
                <h3 className="font-semibold text-gray-600">Téléphone</h3>
                <p>{entreprise.téléphone}</p>
              </div>
            )}
            {entreprise.email && (
              <div>
                <h3 className="font-semibold text-gray-600">Email</h3>
                <p>{entreprise.email}</p>
              </div>
            )}
          </div>

          {entreprise.dateCreation && (
            <div>
              <h3 className="font-semibold text-gray-600">Date de création</h3>
              <p>{new Date(entreprise.dateCreation).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EntrepriseDetails;