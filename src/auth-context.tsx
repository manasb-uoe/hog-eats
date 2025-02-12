import { Alert, CircularProgress } from "@mui/material";
import {
  Auth,
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
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
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        return signInWithEmailAndPassword(
          auth,
          "manas.bajaj94@gmail.com",
          "123456"
        );
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
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
    return (
      <div className="flex items-center justify-center h-full">
        <CircularProgress />
      </div>
    );
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
