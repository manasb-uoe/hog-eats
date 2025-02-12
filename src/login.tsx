import { Alert, Button, TextField, Typography } from "@mui/material";
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User,
} from "firebase/auth";
import { useCallback, useState } from "react";

export const Login = ({
  auth,
  onSuccess,
}: {
  auth: Auth;
  onSuccess: (user: User) => void;
}) => {
  const [showSignUp, setShowSignUp] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = useCallback(
    async (mode: "login" | "signup") => {
      try {
        setError(undefined);
        setLoading(true);
        const { user } =
          mode === "login"
            ? await signInWithEmailAndPassword(auth, email, password)
            : await createUserWithEmailAndPassword(auth, email, password);
        onSuccess(user);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    },
    [email, password, auth]
  );

  return (
    <div className="flex flex-col gap-2 px-4 py-8">
      <Typography variant="h4">{showSignUp ? "Sign up" : "Sign in"}</Typography>
      <TextField
        size="small"
        margin="dense"
        placeholder="Email"
        required
        type="email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        size="small"
        margin="dense"
        placeholder="Password"
        required
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      {error?.message && <Alert severity="error">{error.message}</Alert>}
      {showSignUp ? (
        <Button
          onClick={() => submit("signup")}
          disabled={!email.length || !password.length || loading}
          variant="contained"
          size="small"
        >
          Sign up
        </Button>
      ) : (
        <Button
          onClick={() => submit("login")}
          disabled={!email.length || !password.length || loading}
          variant="contained"
          size="small"
        >
          Sign in
        </Button>
      )}

      <Typography
        variant="subtitle2"
        color="textSecondary"
        className="text-center"
      >
        {!showSignUp ? (
          <>
            Don't have an account?{" "}
            <span onClick={() => setShowSignUp(true)}>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                className="cursor-pointer underline inline"
              >
                Sign up
              </Typography>
            </span>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <span onClick={() => setShowSignUp(false)}>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                className="cursor-pointer underline inline"
              >
                Sign in
              </Typography>
            </span>
          </>
        )}
      </Typography>
    </div>
  );
};
