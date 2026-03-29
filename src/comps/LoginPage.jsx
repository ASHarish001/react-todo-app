import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from "firebase/auth";
import { auth, googleProvider } from "../services/firebase";
import { db } from "../services/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Avatar,
  Divider,
  Container
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import GoogleIcon from "@mui/icons-material/Google";
import PersonIcon from "@mui/icons-material/Person";

function LoginPage() {
  const [tabValue, setTabValue] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError("");
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);

      // Ensure there is always a user profile document for Todo screen use.
      const userRef = doc(db, "users", result.user.uid);
      const existingDoc = await getDoc(userRef);
      if (!existingDoc.exists()) {
        await setDoc(userRef, {
          name: result.user.displayName || "User",
          email: result.user.email || "",
          createdAt: serverTimestamp(),
          provider: "google"
        });
      }
    } catch (error) {
      setError("Failed to sign in with Google");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email || !password || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(result.user, {
        displayName: name.trim()
      });

      await setDoc(doc(db, "users", result.user.uid), {
        name: name.trim(),
        email: result.user.email || email,
        createdAt: serverTimestamp(),
        provider: "email"
      });

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("Email already in use");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("Email not found");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Try again later");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 3, md: 6 } }}>
      <Paper elevation={8} sx={{ overflow: "hidden" }}>
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #4285F4 0%, #34A853 100%)",
            color: "white",
            p: 3,
            textAlign: "center"
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "0.05em" }}>
            USER LOGIN
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={3}>
            {/* Avatar */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "primary.main",
                  fontSize: "2rem"
                }}
              >
                <PersonIcon sx={{ fontSize: "2.5rem" }} />
              </Avatar>
            </Box>

            {/* Tabs */}
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                "& .MuiTab-root": {
                  fontWeight: 600,
                  fontSize: "0.95rem"
                }
              }}
            >
              <Tab label="Login" />
              <Tab label="Sign Up" />
            </Tabs>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {error}
              </Alert>
            )}

            {/* Form Fields */}
            <Stack spacing={2}>
              {tabValue === 1 && (
                <TextField
                  fullWidth
                  label="Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  placeholder="Enter your full name"
                  variant="outlined"
                />
              )}

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="Enter your email"
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <PersonIcon sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="Enter your password"
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                        disabled={loading}
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              {tabValue === 1 && (
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  placeholder="Confirm your password"
                  variant="outlined"
                />
              )}
            </Stack>

            {/* Remember me & Forgot Password */}
            {tabValue === 0 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.875rem"
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <input type="checkbox" id="remember" style={{ marginRight: 6 }} />
                  <label htmlFor="remember" style={{ cursor: "pointer" }}>
                    Remember me
                  </label>
                </Box>
                <Button
                  variant="text"
                  size="small"
                  sx={{ textTransform: "none", p: 0 }}
                >
                  Forgot Password?
                </Button>
              </Box>
            )}

            {/* Login/Signup Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={tabValue === 0 ? handleLogin : handleSignup}
              disabled={loading}
              sx={{
                mt: 2,
                fontWeight: 600,
                py: 1.5
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : tabValue === 0 ? (
                "LOG IN"
              ) : (
                "CREATE ACCOUNT"
              )}
            </Button>

            {/* Divider */}
            <Divider sx={{ my: 2 }}>OR</Divider>

            {/* Google Login */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={loginWithGoogle}
              disabled={loading}
              startIcon={<GoogleIcon />}
              sx={{
                fontWeight: 600,
                py: 1.5,
                borderColor: "#DADCE0",
                color: "text.primary",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: "primary.light"
                }
              }}
            >
              Continue with Google
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}

export default LoginPage;
