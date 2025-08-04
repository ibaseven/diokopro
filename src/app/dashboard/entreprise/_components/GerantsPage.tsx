// app/dashboard/gerants/page.tsx (Server Component)
import { fetchJSON } from '@/lib/api';
import { ENTERPRISES_ENDPOINT, GET_ALL_GERANTS } from '@/actions/endpoint';
import GerantsView from './GerantsView';

// Ajoutez cette constante à votre fichier endpoint.js
// export const GET_ALL_GERANTS = '/api/getAllGerants/entreprise';



const GerantsPage = async () => {
  // Fetch the enterprises to get the current enterprise ID
  const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT);
  
  const currentEnterpriseId = enterprises[0]?._id; // Assuming you want the first enterprise
  
  if (!currentEnterpriseId) {
    throw new Error("No enterprise found");
  }
  
  // Fetch gerants for the enterprise
  const gerantsResponse = await fetchJSON(`${GET_ALL_GERANTS}/${currentEnterpriseId}`);
  //console.log("Gerants response:", gerantsResponse);
  
  // Adapt this line according to your API response structure
  const gerants = Array.isArray(gerantsResponse) ? gerantsResponse : gerantsResponse.gerants || [];
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestion des Gérants</h1>
      <GerantsView 
        gerants={gerants} 
        entrepriseId={currentEnterpriseId} 
      />
    </div>
  );
};

export default GerantsPage;