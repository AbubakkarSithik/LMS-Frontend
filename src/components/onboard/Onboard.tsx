import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/lib/store/store";
import { supabase } from "@/lib/services/supabaseClient";
import { setSession, clearSession } from "@/lib/store/slices/authSlice";
import Cookies from "js-cookie";

const Onboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { session } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          dispatch(setSession(data.session));
          Cookies.set("lms_session", JSON.stringify(data.session), {
            secure: true,
            sameSite: "strict",
          });
        } else {
          const cookieSession = Cookies.get("lms_session");
          if (cookieSession) {
            try {
              const parsed = JSON.parse(cookieSession);
              dispatch(setSession(parsed));
            } catch {
              Cookies.remove("lms_session");
              navigate("/");
            }
          } else {
            navigate("/");
          }
        }
      } finally {
        setLoading(false); 
      }
    };

    restoreSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          dispatch(setSession(session));
          Cookies.set("lms_session", JSON.stringify(session), {
            secure: true,
            sameSite: "strict",
          });
        } else {
          dispatch(clearSession());
          Cookies.remove("lms_session");
          navigate("/");
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, [dispatch, navigate]);

  useEffect(() => {
    if (!loading && !session) {
      navigate("/");
    }
  }, [session, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

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
        <p>Welcome! You are logged in.</p>
      </div>
    </div>
  );
};

export default Onboard;