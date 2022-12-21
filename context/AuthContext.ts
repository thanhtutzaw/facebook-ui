import { createContext } from "react";
import { User } from "firebase/auth";
const AuthContext = createContext<{ user: User | null }>({ user: null });
export default AuthContext;
