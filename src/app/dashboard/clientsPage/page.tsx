
import { fetchJSON } from '@/lib/api'
import { GET_ALL_SERVICE, ENTERPRISES_ENDPOINT } from '@/actions/endpoint'
import CreateClientModal from './_components/Addclients'

const ClientPage = async () => {
  // Fetch the enterprise first
  const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT);
  const currentEnterpriseId = enterprises[0]?._id; // Assuming you want the first enterprise
  
  if (!currentEnterpriseId) {
    throw new Error("No enterprise found");
  }
  
  // Then fetch services with enterprise ID
  const servicesData = await fetchJSON(`${GET_ALL_SERVICE}/${currentEnterpriseId}`);
  //console.log(servicesData);
  
  // Add entrepriseId to each service
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const services = servicesData.map((service: any) => ({
    ...service,
    entrepriseId: currentEnterpriseId
  }));
    
  return (
    <CreateClientModal services={services} />
  )
}

export default ClientPage