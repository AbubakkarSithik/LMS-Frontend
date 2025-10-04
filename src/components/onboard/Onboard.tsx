import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/lib/store/store";
import { setSession, clearSession , setAppUser} from "@/lib/store/slices/authSlice";
import { setOnboardField, resetOnboard } from "@/lib/store/slices/onboardSlice";
import { RiArrowLeftLongLine, RiArrowRightSLine, RiLoader2Line } from "@remixicon/react";
import { step1Schema , step2Schema } from "@/lib/validation/onboardSchema";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Dialog, DialogContent } from "../ui/dialog";
import InviteUser from "./onboardComponents/InviteUser";
import { setOrganization } from "@/lib/store/slices/organizationSlice";
import UserOnboard from "./onboardComponents/UserOnboard";
import { getBackendURL } from "@/lib/utils";

const Onboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { session , appUser } = useSelector((state: RootState) => state.auth);
  const onboard = useSelector((state: RootState) => state.onboard);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successPopup, setSuccessPopup] = useState<boolean>(false);
  const [isAdmin , setIsAdmin] = useState<boolean>(false);
  const baseURL = getBackendURL();

useEffect(() => {
  const restoreSessionAndCheckOnboard = async () => {
    try {
      const res = await fetch(`${baseURL}/auth/restore`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        console.log(data);
        dispatch(setSession(data));
        const onboardRes = await fetch(`${baseURL}/users/me`, {
          credentials: "include",
        });

        if (onboardRes.ok) {
          const appUser = await onboardRes.json();
          dispatch(setAppUser(appUser));
          if (appUser.organization_id && appUser.first_name !== "f_name" && appUser.last_name !== "l_name") {
              navigate("/dashboard");
              return;
            }
        }else{
          setIsAdmin(true);
        }
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

  restoreSessionAndCheckOnboard();
}, [dispatch, navigate]);

  const handleNext = () => {
    if (step === 1) {
      const result = step1Schema.safeParse(onboard);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach((err) => {
          fieldErrors[err.path[0] as string] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }
      setErrors({});
      setStep(2);
    } else if (step === 2) {
      const result = step2Schema.safeParse(onboard);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach((err) => {
          fieldErrors[err.path[0] as string] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }
      setErrors({});
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${baseURL}/onboard`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(onboard),
      });

      if (res.ok) {
        dispatch(resetOnboard());
        setSuccessPopup(true); 
        setTimeout(() => {
          setSuccessPopup(false);
          setStep(3);
      }, 2500);
      } else {
        const err = await res.json();
        alert(err.error || "Onboarding failed");
      }
      const data = await res.json();
      dispatch(setOrganization(data));
    } catch (err) {
      console.error("Onboard error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500 text-lg flex gap-2 items-center">
          Loading{" "}
          <RiLoader2Line
            className="animate-spin text-ts12 text-lg"
            size={20}
          />
        </p>
      </div>
    );
  }

  if (!session) return null;

  if (appUser?.role_id !== 1001 && !isAdmin) {
    return <UserOnboard />;
  }

  return (
    <>
      <Dialog open={successPopup} onOpenChange={setSuccessPopup}>
          <DialogContent className="flex flex-col items-center justify-center gap-4 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-6xl"
            >
              🎉
            </motion.div>
            <h2 className="text-2xl font-bold text-ts12">Hurray!</h2>
            <p className="text-gray-600">Your organization has been created successfully.</p>
          </DialogContent>
    </Dialog>

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
              <h2 className="text-2xl text-left font-semibold text-black mb-2">
                Welcome <span className="text-ts12 text-4xl">{session.user?.email}</span> 
              </h2>
              <p className="text-lg text-left  text-ts12 mb-6">
                Let&apos;s get to know your organization
              </p>
              <div className="space-y-4">
                <div>
                  <Label className="block text-gray-700 text-left mb-2">Organization Name</Label>
                  <Input
                    className="w-full border rounded-md p-2"
                    value={onboard.org_name}
                    placeholder="Cats Organazation"
                    onChange={(e) =>
                      dispatch(
                        setOnboardField({ field: "org_name", value: e.target.value })
                      )
                    }
                  />
                  {errors.org_name && (
                    <p className="text-red-500 text-xs text-left">{errors.org_name}</p>
                  )}
                </div>
                <div>
                  <Label className="block text-gray-700 text-left mb-2">Subdomain</Label>
                  <Input
                    className="w-full border rounded-md p-2"
                    value={onboard.subdomain}
                    placeholder="cats"
                    onChange={(e) =>
                      dispatch(
                        setOnboardField({ field: "subdomain", value: e.target.value })
                      )
                    }
                  />
                  {errors.subdomain && (
                    <p className="text-red-500 text-xs text-left">{errors.subdomain}</p>
                  )}
                </div>
                <div>
                  <Label className="block text-gray-700 text-left mb-2">Username</Label>
                  <Input
                    className="w-full border rounded-md p-2"
                    value={onboard.username}
                    placeholder="AdminCattylyst143"
                    onChange={(e) =>
                      dispatch(
                        setOnboardField({ field: "username", value: e.target.value })
                      )
                    }
                  />
                  {errors.username && (
                    <p className="text-red-500 text-xs text-left">{errors.username}</p>
                  )}
                </div>
              </div>
              <Button
                onClick={handleNext}
                className="w-1/4 mt-4 cursor-pointer bg-ts12 hover:bg-orange-400 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-md hover:shadow-ts12 text-white"
              >
                Next<RiArrowRightSLine size={20} />
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
              <h2 className="text-2xl font-semibold text-left text-ts12 mb-6">
                Let&apos;s get to know you 😊
              </h2>
              <div className="space-y-4">
                <div>
                  <Label className="block text-gray-700 text-left mb-2">First Name</Label>
                  <Input
                    className="w-full border rounded-md p-2"
                    value={onboard.first_name}
                    onChange={(e) =>
                      dispatch(
                        setOnboardField({ field: "first_name", value: e.target.value })
                      )
                    }
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-xs text-left">{errors.first_name}</p>
                  )}
                </div>
                <div>
                  <Label className="block text-gray-700 text-left mb-2">Last Name</Label>
                  <Input
                    className="w-full border rounded-md p-2"
                    value={onboard.last_name}
                    onChange={(e) =>
                      dispatch(
                        setOnboardField({ field: "last_name", value: e.target.value })
                      )
                    }
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-xs text-left">{errors.last_name}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-center items-center gap-4 mt-6">
                <Button
                  onClick={() => setStep(1)}
                  className="bg-transparent p-0 text-ts12 hover:opacity-90 hover:transform hover:-translate-x-1.5 transition-all duration-300 hover:bg-transparent cursor-pointer"
                >
                  <RiArrowLeftLongLine size={32} /> {"Back"}
                </Button>
                <Button
                  onClick={handleNext}
                  className="w-1/4 cursor-pointer bg-ts12 hover:bg-orange-400 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-md hover:shadow-ts12 text-white"
                >
                  Submit
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <InviteUser onFinish={() => navigate("/dashboard")}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
    </>
  );
};

export default Onboard;