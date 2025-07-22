export type EntrepriseType = {
    _id: string;
    nomEntreprise: string;
    ninea: string;
    dateCreation: string; // ou Date si vous préférez utiliser le type Date
    estActif: boolean;
    rccm: string;
    solde: number;
    gerants: Array<object>; // Vous pouvez remplacer `Object` par un type plus spécifique si vous connaissez la structure des gérants
    représentéPar: string;
  };
  export type InterfaceEntreprise ={
    _id: string;
    nomEntreprise: string;
    ninea: string;
    rccm: string;
    solde: number;
    representéPar: string;
    estActif: boolean;
  }

  export type InterfaceClient ={
    _id: string;
    nomEntreprise: string;
    ninea: string;
    rccm: string;
    solde: number;
    representéPar: string;
    estActif: boolean;
  }
  export interface EntrepriseDetailType {
    _id: string;
    nomEntreprise: string;
    ninea: string;
    rccm: string;
    solde: number;
    representéPar: string;
    estActif: boolean;
    adresse?: string;
    téléphone?: string;
    email?: string;
    dateCreation?: string;
  }