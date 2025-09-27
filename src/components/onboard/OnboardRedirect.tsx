import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setSession, clearSession } from "@/lib/store/slices/authSlice";
import type { AppDispatch } from "@/lib/store/store";
import { RiLoader2Line } from "@remixicon/react";

const OnboardRedirect: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace("#", "?"));
    const error = params.get("error");
    const errorDesc = params.get("error_description");
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (error) {
      setErrorMessage(errorDesc || "Invalid or expired link. Please request a new one.");
      dispatch(clearSession());
      return;
    }

    const clearUrlHash = () => {
      if (window.location.hash || window.location.search) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    const handleTokenFromUrl = async () => {
      if (accessToken && refreshToken) {
        const res = await fetch("http://localhost:4005/auth/set-session", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }),
        });

        if (res.ok) {
          const { session } = await res.json();
          dispatch(setSession(session));
          clearUrlHash();
          navigate("/onboard", { replace: true });
        } else {
          setErrorMessage("Failed to create session from link. Please log in again.");
        }
        return true;
      }
      return false;
    };

    const restoreSession = async () => {
      const res = await fetch("http://localhost:4005/auth/restore", { credentials: "include" });
      if (res.ok) {
        const { session} = await res.json();
        dispatch(setSession(session));
        clearUrlHash();
        navigate("/onboard", { replace: true });
      } else {
        setErrorMessage("Could not restore session. Please log in again.");
      }
    };

    (async () => {
      const usedTokens = await handleTokenFromUrl();
      if (!usedTokens) await restoreSession();
    })();
  }, [dispatch, navigate]);

  if (errorMessage) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4 text-center">
        <p className="text-red-500 font-medium">{errorMessage}</p>
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