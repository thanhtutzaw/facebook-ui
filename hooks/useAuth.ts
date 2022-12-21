import AuthContext from "../context/AuthContext"
import {useContext} from 'react'

const useAuth =()=>{
     const user = useContext(AuthContext)
     return {user}
}
export default useAuth()