import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import TableView from './TableView';
import SearchFilter from './SearchFilter';
import useTableData from '../Hooks/useTableData';


const ClientsList = ({ clients, onClientClick }) => {
  // Hook pour le tableau et le filtrage
  const {
    displayedData: displayedClients,
    page: clientPage,
    setPage: setClientPage,
    totalPages: clientTotalPages,
    searchTerm: clientSearchTerm,
    setSearchTerm: setClientSearchTerm,
    filterValue: clientPaymentFilter,
    setFilterValue: setClientPaymentFilter,
  } = useTableData(clients, {
    itemsPerPage: 6,
    filterField: { field: 'aDejaPaye' }
  });

  // Colonnes du tableau - optimisées avec useMemo
  const clientColumns = useMemo(() => [
    {
      header: "Nom(s)",
      field: "nom",
      cellClassName: "text-sm font-medium text-gray-900 uppercase"
    },
    {
      header: "Prénom(s)",
      field: "prenom",
      cellClassName: "text-sm text-gray-900"
    },
    {
      header: "Email",
      field: "email",
      cellClassName: "text-sm text-gray-500"
    },
    {
      header: "Téléphone",
      field: "telephone",
      cellClassName: "text-sm text-gray-500"
    },
    {
      header: "Services",
      render: (client) => (
        client.servicesChoisis && client.servicesChoisis.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {client.servicesChoisis.map((service, index) => (
              <Badge key={index} variant="secondary" className="bg-gray-100">
                {service.nomService}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-sm text-gray-500"></span>
        )
      )
    },
    {
      header: "Rôle",
      render: () => <div className="text-sm text-gray-500">Client</div>
    },
    {
      header: "Paiement",
      render: (client) => (
        <Badge className={client.aDejaPaye ? "bg-[#10C400] text-white" : "bg-[#6F7BFF] text-white"}>
          {client.aDejaPaye ? "Déjà Reçus" : "Non Reçus"}
        </Badge>
      )
    }
  ], []);

  // Options pour le filtre de paiement - optimisées avec useMemo
  const paymentFilterOptions = useMemo(() => [
    { value: 'all', label: 'Tout les clients' },
    { value: 'true', label: 'Déjà Reçus' },
    { value: 'false', label: 'Non Reçus' }
  ], []);

  // Message d'erreur personnalisé pour les données vides
  const getEmptyMessage = () => {
    if (clientSearchTerm) {
      return "Aucun client ne correspond à votre recherche";
    }
    if (clientPaymentFilter !== 'all') {
      return `Aucun client ${clientPaymentFilter === 'true' ? 'Déjà Reçus' : 'Non Reçus'} trouvé`;
    }
    return "Aucun client trouvé";
  };

  return (
    <div>
      <div className='flex justify-between mb-2'>
        <h2 className="text-xl font-semibold text-blue-500">Liste des Clients</h2>
        <SearchFilter 
          searchTerm={clientSearchTerm}
          onSearchChange={setClientSearchTerm}
          filterValue={clientPaymentFilter}
          onFilterChange={setClientPaymentFilter}
          filterOptions={paymentFilterOptions}
          searchPlaceholder="Rechercher un client"
        />
      </div>

      {/* Tableau des clients */}
      <TableView 
        data={displayedClients}
        columns={clientColumns}
        onRowClick={onClientClick}
        currentPage={clientPage}
        totalPages={clientTotalPages}
        onPageChange={setClientPage}
        emptyMessage={getEmptyMessage()}
      />
    </div>
  );
};

export default React.memo(ClientsList);