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
    const clearUrlHash = () => {
      if (window.location.hash || window.location.search) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        dispatch(setSession(session));
        clearUrlHash();
        navigate("/onboard"); // <-- change to your route
      }
    });

    // email confirm creates session here
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        dispatch(setSession(session));
        clearUrlHash();
        navigate("/onboard"); 
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
      <p className="text-gray-600 animate-pulse">Verifying your account, please wait...</p>
    </div>
  );
};

export default OnboardRedirect;
