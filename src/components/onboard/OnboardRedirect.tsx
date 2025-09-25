import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/services/supabaseClient";
import { useDispatch } from "react-redux";
import { setSession, clearSession } from "@/lib/store/slices/authSlice";
import type { AppDispatch } from "@/lib/store/store";

const OnboardRedirect: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Helper: remove tokens from URL
    const clearUrlHash = () => {
      if (window.location.hash || window.location.search) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    // 1. Check for existing session (may be set by Supabase after redirect)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        dispatch(setSession(session));
        clearUrlHash();
        navigate("/onboard"); // <-- change to your route
      }
    });

    // 2. Listen for auth state changes (email confirm creates session here)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        dispatch(setSession(session));
        clearUrlHash();
        navigate("/onboard"); // <-- change to your route
      } else {
        dispatch(clearSession());
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch, navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-gray-600">Verifying your account, please wait...</p>
    </div>
  );
};

export default OnboardRedirect;
