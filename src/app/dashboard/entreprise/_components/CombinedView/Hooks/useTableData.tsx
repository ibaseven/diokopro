// hooks/useTableData.js
import { useState, useEffect, useMemo } from 'react';

/**
 * Hook personnalisé pour gérer les tableaux de données avec filtrage et pagination
 * 
 * @param {Array} initialData - Données initiales du tableau
 * @param {Object} options - Options de configuration
 * @returns {Object} - Retourne les données filtrées, les contrôles de page et les contrôles de filtrage
 */
const useTableData = (initialData = [], options = {}) => {
  const {
    itemsPerPage = 6,
    defaultFilterValue = 'all',
    filterField = null,
  } = options;

  // États
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState(defaultFilterValue);

  // Utiliser useMemo pour le filtrage au lieu d'un useEffect + setState
  // Cela évite les rendus en cascade et les boucles potentielles
  const filteredData = useMemo(() => {
    let result = [...initialData];

    // Filtre de recherche textuelle
    if (searchTerm.trim() !== '') {
      const normalizedSearchTerm = searchTerm.toLowerCase().trim();
      result = result.filter(item =>
        Object.values(item)
          .filter(val => typeof val === 'string' || typeof val === 'number' || val instanceof String)
          .some(val => String(val).toLowerCase().includes(normalizedSearchTerm))
      );
    }

    // Filtre par champ
    if (filterField && filterValue !== 'all') {
      result = result.filter(item => {
        const fieldValue = item[filterField.field];
        return filterValue === 'true' 
          ? fieldValue === true
          : fieldValue === false || fieldValue === undefined;
      });
    }

    return result;
  }, [searchTerm, filterValue, initialData, filterField]);

  // Effet séparé UNIQUEMENT pour réinitialiser la page quand les filtres changent
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterValue, initialData?.length]);

  // Calculs de pagination optimisés avec useMemo
  const totalPages = useMemo(() => 
    Math.ceil(filteredData.length / itemsPerPage), 
    [filteredData.length, itemsPerPage]
  );
  
  const displayedData = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, page, itemsPerPage]);

  return {
    // Données
    allData: initialData,
    filteredData,
    displayedData,
    
    // Contrôles de page
    page,
    setPage,
    totalPages,
    
    // Contrôles de filtrage
    searchTerm,
    setSearchTerm,
    filterValue,
    setFilterValue,
  };
};

export default useTableData;