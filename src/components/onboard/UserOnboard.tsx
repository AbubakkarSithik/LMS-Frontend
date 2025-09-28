import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/lib/store/store";
import { setSession, clearSession } from "@/lib/store/slices/authSlice";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { RiArrowLeftLongLine, RiArrowRightSLine, RiLoader2Line } from "@remixicon/react";

const UserOnboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { session } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    password: "",
    first_name: "",
    last_name: "",
    username: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await fetch("http://localhost:4005/auth/restore", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          dispatch(setSession(data.session));
        } else {
          dispatch(clearSession());
          navigate("/");
        }
      } catch (err) {
        console.error("Session restore error:", err);
        dispatch(clearSession());
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [dispatch, navigate]);

  const handleNext = async () => {
    if (step === 1) {
      if (!form.password) {
        setErrors({ password: "Password is required" });
        return;
      }
      setErrors({});
      await handleSetPassword();
    } else if (step === 2) {
      if (!form.first_name || !form.last_name || !form.username) {
        setErrors({ general: "All fields are required" });
        return;
      }
      setErrors({});
      await handleProfileSubmit();
    }
  };

  const handleSetPassword = async () => {
    try {
      const res = await fetch("http://localhost:4005/auth/set-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          new_password: form.password,
          // access_token + refresh_token are sent in cookies/session
        }),
      });

      if (res.ok) {
        const data = await res.json();
        dispatch(setSession(data.session));
        setStep(2);
      } else {
        const err = await res.json();
        setErrors({ password: err.error || "Failed to set password" });
      }
    } catch (err) {
      console.error("Set password error:", err);
      setErrors({ password: "Unexpected error setting password" });
    }
  };

  const handleProfileSubmit = async () => {
    try {
      const res = await fetch("http://localhost:4005/users/me", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          username: form.username,
        }),
      });

      if (res.ok) {
        navigate("/dashboard");
      } else {
        const err = await res.json();
        setErrors({ general: err.error || "Failed to update profile" });
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setErrors({ general: "Unexpected error updating profile" });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500 text-lg flex gap-2 items-center">
          Loading{" "}
          <RiLoader2Line className="animate-spin text-ts12 text-lg" size={20} />
        </p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex h-screen w-screen font-manrope">
      {/* Left Side */}
      <div className="relative flex flex-col justify-center items-center w-1/2 overflow-hidden">
        <div className="absolute -top-8 -left-10 size-[800px] bg-gradient-to-br from-ts12 via-orange-500 to-orange-700 blur-2xl opacity-90" />
        <div className="absolute top-0 right-0 size-[300px] bg-gradient-to-tr from-orange-200 to-orange-100 rounded-full blur-3xl opacity-80" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-6"
        >
          <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
            Welcome to LMS 👋
          </h1>
          <p className="mt-4 text-lg text-orange-100">
            Let&apos;s finish setting up your account.
          </p>
        </motion.div>
      </div>

      {/* Right Side */}
      <div className="flex w-1/2 bg-white justify-center items-center px-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md"
            >
              <h2 className="text-2xl font-semibold text-black mb-4">
                Set your password
              </h2>
              <Label>Password</Label>
              <Input
                type="password"
                className="w-full border rounded-md p-2"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password}</p>
              )}
              <Button
                onClick={handleNext}
                className="mt-6 w-full bg-ts12 text-white"
              >
                Next <RiArrowRightSLine size={20} />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md"
            >
              <h2 className="text-2xl font-semibold text-black mb-4">
                Tell us about you 😊
              </h2>
              <div className="space-y-4">
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={form.first_name}
                    onChange={(e) =>
                      setForm({ ...form, first_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={form.last_name}
                    onChange={(e) =>
                      setForm({ ...form, last_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Username</Label>
                  <Input
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                  />
                </div>
                {errors.general && (
                  <p className="text-red-500 text-xs">{errors.general}</p>
                )}
              </div>
              <div className="flex justify-between items-center mt-6">
                <Button
                  onClick={() => setStep(1)}
                  className="bg-transparent text-ts12"
                >
                  <RiArrowLeftLongLine size={20} /> Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-ts12 text-white px-6"
                >
                  Submit
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserOnboard;