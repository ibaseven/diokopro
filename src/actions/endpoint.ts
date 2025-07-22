export const API_URL = process.env.NEXT_PUBLIC_API_URL
export const MEDIA_URL = process.env.PROVIDER_AND_MEDIA_URL
export const API_FILE = process.env.API_FILE

// Auth endpoints
export const LOGIN_URL = `${API_URL}/auth/signIn`
export const AUTH_URL = `${API_URL}/verify-token`
export const GERANT_URL= `${API_URL}/createGerant/entreprise`;
export const UPDATE_GERANT_URL= `${API_URL}/updateGerant/entreprise`;
export const UPDATE_AGENT_URL= `${API_URL}/updateAgent/entreprise`;
export const CREATE_AGENT_URL= `${API_URL}/createAgent/entreprise`;
export const REGISTER_URL = `${API_URL}/auth/signUp`
export const ENTERPRISES_ENDPOINT = `${API_URL}/getAllEntreprises`
export const ALL_ENTERPRISES_ENDPOINT = `${API_URL}/authSuper/getAllEntreprises`
export const BALANCE_ENDPOINT = `${API_URL}/AccountBalance`
export const BALANCE_ENDPOINT_FOR_ALL_ENTREPRISE = `${API_URL}/AllAccountBalanceEntreprise`
export const ENTERPRISES_INACTIVES_ENDPOINT = `${API_URL}/authSuper/entreprises/inactives`
export const GET_ALL_SERVICE=`${API_URL}/getAllServices/entreprise`
export const GET_ALL_HISTORIQUE=`${API_URL}/getAllPayments`
export const SERVICE_URL = `${API_URL}/createService`
export const getEntreprise = `${API_URL}/getEntreprise`
export const CLIENT_URL =`${API_URL}/createClient/entreprise`
export const GET_ALL_CLIENT_URL =`${API_URL}/entreprises`
export const GET_ALL_CLIENT_TO_NOT_PAY_URL =`${API_URL}/getAllClientsWhoDidNotPay/entreprise`
export const GET_ALL_NUMBER_ENTREPRISE =`${API_URL}/getNumbersEntreprise`
export const GET_ALL_CLIENT_TO_PAY_URL =`${API_URL}/getAllClientsWhoPayed/entreprise`
export const GET_ALL_PAIEMENT_ENTREPRISE_URL =`${API_URL}/getAllPayments`
export const GET_ALL_AGENTS_TO_PAY =`${API_URL}/getAllAgentsToPay/entreprise`
export const GET_ALL_AGENTS_TO_NOT_PAY =`${API_URL}/getAllAgentsNotToPay/entreprise`
export const GET_ALL_AGENTS =`${API_URL}/getAllAgents/entreprise`
export const ALL_GET_ALL_AGENTS =`${API_URL}/getAllAgentsEntreprise`
export const ALL_GET_ALL_CLIENTS_ENTREPRISE =`${API_URL}/getAllClientsEntreprise`
export const DELETE_CLIENT_URL_FOR_A_SERVICE =`${API_URL}/removeServiceFromClient/entreprise`
export const DELETE_CLIENT_URL =`${API_URL}/deleteClient/entreprise`
export const DELETE_AGENT_URL =`${API_URL}/deleteAgent/entreprise`
export const UPDATE_CLIENT_URL =`${API_URL}/updateClient/entreprise`
export const GET_CLIENT_BY_SERVICE_URL =`${API_URL}/getClientsByService`
export const GET_CLIENT_BY_ID=`${API_URL}/getClientById`
export const PENDING_CHANGES_ENDPOINT=`${API_URL}/pending-changes/entreprise`
export const ACCEPTED_PENDING_ENDPOINT=`${API_URL}/validate-change/entreprise`
export const REJECT_PENDING_ENDPOINT=`${API_URL}/reject-change/entreprise`
export const ACTIVATE_ENTREPRISE_URL=`${API_URL}/authSuper/enableOrDisableEntreprise`
export const ASSIGN_MANAGER_URL=`${API_URL}/matchGerantToService/entreprise`
export const GET_ALL_GERANTS=`${API_URL}/getAllAgentsEntreprise`
export const GET_ALL_GERANTS_BY_ENTREPRISE=`${API_URL}/getAllGerants/entreprise`

export const RECHARGE_COMPTE_ENTREPRISE=`${API_URL}/recharge-compte/entreprise`
export const DEBITER_COMPTE_ENTREPRISE=`${API_URL}/retirer-compte/entreprise`
export const REFUSE_ENTREPRISE_URL=`${API_URL}/authSuper/DisableEntreprise`

//Events
