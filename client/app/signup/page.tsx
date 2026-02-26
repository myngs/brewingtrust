"use client";

import { useState } from "react";
import Link from "next/link";

export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Strong password validator
  const validatePassword = (password: string) => {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()[\]{}\-_=+]).{8,}$/;
    return strongPasswordRegex.test(password);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // prevent double click

    // ✅ Validations
    if (!validatePassword(formData.password)) {
      setMessage(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg border border-zinc-200 text-zinc-900">
        <h2 className="mb-2 text-center text-3xl font-bold text-orange-500">
          Create Account
        </h2>
        <p className="mb-6 text-center text-sm text-zinc-700">
          Join Brewing Trust
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
            required
          />
          <p className="text-xs text-zinc-500 -mt-2 mb-2">
            Must be 8+ characters, include uppercase, lowercase, number, and special character.
          </p>

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg py-3 font-semibold text-white transition ${
              loading
                ? "bg-orange-300 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm font-medium text-zinc-700">
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-zinc-700">
          Already have an account?{" "}
          <Link
            href="/"
            className="font-semibold text-orange-500 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
