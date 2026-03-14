import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../services/firebase";

function GoogleLogin() {
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button onClick={loginWithGoogle}>
      Sign in with Google
    </button>
  );
}

export default GoogleLogin;
