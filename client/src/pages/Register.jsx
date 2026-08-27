import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/auth";
import { useAuth } from "../context/useAuth";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await register(name, email, password);
      loginUser(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "registration failed");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 shadow-sm p-6 sm:p-8 rounded-lg w-full max-w-sm space-y-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded bg-orange-500 flex items-center justify-center font-bold text-white text-sm">
            IT
          </div>
          <span className="font-bold text-gray-900">IssueTracker</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Register</h1>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 outline-none focus:ring-2 focus:ring-orange-500 text-base"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 outline-none focus:ring-2 focus:ring-orange-500 text-base"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 outline-none focus:ring-2 focus:ring-orange-500 text-base"
          required
        />
        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white py-2.5 rounded-lg font-medium"
        >
          Register
        </button>

        <p className="text-gray-500 text-sm text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-600 hover:underline">
            Log In
          </Link>
        </p>
      </form>
    </div>
  );
}
