"use client";
import { useState } from "react";

export default function LoginPage({ onLogin }: { onLogin: (role: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");

  // fake credentials
  const validUsername = "admin";
  const validPassword = "password123";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === validUsername && password === validPassword) {
      localStorage.setItem("token", "example-token"); // persist login
      localStorage.setItem("isAuthenticated", "true");
      setError("");
      onLogin(role); // notify parent with selected role
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "candidate" | "recruiter")}
              className="w-40 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="candidate">Candidate</option>
              <option value="recruiter">Recruiter</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-gray-500 text-sm text-center">
          Hint: <span className="font-mono">admin</span> /{" "}
          <span className="font-mono">password123</span>
        </p>
      </div>
    </div>
  );
}
