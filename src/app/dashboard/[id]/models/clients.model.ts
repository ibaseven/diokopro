// models/clients.model.ts
export interface ClientDetailType {
    _id: string;
    nom: string;
    prenom?: string;
    rccm?: string;
    nomService?: string;
    adresse?: string;
    telephone?: string;
    email?: string;
    dateCreation?: string;
    servicesChoisis:{
        nomService:string
    }
    
  }
  
  export interface ServiceType {
    _id: string;
    nom: string;
    description?: string;
    entrepriseId: string;
  }
  
  export interface ClientType {
    telephone: string;
    _id: string;
    nom: string;
    prenom?: string;
    email?: string;
    entrepriseId: string;
    serviceId: string;
    servicesChoisis:{
        length: number;
        map(arg0: (service: unknown, index: unknown) => import("react").JSX.Element): import("react").ReactNode;
        nomService:string
    }
  }