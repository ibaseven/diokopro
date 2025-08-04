import React from 'react'
import BalanceEntreprise from '../BalanceEntreprise'
import { fetchJSON } from '@/lib/api';
import { BALANCE_ENDPOINT, ENTERPRISES_ENDPOINT } from '@/actions/endpoint';

export default async function Balance() {

    const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT);
      const currentEnterpriseId = enterprises[0]?._id; // Assuming you want the first enterprise
      
      const balance =await fetchJSON(`${BALANCE_ENDPOINT}/${currentEnterpriseId}`)
      //console.log("++++++++++++++balance",balance);
      
  return (
 <BalanceEntreprise balances={balance}/>
  )
}
