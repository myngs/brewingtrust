"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      setMessage(data.message);

      // ✅ If OTP is required
      if (data.requiresOTP) {
        localStorage.setItem("tempUserId", data.userId);
        router.push("/otp");
        return;
      }

      // ✅ If login succeeds without OTP
      if (data.token) {
        localStorage.setItem("token", data.token);
        router.push("/blockchain");
      }

    } catch (err) {
      setMessage("Server error");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg border border-zinc-200">
        <h2 className="mb-2 text-center text-3xl font-bold text-orange-500">
          Welcome Back
        </h2>
        <p className="mb-6 text-center text-sm text-zinc-500">
          Sign in to your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600"
          >
            Login
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm font-medium text-zinc-700">
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-zinc-600">
          Don’t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-orange-500 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
