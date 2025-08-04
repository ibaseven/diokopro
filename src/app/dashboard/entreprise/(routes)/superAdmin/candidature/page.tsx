import { fetchJSON } from '@/lib/api'
import { ALL_ENTERPRISES_ENDPOINT, BALANCE_ENDPOINT_FOR_ALL_ENTREPRISE, ENTERPRISES_INACTIVES_ENDPOINT, PENDING_CHANGES_ENDPOINT } from '@/actions/endpoint'
import EntrepriseInactive from './_components/Reqentreprise'



const AdminPage = async () => {

  const entreprises = await fetchJSON(`${ENTERPRISES_INACTIVES_ENDPOINT}`)
  //console.log(entreprises);
    const en = await fetchJSON(`${ALL_ENTERPRISES_ENDPOINT}`)
  //console.log(en);
  // Récupérer l'ID de la première entreprise pour les modifications en attente
  const currentEnterpriseId = entreprises.entreprises?.[0]?._id
  //console.log("ID de l'entreprise actuelle:", currentEnterpriseId)
  
  // Récupérer les modifications en attente (comme dans votre code original)
  const pendingChanges = await fetchJSON(`${PENDING_CHANGES_ENDPOINT}/${currentEnterpriseId}`)
  //console.log("Modifications en attente:", pendingChanges.data)
 
  return (
    <div className="space-y-8 p-6">
      {/* Section pour la liste des entreprises */}
     
      
      {/* Section existante pour les modifications en attente */}
      <EntrepriseInactive entreprises={en}  />
    </div>
  )
}

export default AdminPage