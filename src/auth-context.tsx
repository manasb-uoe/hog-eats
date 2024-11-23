import { Alert, CircularProgress } from "@mui/material";
import {
  Auth,
  onAuthStateChanged,
  signInAnonymously,
  User,
  UserInfo,
} from "firebase/auth";
import React, { useContext, useEffect, useState } from "react";

type IAuthContext = { user: UserInfo };
const AuthContext = React.createContext<IAuthContext>({} as IAuthContext);

export const useAuthContext = () => {
  return useContext(AuthContext);
};

export const AuthContextProvider = ({
  auth,
  children,
}: React.PropsWithChildren<{ auth: Auth }>) => {
  const [error, setError] = useState<Error | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    signInAnonymously(auth).catch((error) => {
      setError(new Error(error.message));
    });

    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User logged in:", user.uid);
        setUser(user);
        setLoading(false);
      }
    });
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <AuthContext.Provider value={{ user: user! }}>
      {children}
    </AuthContext.Provider>
  );
};
