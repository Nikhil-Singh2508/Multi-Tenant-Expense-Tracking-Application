"use client";

import { useState } from "react";
import api from "@/utils/api";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async () => {
    const { email, password } = form;

    if (!email || !password) {
      toast.error("Email and password required");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/signin", form);

      const token = res.data.token;
      localStorage.setItem("token", token);
      Cookies.set("token", token);

      toast.success("Login successful");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold mb-5 text-center text-slate-900">
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          name="email"
          onChange={handleChange}
          className="border text-gray-800 border-slate-300 p-3 rounded-lg w-full mb-3 focus:ring-2 focus:ring-blue-400 outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          name="password"
          onChange={handleChange}
          className="border text-gray-800 border-slate-300 p-3 rounded-lg w-full mb-4 focus:ring-2 focus:ring-blue-400 outline-none"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow-sm transition"
        >
          {loading ? "Logging In..." : "Login"}
        </button>

        <p className="mt-4 text-center text-slate-600">
          Don't have an account?{" "}
          <a href="/auth/signup" className="text-blue-600 underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
