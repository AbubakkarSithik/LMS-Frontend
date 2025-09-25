import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/lib/store/store";
import { setSession, clearSession } from "@/lib/store/slices/authSlice";
import { RiLoader2Line } from "@remixicon/react";

const Onboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { session } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);

  // Restore session from backend (cookies)
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await fetch("http://localhost:4005/auth/restore", {
          credentials: "include", // send cookies
        });

        if (res.ok) {
          const data = await res.json();
          dispatch(setSession(data));
        } else {
          dispatch(clearSession());
          navigate("/"); // unauthorized
        }
      } catch (err) {
        console.error("Restore session failed:", err);
        dispatch(clearSession());
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [dispatch, navigate]);

  // optional safeguard
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch("http://localhost:4005/auth/restore", {
        credentials: "include",
      });
      if (!res.ok) {
        dispatch(clearSession());
        navigate("/");
      }
    }, 60_000); 
    return () => clearInterval(interval);
  }, [dispatch, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500 text-lg flex gap-2 items-center justify-between">Loading <RiLoader2Line className="animate-spin text-ts12 text-lg" size={20} /></p>
      </div>
    );
  }

  if (!session) return null; // if no session after restore, redirect already happened

  return (
    <div className="flex h-screen w-screen font-manrope">
      {/* Left Side */}
      <div className="relative flex flex-col justify-center items-center w-1/2 overflow-hidden">
        <div className="absolute -top-8 -left-10 size-[800px] bg-gradient-to-br from-ts12 via-orange-500 to-orange-700 blur-2xl opacity-90" />
        <div className="absolute top-0 right-0 size-[300px] bg-gradient-to-tr from-orange-200 to-orange-100 rounded-full blur-3xl opacity-80" />
        <div className="absolute -bottom-6 -left-6 size-[300px] bg-gradient-to-tr from-orange-200 to-orange-100 rounded-full blur-3xl opacity-80" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-6"
        >
          <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
            Leave Management System
          </h1>
          <p className="mt-4 text-lg text-orange-100">
            Simplify your employee leave tracking with ease and efficiency.
          </p>
        </motion.div>
      </div>

      {/* Right Side */}
      <div className="flex w-1/2 bg-white justify-center items-center">
        <p className="text-lg font-semibold text-gray-800">
          🎉 Welcome {session.user?.email}, you are logged in!
        </p>
      </div>
    </div>
  );
};

export default Onboard;