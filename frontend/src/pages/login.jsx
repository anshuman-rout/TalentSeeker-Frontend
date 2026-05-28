import React, { useState } from "react";

import { loginUser } from "../services/authService";
import { useAuthStore } from "../context/AuthStore"
const Login = () => {

  const {handleLogin} = useAuthStore()
  const [formData, setFormData] =
    useState({
      username: "",
      password: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // Handle Input Change
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle Login
  const handleSubmit = async (e) => {

    e.preventDefault();
    // validation
    if (
      !formData.username.trim() ||
      !formData.password.trim()
    ) {
      alert(
        "Provide Complete Details"
      );
      return;
    }

    setError("");

    try {

      setLoading(true);

      const data = await loginUser(
        formData.username,
        formData.password
      );

      console.log(data);

      // // Save Tokens
      // localStorage.setItem(
      //   "access_token",
      //   data.access_token
      // );

      // localStorage.setItem(
      //   "refresh_token",
      //   data.refresh_token
      // );

      // Login Success
      await handleLogin(data);

    } catch (error) {

      console.log(error);

      setError(
        error?.response?.data?.detail ||
        "Login Failed"
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      
      {/* Login Card */}
      <div className="w-[420px] bg-[#111111] border border-[#2a2a2a] rounded-3xl p-10 shadow-2xl">
        
        {/* Heading */}
        <div className="mb-10 text-center">
          
          <h1 className="text-4xl font-bold text-white mb-3">
            Talent Seek
          </h1>

          <p className="text-gray-400">
            Sign in to continue
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="flex flex-col gap-6"
        >
          
          {/* Username */}
          <div>

            <label className="block text-white mb-2">
              Username
            </label>

            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="off"
              placeholder="Enter username"
              className="
              w-full
              bg-black
              border
              border-white
              rounded-xl
              px-5
              py-4
              text-white
              outline-none
              transition-all
              duration-200
              focus:border-blue-500
              focus:bg-[#0f172a]
              "
            />
          </div>

          {/* Password */}
          <div>

            <label className="block text-white mb-2">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              placeholder="Enter password"
              className="
              w-full
              bg-black
              border
              border-white
              rounded-xl
              px-5
              py-4
              text-white
              outline-none
              transition-all
              duration-200
              focus:border-blue-500
              focus:bg-[#0f172a]
              "
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="
            mt-4
            bg-green-600
            hover:bg-green-500
            transition-all
            duration-200
            text-white
            font-semibold
            py-4
            rounded-xl
            shadow-lg
            hover:scale-[1.02]
            disabled:opacity-50
            "
          >
            {loading
              ? "Signing In..."
              : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;