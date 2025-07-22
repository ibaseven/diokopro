import { fetchJSON } from '@/lib/api'
import { ENTERPRISES_ENDPOINT, PENDING_CHANGES_ENDPOINT } from '@/actions/endpoint'
import PendingChangesList from './_components/pendingList'


const AdminPage = async () => {
  const entrepriseId = await fetchJSON(ENTERPRISES_ENDPOINT)
  const currentEnterpriseId = entrepriseId[0]?._id; // Assuming you want the first enterprise
  console.log(currentEnterpriseId);
  
  const pendingChanges = await fetchJSON(`${PENDING_CHANGES_ENDPOINT}/${currentEnterpriseId}`)
  console.log(pendingChanges.data);
  
  return (
    <>
     

      <PendingChangesList pendingChanges={pendingChanges.data} entrepriseId={currentEnterpriseId} />
      
    </>
  )
}

export default AdminPage