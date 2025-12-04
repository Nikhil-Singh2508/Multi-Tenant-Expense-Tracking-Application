"use client";

import { useState } from "react";
import api from "@/utils/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async () => {
    const { first_name, last_name, email, password } = form;

    if (!email || !password || !first_name || !last_name) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/signup", form);
      toast.success("Signup successful");
      router.push("/auth/login");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold mb-5 text-center text-slate-900">
          Create Account
        </h2>

        <input
          type="text"
          placeholder="First Name"
          name="first_name"
          onChange={handleChange}
          className="border text-gray-800 border-slate-300 p-3 rounded-lg w-full mb-3 focus:ring-2 focus:ring-blue-400 outline-none"
        />

        <input
          type="text"
          placeholder="Last Name"
          name="last_name"
          onChange={handleChange}
          className="border text-gray-800 border-slate-300 p-3 rounded-lg w-full mb-3 focus:ring-2 focus:ring-blue-400 outline-none"
        />

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
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow-sm transition"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <p className="mt-4 text-center text-slate-600">
          Already have an account?{" "}
          <a href="/auth/login" className="text-blue-600 underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
