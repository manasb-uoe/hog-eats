import { CircularProgress } from "@mui/material";
import {
  Auth,
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signOut,
  User,
  UserInfo,
} from "firebase/auth";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { Login } from "./login";

type IAuthContext = { user: UserInfo; logout: () => Promise<void> };
const AuthContext = React.createContext<IAuthContext>({} as IAuthContext);

export const useAuthContext = () => {
  return useContext(AuthContext);
};

export const AuthContextProvider = ({
  auth,
  children,
}: React.PropsWithChildren<{ auth: Auth }>) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User logged in:", user.uid);
        setUser(user);
        setLoading(false);
      } else {
        setShowLogin(true);
        setLoading(false);
      }
    });
  }, []);

  const logout = useCallback(async () => {
    return await signOut(auth);
  }, []);

  const onLoginSuccess = useCallback((user: User) => {
    setUser(user);
    setShowLogin(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <CircularProgress />
      </div>
    );
  }

  if (showLogin) {
    return <Login auth={auth} onSuccess={onLoginSuccess} />;
  }

  return (
    <AuthContext.Provider value={{ user: user!, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
