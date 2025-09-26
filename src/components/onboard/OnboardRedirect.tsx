import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/services/supabaseClient";
import { useDispatch } from "react-redux";
import { setSession, clearSession } from "@/lib/store/slices/authSlice";
import type { AppDispatch } from "@/lib/store/store";
import { RiLoader2Line } from "@remixicon/react";

const OnboardRedirect: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace("#", "?"));
    const error = params.get("error");
    const errorCode = params.get("error_code");
    const errorDesc = params.get("error_description");

    if (error || errorCode) {
      setErrorMessage(errorDesc || "Invalid or expired link. Please request a new one.");
      dispatch(clearSession());
      return;
    }

    const clearUrlHash = () => {
      if (window.location.hash || window.location.search) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    // Restore session if already set
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        dispatch(setSession(session));
        clearUrlHash();
        navigate("/onboard");
      }
    });

    // Subscribe for auth events (email confirm triggers this)
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

    return () => subscription.unsubscribe();
  }, [dispatch, navigate]);

  const handleResendEmail = async () => {
    setResending(true);
    const user = (await supabase.auth.getUser()).data.user;

    if (!user?.email) {
      setErrorMessage("Cannot resend verification: no user email found.");
      setResending(false);
      return;
    }

    // Resend verification email
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
    });

    setResending(false);

    if (error) {
      setErrorMessage("Failed to resend verification: " + error.message);
    } else {
      setErrorMessage(`A new verification email has been sent to ${user.email}. Please check your inbox.`);
    }
  };

  if (errorMessage) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4 text-center">
        <p className="text-red-500 font-medium">{errorMessage}</p>
        <button
          onClick={handleResendEmail}
          disabled={resending}
          className="px-4 py-2 cursor-pointer bg-ts12 hover:bg-orange-400 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-md hover:shadow-ts12 text-white"
        >
          {resending ? "Resending..." : "Resend Verification Email"}
        </button>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-gray-600 animate-pulse text-lg flex gap-2 items-center">
        Verifying your account, please wait
        <RiLoader2Line className="animate-spin text-ts12 text-lg" size={20} />
      </p>
    </div>
  );
};

export default OnboardRedirect;
