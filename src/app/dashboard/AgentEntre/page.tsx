import { fetchJSON } from '@/lib/api'
import CreateGerantModal from './_components/test'
import { ENTERPRISES_ENDPOINT } from '@/actions/endpoint'


const GerantPage = async () => {
  const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT)

  
  return (
    <div>
      <CreateGerantModal enterprises={enterprises} />
    </div>
  )
}
export default GerantPage