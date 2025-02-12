import { ThemeProvider } from "@emotion/react";
import { createTheme, CssBaseline } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { createRoot } from "react-dom/client";
import App from "./app.tsx";
import { AuthContextProvider } from "./auth-context.tsx";
import { DbContext } from "./db-context.tsx";
import "./index.css";

const firebaseConfig = {
  apiKey: "AIzaSyBueiqndZiaXOxhqNmV5QOhPrLowrRmJvw",
  authDomain: "restaurant-list-vite.firebaseapp.com",
  projectId: "restaurant-list-vite",
  storageBucket: "restaurant-list-vite.firebasestorage.app",
  messagingSenderId: "819208119400",
  appId: "1:819208119400:web:8dd181fa069fad2af447dd",
  measurementId: "G-MNF5J1Z6F6",
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);
const auth = getAuth();
const db = getFirestore(app);

const darkTheme = createTheme({
  palette: {
    mode: "light",
  },
});

createRoot(document.getElementById("root")!).render(
  <ThemeProvider theme={darkTheme}>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <CssBaseline />
      <AuthContextProvider auth={auth}>
        <DbContext.Provider value={db}>
          <App />
        </DbContext.Provider>
      </AuthContextProvider>
    </LocalizationProvider>
  </ThemeProvider>
);
