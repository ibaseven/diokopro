/**
 * Formate une date au format français
 * @param dateString La date à formater
 * @returns La date formatée (JJ/MM/AAAA)
 */
export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  /**
   * Vérifie si un client est considéré comme nouveau (inscription dans les 15 derniers jours)
   * @param dateCreation La date d'inscription du client
   * @returns true si le client s'est inscrit il y a 15 jours ou moins
   */
  export const isNewClient = (dateCreation: string) => {
    const creationDate = new Date(dateCreation);
    const currentDate = new Date();
    const diffTime = currentDate.getTime() - creationDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 15;
  };