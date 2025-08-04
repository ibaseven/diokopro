// page.tsx (Server Component)
import { fetchJSON } from '@/lib/api';
import { GET_ALL_SERVICE, ENTERPRISES_ENDPOINT, GET_ALL_CLIENT_URL } from '@/actions/endpoint';
import ClientsByServiceView from './_components/ClientsByServiceView';

const ClientsByServicePage = async () => {
  // First fetch the enterprises to get the current enterprise ID
  const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT);
 // console.log(enterprises);
  
  const currentEnterpriseId = enterprises[0]?._id; // Assuming you want the first enterprise
  //console.log(currentEnterpriseId);
  
  if (!currentEnterpriseId) {
    throw new Error("No enterprise found");
  }
  
  // Then fetch services for the specific enterprise
  const clients = await fetchJSON(`${GET_ALL_CLIENT_URL}/${currentEnterpriseId}/clients`);
  //console.log("Services for enterprise:", clients);
  
  return (
    <ClientsByServiceView 
      clients={clients.data}
      entrepriseId={currentEnterpriseId} services={[]}    />
  );
};

export default ClientsByServicePage;