// components/AgentsList.jsx - Mise à jour pour passer toutes les props nécessaires
import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import TableView from './TableView';
import SearchFilter from './SearchFilter';
import DateFilterComponent from './DateFilterComponent';
import useDateFilter from '../Hooks/useDateFilter';
import useTableData from '../Hooks/useTableData';

const AgentsList = ({ agents, onAgentClick }) => {
  // Hook pour le filtrage par date
  const dateFilter = useDateFilter();
  
  // Filtrage par date effectué AVANT useTableData pour éviter les boucles
  const dateFilteredAgents = useMemo(() => {
    if (!dateFilter.dateFilterActive) {
      return agents;
    }
    
    let result = [...agents];
    
    if (dateFilter.dateFilterMode === 'single' && dateFilter.selectedDate) {
      result = dateFilter.filterItemsByDate(
        result, 
        dateFilter.selectedDate, 
        dateFilter.dateFilterType,
        'virementsRecus',
        'virementsRecus',
        'dateProchainVirement'
      );
    } else if (dateFilter.dateFilterMode === 'range' && dateFilter.dateRange.from && dateFilter.dateRange.to) {
      result = dateFilter.filterItemsByDateRange(
        result, 
        dateFilter.dateRange, 
        dateFilter.dateFilterType,
        'virementsRecus',
        'virementsRecus',
        'dateProchainVirement'
      );
    }
    
    return result;
  }, [
    agents,
    dateFilter.dateFilterActive,
    dateFilter.dateFilterMode,
    dateFilter.selectedDate,
    dateFilter.dateRange,
    dateFilter.dateFilterType,
    dateFilter.filterItemsByDate,
    dateFilter.filterItemsByDateRange
  ]);

  // Hooks pour le tableau et le filtrage - utilise les agents DÉJÀ filtrés par date
  const {
    displayedData: displayedAgents,
    page: agentPage,
    setPage: setAgentPage,
    totalPages: agentTotalPages,
    searchTerm: agentSearchTerm,
    setSearchTerm: setAgentSearchTerm,
    filterValue: agentPaymentFilter,
    setFilterValue: setAgentPaymentFilter,
  } = useTableData(dateFilteredAgents, {
    itemsPerPage: 6,
    filterField: { field: 'dejaPaye' }
  });

  // Colonnes du tableau
  const agentColumns = useMemo(() => [
    {
      header: "Nom(s)",
      field: "nom",
      cellClassName: "text-sm font-medium text-gray-900 uppercase",
      defaultValue: "IPSUM"
    },
    {
      header: "Prénom(s)",
      field: "prenom",
      cellClassName: "text-sm text-gray-900",
      defaultValue: "Lorem"
    },
    {
      header: "Email",
      field: "email",
      cellClassName: "text-sm text-gray-500",
      defaultValue: "ip.lorem@gmail.com"
    },
    {
      header: "Téléphone",
      field: "telephone",
      cellClassName: "text-sm text-gray-500",
      defaultValue: "778282828"
    },
    {
      header: "Services",
      render: (agent) => (
        agent.servicesAffecte && agent.servicesAffecte.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {agent.servicesAffecte.map((service, index) => (
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
      field: "role",
      cellClassName: "text-sm text-gray-500",
      defaultValue: "Word"
    },
    {
      header: "Paiement",
      render: (agent) => (
        <Badge className={agent.dejaPaye ? "bg-[#10C400] text-white" : "bg-[#6F7BFF] text-white"}>
          {agent.dejaPaye ? "Deja Payés" : "À Payés"}
        </Badge>
      )
    }
  ], []);

  // Options pour le filtre de paiement
  const paymentFilterOptions = useMemo(() => [
    { value: 'all', label: 'Tout les Agents' },
    { value: 'true', label: 'Deja Payés' },
    { value: 'false', label: 'À Payés' }
  ], []);

  // Message d'erreur personnalisé pour les données vides
  const getEmptyMessage = () => {
    if (agentSearchTerm) {
      return "Aucun agent ne correspond à votre recherche";
    }
    if (agentPaymentFilter !== 'all') {
      return `Aucun agent ${agentPaymentFilter === 'true' ? 'Deja Payés' : 'À Payés'} trouvé`;
    }
    if (dateFilter.dateFilterActive) {
      return "Aucun agent ne correspond aux critères de date sélectionnés";
    }
    return "Aucun agent trouvé";
  };

  return (
    <div>
      <div className='flex justify-between items-center mb-2'>
        <h2 className="text-xl font-semibold text-blue-500">Liste des Agents</h2>
        <div className="flex space-x-2 items-center">
          {/* Filtre de date - Assurez-vous de passer TOUTES les props nécessaires, y compris setDateFilterType */}
          <DateFilterComponent 
            dateFilterMode={dateFilter.dateFilterMode}
            setDateFilterMode={dateFilter.setDateFilterMode}
            selectedDate={dateFilter.selectedDate}
            dateRange={dateFilter.dateRange}
            dateFilterActive={dateFilter.dateFilterActive}
            dateFilterType={dateFilter.dateFilterType}
            step={dateFilter.step}
            isCalendarOpen={dateFilter.isCalendarOpen}
            setIsCalendarOpen={dateFilter.setIsCalendarOpen}
            resetDateFilters={dateFilter.resetDateFilters}
            handleSingleDateSelection={dateFilter.handleSingleDateSelection}
            handleRangeDateSelection={dateFilter.handleRangeDateSelection}
            applyFilter={dateFilter.applyFilter}
            setDateFilterType={dateFilter.setDateFilterType} // ⚠️ Ajout de cette prop qui manquait 
          />
          
          {/* Filtre de recherche et statut */}
          <SearchFilter 
            searchTerm={agentSearchTerm}
            onSearchChange={setAgentSearchTerm}
            filterValue={agentPaymentFilter}
            onFilterChange={setAgentPaymentFilter}
            filterOptions={paymentFilterOptions}
            searchPlaceholder="Rechercher un agent"
          />
        </div>
      </div>

      {/* Tableau des agents */}
      <TableView 
        data={displayedAgents}
        columns={agentColumns}
        onRowClick={onAgentClick}
        currentPage={agentPage}
        totalPages={agentTotalPages}
        onPageChange={setAgentPage}
        emptyMessage={getEmptyMessage()}
      />
    </div>
  );
};

export default React.memo(AgentsList);