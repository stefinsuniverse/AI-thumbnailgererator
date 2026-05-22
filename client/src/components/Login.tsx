import { useState } from "react";
import SoftBackdrop from "./SoftBackdrop";
import { useAuth } from "../context/AuthContext.js";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [state, setState] = useState("login")
  const { login, register } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      if (state === "login") {
        const res = await login(formData.email, formData.password);
        if (res.success) {
          navigate("/generate");
        } else {
          setErrorMessage(res.message);
        }
      } else {
        const res = await register(formData.name, formData.email, formData.password);
        if (res.success) {
          navigate("/generate");
        } else {
          setErrorMessage(res.message);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    <SoftBackdrop />
      <div className='min-h-screen flex items-center justify-center pt-20 px-4'>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm text-center bg-white/6 border border-white/10 rounded-2xl px-8 py-4 shadow-2xl">
          <h1 className="text-white text-3xl mt-6 font-medium">
            {state === "login" ? "Login" : "Sign up"}
          </h1>

          <p className="text-gray-400 text-sm mt-2">Please {state === "login" ? "sign in" : "register"} to continue</p>

          {errorMessage && (
            <div className="mt-4 p-3 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs text-left">
              {errorMessage}
            </div>
          )}

          {state !== "login" && (
            <div className="flex items-center mt-6 w-full bg-white/5 ring-2 ring-white/10 focus-within:ring-pink-500/60 h-12 rounded-full overflow-hidden pl-6 gap-2 transition-all ">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white/60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <circle cx="12" cy="8" r="5" /> <path d="M20 21a8 8 0 0 0-16 0" /> </svg>
              <input type="text" name="name" placeholder="Name" className="w-full bg-transparent text-white placeholder-white/60 border-none outline-none " value={formData.name} onChange={handleChange} required />
            </div>
          )}

          <div className="flex items-center w-full mt-4 bg-white/5 ring-2 ring-white/10 focus-within:ring-pink-500/60 h-12 rounded-full overflow-hidden pl-6 gap-2 transition-all ">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white/75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /> <rect x="2" y="4" width="20" height="16" rx="2" /> </svg>
            <input type="email" name="email" placeholder="Email id" className="w-full bg-transparent text-white placeholder-white/60 border-none outline-none " value={formData.email} onChange={handleChange} required />
          </div>

          <div className=" flex items-center mt-4 w-full bg-white/5 ring-2 ring-white/10 focus-within:ring-pink-500/60 h-12 rounded-full overflow-hidden pl-6 gap-2 transition-all ">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white/75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /> <path d="M7 11V7a5 5 0 0 1 10 0v4" /> </svg>
            <input type="password" name="password" placeholder="Password" className="w-full bg-transparent text-white placeholder-white/60 border-none outline-none" value={formData.password} onChange={handleChange} required />
          </div>

          <div className="mt-4 text-left">
            <button type="button" className="text-sm text-pink-400 hover:underline">
              Forgot password?
            </button>
          </div>

          <button type="submit" disabled={loading} className="mt-4 w-full h-11 rounded-full text-white bg-pink-600 hover:bg-pink-500 disabled:bg-pink-800 disabled:text-zinc-400 transition" >
            {loading ? "Please wait..." : (state === "login" ? "Login" : "Sign up")}
          </button>

          <p onClick={() => { setState(prev => prev === "login" ? "register" : "login"); setErrorMessage(""); }} className="text-gray-400 text-sm mt-3 mb-10 cursor-pointer" >
            {state === "login" ? "Don't have an account?" : "Already have an account?"}
            <span className="text-pink-400 hover:underline ml-1">click here</span>
          </p>
        </form>
      </div>
    </>
  )
}

export default Login
