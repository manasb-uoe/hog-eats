import { Firestore } from "firebase/firestore";
import React, { useContext } from "react";

export const DbContext = React.createContext<Firestore>({} as Firestore);

export const useDbContext = () => useContext(DbContext);
