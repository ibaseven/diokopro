// hooks/useDateFilter.js - Version mise à jour
import { useState, useCallback } from 'react';
import { 
  parseISO,
  isWithinInterval,
  isSameDay,
  isBefore
} from "date-fns";

/**
 * Hook personnalisé pour gérer le filtrage par date
 */
const useDateFilter = () => {
  // États pour le filtrage par date
  const [dateFilterMode, setDateFilterMode] = useState('single');
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [dateFilterActive, setDateFilterActive] = useState(false);
  const [dateFilterType, setDateFilterType] = useState('all');
  const [step, setStep] = useState('from');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Fonction pour réinitialiser les filtres de date - optimisée avec useCallback
  const resetDateFilters = useCallback(() => {
    setSelectedDate(null);
    setDateRange({ from: null, to: null });
    setDateFilterActive(false);
    setDateFilterType('all');
    setStep('from');
  }, []);

  // Fonctions pour le filtrage de date - optimisées avec useCallback pour éviter les re-créations
  const filterItemsByDate = useCallback((items, date, filterType = 'all', paidField, paidDateField, unpaidDateField) => {
    if (!date || !items || !Array.isArray(items)) return items || [];
    
    return items.filter(item => {
      // Pour les éléments déjà payés
      if (filterType === 'all' || filterType === 'paid') {
        if (item[paidDateField] && Array.isArray(item[paidDateField]) && item[paidDateField].length > 0) {
          const hasPaymentOnDate = item[paidDateField].some(payment => {
            if (!payment || !payment.datePaiement) return false;
            
            try {
              const paymentDate = typeof payment.datePaiement === 'string' 
                ? parseISO(payment.datePaiement)
                : new Date(payment.datePaiement);
              
              return isSameDay(paymentDate, date);
            } catch (error) {
              console.error("Erreur de traitement de date:", error);
              return false;
            }
          });
          
          if ((filterType === 'paid' || filterType === 'all') && hasPaymentOnDate) 
            return true;
        }
      }
      
      // Pour les paiements à venir
      if (filterType === 'all' || filterType === 'unpaid') {
        if (item[unpaidDateField]) {
          try {
            const nextPaymentDate = typeof item[unpaidDateField] === 'string' 
              ? parseISO(item[unpaidDateField])
              : new Date(item[unpaidDateField]);
            
            const hasNextPaymentOnDate = isSameDay(nextPaymentDate, date);
            
            if ((filterType === 'unpaid' || filterType === 'all') && hasNextPaymentOnDate) 
              return true;
          } catch (error) {
            console.error("Erreur de traitement de date:", error);
          }
        }
      }
      
      return false;
    });
  }, []);

  const filterItemsByDateRange = useCallback((items, range, filterType = 'all', paidField, paidDateField, unpaidDateField) => {
    if (!range.from || !range.to || !items || !Array.isArray(items)) return items || [];
    
    // S'assurer que la date "from" est avant la date "to"
    const from = range.from < range.to ? range.from : range.to;
    const to = range.from < range.to ? range.to : range.from;
    
    return items.filter(item => {
      // Pour les paiements déjà effectués
      if (filterType === 'all' || filterType === 'paid') {
        if (item[paidDateField] && Array.isArray(item[paidDateField]) && item[paidDateField].length > 0) {
          const hasPaymentInRange = item[paidDateField].some(payment => {
            if (!payment || !payment.datePaiement) return false;
            
            try {
              const paymentDate = typeof payment.datePaiement === 'string' 
                ? parseISO(payment.datePaiement)
                : new Date(payment.datePaiement);
              
              return isWithinInterval(paymentDate, { start: from, end: to });
            } catch (error) {
              console.error("Erreur de traitement de date:", error);
              return false;
            }
          });
          
          if ((filterType === 'paid' || filterType === 'all') && hasPaymentInRange) 
            return true;
        }
      }
      
      // Pour les paiements à venir
      if (filterType === 'all' || filterType === 'unpaid') {
        if (item[unpaidDateField]) {
          try {
            const nextPaymentDate = typeof item[unpaidDateField] === 'string' 
              ? parseISO(item[unpaidDateField])
              : new Date(item[unpaidDateField]);
            
            const nextPaymentInRange = isWithinInterval(nextPaymentDate, { start: from, end: to });
            
            if ((filterType === 'unpaid' || filterType === 'all') && nextPaymentInRange) 
              return true;
          } catch (error) {
            console.error("Erreur de traitement de date:", error);
          }
        }
      }
      
      return false;
    });
  }, []);

  // Gestionnaires d'événements de sélection de date - optimisés avec useCallback
  const handleSingleDateSelection = useCallback((date, filterType = 'all') => {
    setSelectedDate(date);
    setDateFilterType(filterType);
    setDateFilterActive(true);
    setIsCalendarOpen(false);
  }, []);

  const handleRangeDateSelection = useCallback((date) => {
    if (step === 'from') {
      setDateRange({ from: date, to: null });
      setStep('to');
    } else {
      if (isBefore(date, dateRange.from)) {
        setDateRange({ from: date, to: dateRange.from });
      } else {
        setDateRange({ ...dateRange, to: date });
      }
      setStep('from');
    }
  }, [step, dateRange]);

  const applyFilter = useCallback(() => {
    setDateFilterActive(true);
    setIsCalendarOpen(false);
  }, []);

  return {
    // États
    dateFilterMode,
    selectedDate,
    dateRange,
    dateFilterActive,
    dateFilterType,
    step,
    isCalendarOpen,
    
    // Setters
    setDateFilterMode,
    setSelectedDate,
    setDateRange,
    setDateFilterActive,
    setDateFilterType, // ⚠️ C'est cette fonction qui est requise par DateFilterComponent
    setStep,
    setIsCalendarOpen,
    
    // Fonctions
    resetDateFilters,
    filterItemsByDate,
    filterItemsByDateRange,
    handleSingleDateSelection,
    handleRangeDateSelection,
    applyFilter,
  };
};

export default useDateFilter;