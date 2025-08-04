import { fetchJSON } from '@/lib/api'
import { ENTERPRISES_ENDPOINT } from '@/actions/endpoint'
import CreateServiceModal from './_components/service'

const ServicePage = async () => {
  const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT)
  //console.log("entre",enterprises);
  
  return (
    <div className="">
      <CreateServiceModal enterprises={enterprises} />
    </div>
  )
}

export default ServicePage