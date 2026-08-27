"use client";

import React, { useState } from "react";
import Link from "next/link";
import { publicClient, apiClient } from "@/services/apiClient"; // 🟢 দুটোই ইম্পোর্ট করুন

export default function SignInPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
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
    setLoading(true);

    try {
      const response = await publicClient.post("/auth/jwt/create/", {
        username: formData.username,
        password: formData.password,
      });

      if (response.status === 200) {
        console.log("Backend Response:", response.data); 

        const access = response.data?.access;
        const refresh = response.data?.refresh;

        if (!access) {
          setError("Login successful, but Backend did not send the Token in JSON! Check backend code.");
          setLoading(false);
          return; 
        }

        localStorage.setItem("access", access);
        if (refresh) localStorage.setItem("refresh", refresh);

        try {
          const userRes = await apiClient.get("/auth/users/me/");
          const user = userRes.data;

          if (user.is_staff || user.is_superuser) {
            window.location.href = "/admin";
          } else {
            window.location.href = "/";
          }
        } catch (profileErr) {
          console.error("Failed to fetch user profile:", profileErr);
          setError("Failed to verify user profile.");
        }
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(
        err.response?.data?.detail ||
          "Invalid username or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-text-dark mb-1">Welcome Back</h2>
          <p className="text-sm text-text-gray">Sign in to your PetoraBD account</p>
        </div>

        {error && (
          <div className="bg-badge-red/10 border border-badge-red text-badge-red px-3 py-2 rounded-lg text-sm text-center mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label" htmlFor="username">Username</label>
            <input id="username" name="username" type="text" required className="form-input" placeholder="admin" value={formData.username} onChange={handleChange} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="form-label !mb-0" htmlFor="password">Password</label>
              <Link href="#" className="text-xs font-medium text-primary hover:text-primary-hover">Forgot password?</Link>
            </div>
            <input id="password" name="password" type="password" required className="form-input" placeholder="••••••••" value={formData.password} onChange={handleChange} />
          </div>

          <div className="pt-3">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-text-gray mt-6">
          Don't have an account?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:text-primary-hover transition-colors">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}