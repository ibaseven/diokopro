import { ENTERPRISES_ENDPOINT, GET_ALL_GERANTS, GET_ALL_GERANTS_BY_ENTREPRISE } from '@/actions/endpoint';
import { fetchJSON } from '@/lib/api';
import React from 'react'
import GerantsView from './GerantView';

export default async function page() {

      const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT);
      
      const currentEnterpriseId = enterprises[0]?._id; // Assuming you want the first enterprise
    
      if (!currentEnterpriseId) {
        throw new Error("No enterprise found");
      }
      const gerantsResponse = await fetchJSON(`${GET_ALL_GERANTS_BY_ENTREPRISE}/${currentEnterpriseId}`);
      console.log("+++++++gerant",gerantsResponse);
      
  return (
    <GerantsView gerants={gerantsResponse.gerants} services={[]} entrepriseId={''}/>
  )
}
