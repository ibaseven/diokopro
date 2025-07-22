// page.tsx (Server Component)
import { fetchJSON } from '@/lib/api';
import { ENTERPRISES_ENDPOINT, GET_ALL_AGENTS } from '@/actions/endpoint';
import AgentsView from './AgentsView';


// Ajoutez cette constante à votre fichier endpoint.js si elle n'existe pas déjà
// export const GET_ALL_AGENTS = '/api/getAgentsByEntreprise';

const AgentsPage = async () => {
  // First fetch the enterprises to get the current enterprise ID
  const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT);
  
  const currentEnterpriseId = enterprises[0]?._id; // Assuming you want the first enterprise
  console.log("entrer",currentEnterpriseId);
  
  if (!currentEnterpriseId) {
    throw new Error("No enterprise found");
  }
  

  const agentsResponse = await fetchJSON(`${GET_ALL_AGENTS}/${currentEnterpriseId}`);
  console.log(agentsResponse);
  
  // Adaptez cette ligne selon la structure de votre réponse API
  const agents = Array.isArray(agentsResponse) ? agentsResponse : agentsResponse.data || [];
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestion des Agents</h1>
      <AgentsView 
        agents={agents} 
        entrepriseId={currentEnterpriseId} 
      />
    </div>
  );
};

export default AgentsPage;