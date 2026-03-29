import { useEffect, useMemo, useState } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Container
} from "@mui/material";
import { useAuth } from "./context/AuthContext";
import { db } from "./services/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import LoginPage from "./comps/LoginPage";
import TodoComp from "./comps/TodoComp";

function App() {
  const { user } = useAuth();
  const [mode, setMode] = useState(() => {
    const storedMode = localStorage.getItem("themeMode");
    return storedMode === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  useEffect(() => {
    if (!user?.uid) return;

    let isMounted = true;

    const syncThemeFromDb = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const dbMode = userSnap.data()?.themeMode;

        if ((dbMode === "light" || dbMode === "dark") && isMounted) {
          setMode(dbMode);
          localStorage.setItem("themeMode", dbMode);
          return;
        }

        await setDoc(
          userRef,
          {
            themeMode: localStorage.getItem("themeMode") || "light",
            themeUpdatedAt: serverTimestamp()
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Failed to sync theme from DB:", error);
      }
    };

    syncThemeFromDb();

    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  const toggleMode = () => {
    const nextMode = mode === "light" ? "dark" : "light";
    setMode(nextMode);
    localStorage.setItem("themeMode", nextMode);

    if (user?.uid) {
      void setDoc(
        doc(db, "users", user.uid),
        {
          themeMode: nextMode,
          themeUpdatedAt: serverTimestamp()
        },
        { merge: true }
      );
    }
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#4285F4" },
          secondary: { main: "#34A853" },
          error: { main: "#EA4335" },
          warning: { main: "#FBBC04" },
          background: {
            default: mode === "light" ? "#F8F9FA" : "#101521",
            paper: mode === "light" ? "#FFFFFF" : "#1B2333"
          }
        },
        typography: {
          fontFamily: "'Roboto', sans-serif",
          h3: { fontWeight: 700, letterSpacing: "-0.01em" },
          h4: { fontWeight: 700, letterSpacing: "-0.01em" },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600 },
          body1: { fontWeight: 400 },
          body2: { fontWeight: 400 }
        },
        shape: { borderRadius: 8 }
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundImage:
            mode === "light"
              ? "radial-gradient(1200px 600px at 10% -10%, #E8F0FE 10%, transparent 60%), radial-gradient(900px 500px at 110% 10%, #E6F4EA 10%, transparent 60%), linear-gradient(180deg, #F8F9FA 0%, #F1F3F4 100%)"
              : "radial-gradient(1200px 600px at 10% -10%, #1B2A49 10%, transparent 60%), radial-gradient(900px 500px at 110% 10%, #173627 10%, transparent 60%), linear-gradient(180deg, #101521 0%, #0C111B 100%)"
        }}
      >
        <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
          {user ? <TodoComp mode={mode} onToggleMode={toggleMode} /> : <LoginPage />}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
