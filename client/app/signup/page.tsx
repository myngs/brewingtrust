"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import beans from "../public/beans.jpg";

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Strong password validator
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

    // Validations
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

      const payload = {
        username: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    <div className="flex min-h-screen items-center justify-center bg-[#e9e9e9] px-4 py-10 text-zinc-900">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-[#d5d5d5] bg-[#efefef] shadow-[0_10px_30px_rgba(0,0,0,0.10)] md:grid md:grid-cols-2">
        <section className="px-10 py-12 text-[#1f1f1f]">
          <p className="text-sm font-semibold text-[#4a2a0f]">
            Brewing Trust
          </p>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-[#f08a3d]">
            Create account
          </h1>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label>
                <span className="block text-xs font-semibold text-zinc-700">
                  First name
                </span>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Juan"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-[#f08a3d] focus:outline-none focus:ring-2 focus:ring-orange-200"
                  required
                />
              </label>

              <label>
                <span className="block text-xs font-semibold text-zinc-700">
                  Last name
                </span>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Dela Cruz"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-[#f08a3d] focus:outline-none focus:ring-2 focus:ring-orange-200"
                  required
                />
              </label>
            </div>

            <label>
              <span className="block text-xs font-semibold text-zinc-700">Email</span>
              <input
                type="email"
                name="email"
                placeholder="juandelacruz@email.com"
                value={formData.email}
                onChange={handleChange}
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-[#f08a3d] focus:outline-none focus:ring-2 focus:ring-orange-200"
                required
              />
            </label>

            <label>
              <span className="block text-xs font-semibold text-zinc-700">
                Password
              </span>
              <input
                type="password"
                name="password"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-[#f08a3d] focus:outline-none focus:ring-2 focus:ring-orange-200"
                required
              />
            </label>

            <label>
              <span className="block text-xs font-semibold text-zinc-700">
                Re-type password
              </span>
              <input
                type="password"
                name="confirmPassword"
                placeholder="********"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-[#f08a3d] focus:outline-none focus:ring-2 focus:ring-orange-200"
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className={`mt-2 w-full rounded-full py-2.5 text-sm font-semibold text-white shadow-sm transition ${
                loading
                  ? "cursor-not-allowed bg-[#e3b38f]"
                  : "bg-[#f08a3d] hover:bg-[#e68134]"
              }`}
            >
              {loading ? "Signing up" : "Sign in"}
            </button>
          </form>

          {message && (
            <p className="mt-4 text-center text-sm font-medium text-zinc-600">
              {message}
            </p>
          )}

          <p className="mt-6 text-center text-xs text-zinc-500">
            Already have an account?{" "}
            <Link href="/" className="font-semibold text-[#3f2a16] hover:underline">
              Log in
            </Link>
          </p>
        </section>

        <aside className="relative hidden md:block">
          <Image
            src={beans}
            alt="Coffee beans"
            fill
            priority
            className="object-cover"
          />
        </aside>
      </div>
    </div>
  );
}
