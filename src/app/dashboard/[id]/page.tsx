import { fetchJSON } from '@/lib/api';

import ClientDetails from './_components/ClientsDetails';
import { ENTERPRISES_ENDPOINT, GET_ALL_SERVICE, GET_CLIENT_BY_ID } from '@/actions/endpoint';


type Props = {
  params: {
    id: string;
  };
};

const ClientsDetailsPage = async ({ params }: Props) => {
  // Wait for params
  const clientId = await params.id;

  try {
    // Récupérer les détails de l'entreprise
    const enterprise = await fetchJSON(`${ENTERPRISES_ENDPOINT}`);
    const entrepriseId = enterprise[0]?._id;

    if (!entrepriseId) {
      throw new Error("Enterprise ID not found");
    }

    // Récupérer les services associés à l'entreprise
    const services = await fetchJSON(`${GET_ALL_SERVICE}/${entrepriseId}`);
    const currentServiceId = services[0]?._id;

    if (!currentServiceId) {
      throw new Error("Service ID not found");
    }

    // Récupérer les détails du client
    const response = await fetchJSON(
      `${GET_CLIENT_BY_ID}/entreprise/${entrepriseId}/client/${clientId}`
    );
console.log(response);

    return (
      <div className="p-6">
        <ClientDetails
          entreprise={enterprise}
          services={services}
          client={response.data}
          currentEnterpriseId={entrepriseId}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return (
      <div className="p-6">
        <div className="text-red-500">
          Une erreur est survenue lors du chargement des données.
        </div>
      </div>
    );
  }
};

export default ClientsDetailsPage;