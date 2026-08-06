"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { publicClient } from "@/services/apiClient";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    re_password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.re_password) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      // শুধু publicClient ব্যবহার করুন, এক্সট্রা কোনো হেডার দেওয়ার দরকার নেই
      const response = await publicClient.post("/auth/users/", {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
      });

      if (response.status === 201) {
        router.push("/signin");
      }
    } catch (err: any) {
      console.error("Registration failed:", err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.username?.[0] ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="text-center mb-5">
          <h2 className="text-2xl font-bold text-text-dark mb-1">
            Create Account
          </h2>
          <p className="text-sm text-text-gray">
            Join ZenMart to start shopping
          </p>
        </div>

        {error && (
          <div className="bg-badge-red/10 border border-badge-red text-badge-red px-3 py-2 rounded-lg text-sm text-center mb-4">
            {error}
          </div>
        )}

        {/* Changed space-y-5 to space-y-3 to make it compact */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Changed gap-4 to gap-3 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label" htmlFor="first_name">
                First Name
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                className="form-input"
                placeholder="John"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="form-label" htmlFor="last_name">
                Last Name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                className="form-input"
                placeholder="Doe"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="form-input"
              placeholder="johndoe123"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="form-input"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="form-label" htmlFor="re_password">
              Confirm Password
            </label>
            <input
              id="re_password"
              name="re_password"
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={formData.re_password}
              onChange={handleChange}
            />
          </div>

          {/* Added mt-5 to give slightly more space before the button */}
          <div className="pt-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-text-gray mt-5">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
