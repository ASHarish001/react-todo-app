// Not in use can be deleted but keeping for reference
import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../services/firebase";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  Avatar,
  Divider,
  Container
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import EmailIcon from "@mui/icons-material/Email";
import AuthForm from "./AuthForm";

function GoogleLogin() {
  const [showEmailForm, setShowEmailForm] = useState(false);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
    }
  };

  if (showEmailForm) {
    return (
      <Container maxWidth="xs">
        <Box sx={{ mb: 2, textAlign: "center" }}>
          <Button
            variant="text"
            onClick={() => setShowEmailForm(false)}
            sx={{ mb: 2 }}
          >
            ← Back to options
          </Button>
        </Box>
        <AuthForm />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={8}
        sx={{
          p: { xs: 3, sm: 4 },
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper"
        }}
      >
        <Stack spacing={3} alignItems="center" textAlign="center">
          <Avatar sx={{ width: 64, height: 64, bgcolor: "primary.main" }}>
            <GoogleIcon />
          </Avatar>
          <Box>
            <Typography variant="h3" gutterBottom>
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to sync your tasks across devices and keep your day on track.
            </Typography>
          </Box>

          <Stack spacing={2} sx={{ width: "100%" }}>
            <Button
              onClick={loginWithGoogle}
              variant="contained"
              size="large"
              startIcon={<GoogleIcon />}
              sx={{ px: 4 }}
            >
              Continue with Google
            </Button>

            <Divider>OR</Divider>

            <Button
              onClick={() => setShowEmailForm(true)}
              variant="outlined"
              size="large"
              startIcon={<EmailIcon />}
              sx={{ px: 4 }}
            >
              Continue with Email
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}

export default GoogleLogin;
