import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const [state, setState] = React.useState("login");
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: kirim data ke backend di sini
    console.log(state, formData);
    navigate("/dashboard"); // ✅ pindah setelah submit
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-400 to-blue-50 relative overflow-hidden px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md text-center bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl rounded-3xl p-8 z-10"
      >
        <h1 className="text-white text-3xl font-semibold tracking-wide">
          {state === "login" ? "Login" : "Register"}
        </h1>

        <p className="text-white/80 text-sm mt-2 mb-8">
          {state === "login"
            ? "Please sign in to continue"
            : "Create an account to get started"}
        </p>

        {state !== "login" && (
          <div className="flex items-center mb-4 w-full bg-white/20 ring-1 ring-white/30 focus-within:ring-white h-12 rounded-full overflow-hidden pl-5 gap-3 transition-all shadow-inner">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="text-white/90"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="5" />
              <path d="M20 21a8 8 0 0 0-16 0" />
            </svg>
            <input
              type="text"
              name="name"
              placeholder="Name"
              className="w-full bg-transparent text-white placeholder-white/80 border-none outline-none pr-5"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <div className="flex items-center w-full mb-4 bg-white/20 ring-1 ring-white/30 focus-within:ring-white h-12 rounded-full overflow-hidden pl-5 gap-3 transition-all shadow-inner">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="text-white/90"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
            <rect x="2" y="4" width="20" height="16" rx="2" />
          </svg>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="w-full bg-transparent text-white placeholder-white/80 border-none outline-none pr-5"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex items-center w-full mb-4 bg-white/20 ring-1 ring-white/30 focus-within:ring-white h-12 rounded-full overflow-hidden pl-5 gap-3 transition-all shadow-inner">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="text-white/90"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full bg-transparent text-white placeholder-white/80 border-none outline-none pr-5"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex justify-end w-full mb-6 text-sm">
          <button
            type="button"
            className="text-white hover:text-blue-200 transition"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className="w-full h-12 rounded-full text-blue-600 font-semibold bg-white hover:bg-blue-50 hover:shadow-lg transition-all shadow-md"
        >
          {state === "login" ? "Login" : "Create Account"}
        </button>

        <p className="text-white text-sm mt-6 mb-2">
          {state === "login"
            ? "Don't have an account? "
            : "Already have an account? "}
          <span
            onClick={() =>
              setState((prev) => (prev === "login" ? "register" : "login"))
            }
            className="text-blue-100 font-medium hover:text-white hover:underline cursor-pointer transition ml-1"
          >
            {state === "login" ? "Register here" : "Login here"}
          </span>
        </p>
      </form>

      {/* Decorative Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-blue-300/30 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};

export default Home;
