import { app } from "@/lib/firebase";
import { addProfile } from "@/lib/firestore/profile";
import { signin } from "@/lib/signin";
import { account } from "@/types/interfaces";
import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";
import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import useEscape from "./useEscape";
function useLogin() {
  const router = useRouter();
  const [testUserSigninLoading, settestUserSigninLoading] = useState(false);
  const [signupLoading, setsignupLoading] = useState(false);
  const [adding, setadding] = useState(false);
  const [error, seterror] = useState("");
  const [toggleSignUp, settoggleSignUp] = useState(false);

  const auth = getAuth(app);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      // console.log(user, adding);
      // if (user) {
      //   // router.push("/");
      // }
      if (user && adding === false) {
        router.push("/");
      }
      // else if (!user && router.pathname !== "/") {
      // }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, adding]);

  useEscape(() => {
    if (!toggleSignUp) return;
    settoggleSignUp(false);
  });
  const handleTestUserSignin = () => {
    settestUserSigninLoading(true);
    try {
      setTimeout(() => {
        signin("testuser@gmail.com", "111111");
      }, 700);
    } catch (error) {
      settestUserSigninLoading(false);
      console.error(error);
    }
  };

  const emailRef = useRef<HTMLInputElement>(null);
  const [Account, setAccount] = useState<account>({
    email: "",
    password: "",
    profile: {
      firstName: "",
      lastName: "",
      bio: "",
      photoURL: "",
    },
  });
  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    // if (e.target.tagName === "INPUT") {
    //   return; // Ignore click event when typing in the input field
    // }
    if (name === "email" || name === "password") {
      setAccount((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    } else {
      setAccount((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          [name]: type === "checkbox" ? checked : value,
        },
      }));
    }

    //     const emailMethod = await fetchSignInMethodsForEmail(auth, Account.email);
    // const emailExist = emailMethod.length > 0;
    // if(emailExist){
    //   const button = document.getElementsByTagName("button")[0]
    //   button.textContent = "Sign in"
    // }
  };
  const [emailLoading, setemailLoading] = useState(false);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { email, password } = Account;
    const { firstName, lastName } = Account.profile;
    try {
      const emailMethod = await fetchSignInMethodsForEmail(auth, email);
      const emailExist = emailMethod.length > 0;
      const name = document.getElementsByName("firstName")[0];
      console.log("submit");
      // await createUserWithEmailAndPassword(auth, email, password);
      if (emailExist) {
        try {
          setemailLoading(true);
          const { signinError } = await signin(email, password);
          if (signinError) {
            setemailLoading(false);
            seterror(signinError.code);
            setemailLoading(false);
          }
        } catch (error: unknown) {
          setemailLoading(false);
          if (error instanceof FirebaseError) {
            seterror(error.code);
            console.error(error.code);
          }
        }
      } else {
        seterror("");
        name.setAttribute("required", "true");
        if (firstName) {
          setsignupLoading(true);
          setadding(true);
          const UserCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );
          try {
            await addProfile(UserCredential.user, Account.profile);
            setsignupLoading(false);
            setadding(false);
          } catch (error) {
            console.error(error);
          }
        } else {
          name.focus();
        }
      }
    } catch (error: unknown) {
      if (firstName) return;
      if (error instanceof FirebaseError) {
        console.log(error.code);
      }
    }
  };
  return {
    testUserSigninLoading,
    handleTestUserSignin,
    toggleSignUp,
    settoggleSignUp,
    error,
    signupLoading,
    handleSubmit,
    handleChange,
    Account,
    setAccount,
    emailLoading,
    emailRef,
  };
}

export default useLogin;
