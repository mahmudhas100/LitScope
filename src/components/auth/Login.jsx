import { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../../firebase/config";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (!userCredential.user.emailVerified) {
        alert(
          "Please verify your email before logging in. Check your inbox for the verification link."
        );
        return;
      }
      navigate("/");
    } catch (error) {
      setError("Invalid email or password");
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (email) {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent!");
    } else {
      alert("Please enter your email first");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-sm border border-stone-100">
        <form onSubmit={handleSubmit}>
          <div className="text-center">
            <h2 className="text-4xl font-bold text-ink font-serif mb-2">
              Welcome Back
            </h2>
            <p className="text-ink/60">Sign in to continue to LitScope</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mt-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="mt-8 space-y-6">
            <div>
              <label className="text-sm font-medium text-ink/80">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 mt-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-stone-50"
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-ink/80">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 mt-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-stone-50"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition duration-200 font-medium shadow-sm"
            >
              Sign In
            </button>
          </div>
        </form>

        <button
          onClick={handleForgotPassword}
          className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium w-full text-center"
        >
          Forgot Password?
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-ink/50">
              Or continue with
            </span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full py-3 px-4 border border-stone-200 rounded-lg text-ink/80 hover:bg-stone-50 transition duration-200 flex items-center justify-center gap-2 font-medium"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Sign in with Google
        </button>

        <div className="text-center mt-6">
          <span className="text-ink/60">Don't have an account? </span>
          <Link
            to="/signup"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Login;
