import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/router";
import { app } from './firebase'
const auth = getAuth(app);
export function signin(email, password) {
    // const router = useRouter()

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            // if(user){
            //     router.push('/')

            // }else{
            //     router.push('/login')
            //     console.log("no user in signin")
            // }
            // ...
        })
        .catch((error) => {
            console.log(error)
        });

}