  import { useState } from 'react'
  import { createUserWithEmailAndPassword, sendEmailVerification, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
  import { auth } from '../../firebase/config'
  import { useNavigate, Link } from 'react-router-dom'

  const SignUp = () => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const navigate = useNavigate()

    const handleSignUp = async (e) => {
      e.preventDefault()
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        await sendEmailVerification(userCredential.user)
        alert("Registration successful! Please check your email to verify your account before logging in.")
        navigate('/login')
      } catch (error) {
        alert("Error during registration, please try again correctly.")
      }
    }

    const handleGoogleSignUp = async () => {
      const provider = new GoogleAuthProvider()
      try {
        await signInWithPopup(auth, provider)
        navigate('/')
      } catch (error) {
        alert("Error signing up with Google")
      }
    }

    const validatePassword = (value) => {
      const hasUpperCase = /[A-Z]/.test(value)
      const hasNumber = /\d/.test(value)
      const validLength = value.length >= 6 && value.length <= 18
  
      if (!hasUpperCase || !hasNumber || !validLength) {
        setPasswordError('Password must contain: 6-18 characters, 1 uppercase letter, 1 number')
        return false
      }
      setPasswordError('')
      return true
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-sm border border-stone-100">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-ink font-serif mb-2">Create Account</h2>
            <p className="text-ink/60">Join LitScope today</p>
          </div>

          <form onSubmit={handleSignUp} className="mt-8 space-y-6">
            <div>
              <label className="text-sm font-medium text-ink/80">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 mt-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-stone-50"
                placeholder="Choose a username"
                required
              />
            </div>

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
              <label className="text-sm font-medium text-ink/80">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  validatePassword(e.target.value)
                }}
                className="w-full px-4 py-2 mt-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-stone-50"
                placeholder="Create a password"
                autoComplete="new-password"
                required
              />
              {passwordError && (
                <p className="mt-1 text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition duration-200 font-medium shadow-sm"
            >
              Sign Up
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-ink/50">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignUp}
            className="w-full py-3 px-4 border border-stone-200 rounded-lg text-ink/80 hover:bg-stone-50 transition duration-200 flex items-center justify-center gap-2 font-medium"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Sign up with Google
          </button>

          <div className="text-center mt-6">
            <span className="text-ink/60">Already have an account? </span>
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  export default SignUp