export type RequestData = {
    nom: string;
    prenom: string;
    email: string;
    password: string;
    telephone: string;
    nomEntreprise: string;
    ninea: string;
    dateCreation: string;
    rccm: string;
    representéPar: string;
  };

  export type FormDataRegister = {
    nom: string;           // Correspond à lastName
    prenom: string;        // Correspond à firstName
    email: string;         // Reste identique
    password: string;      // Reste identique
    telephone: string;     // Correspond à phone
    nomEntreprise: string; // Correspond à companyName
    ninea: string;         // Nouveau champ spécifique
    dateCreation: string;  // Nouveau champ spécifique
    rccm: string;         // Nouveau champ spécifique     // Nouveau champ spécifique
    representéPar: string; // Nouveau champ spécifique
};