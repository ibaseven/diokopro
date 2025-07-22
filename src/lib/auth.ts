import { AUTH_URL } from "@/actions/endpoint";
import axios from "axios";
import { cookies } from "next/headers"



export const getAuthenticatedUser = async() =>{
    try {
        const cookieStore = await cookies(); 
        const token = cookieStore.get("token")?.value;
        if(!token) return null

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

        const currentUser = await axios.get(`${AUTH_URL}/${token}`)        


        if(!currentUser) return null
          
            
        return currentUser.data.user
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {        
        return null
    }

    
}