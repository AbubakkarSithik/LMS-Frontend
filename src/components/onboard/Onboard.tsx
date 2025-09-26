// import React, { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import type { RootState, AppDispatch } from "@/lib/store/store";
// import { setSession, clearSession } from "@/lib/store/slices/authSlice";
// import { RiLoader2Line } from "@remixicon/react";

// const Onboard: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();
//   const { session } = useSelector((state: RootState) => state.auth);
//   const [loading, setLoading] = useState(true);

//   // Restore session from backend (cookies)
//   useEffect(() => {
//     const restoreSession = async () => {
//       try {
//         const res = await fetch("http://localhost:4005/auth/restore", {
//           credentials: "include", // send cookies
//         });

//         if (res.ok) {
//           const data = await res.json();
//           dispatch(setSession(data));
//         } else {
//           dispatch(clearSession());
//           navigate("/"); // unauthorized
//         }
//       } catch (err) {
//         console.error("Restore session failed:", err);
//         dispatch(clearSession());
//         navigate("/");
//       } finally {
//         setLoading(false);
//       }
//     };

//     restoreSession();
//   }, [dispatch, navigate]);

//   // optional safeguard
//   useEffect(() => {
//     const interval = setInterval(async () => {
//       const res = await fetch("http://localhost:4005/auth/restore", {
//         credentials: "include",
//       });
//       if (!res.ok) {
//         dispatch(clearSession());
//         navigate("/");
//       }
//     }, 60_000); 
//     return () => clearInterval(interval);
//   }, [dispatch, navigate]);

//   if (loading) {
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <p className="text-gray-500 text-lg flex gap-2 items-center justify-between">Loading <RiLoader2Line className="animate-spin text-ts12 text-lg" size={20} /></p>
//       </div>
//     );
//   }

//   if (!session) return null; // if no session after restore, redirect already happened

//   return (
//     <div className="flex h-screen w-screen font-manrope">
//       {/* Left Side */}
//       <div className="relative flex flex-col justify-center items-center w-1/2 overflow-hidden">
//         <div className="absolute -top-8 -left-10 size-[800px] bg-gradient-to-br from-ts12 via-orange-500 to-orange-700 blur-2xl opacity-90" />
//         <div className="absolute top-0 right-0 size-[300px] bg-gradient-to-tr from-orange-200 to-orange-100 rounded-full blur-3xl opacity-80" />
//         <div className="absolute -bottom-6 -left-6 size-[300px] bg-gradient-to-tr from-orange-200 to-orange-100 rounded-full blur-3xl opacity-80" />

//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           className="relative z-10 text-center px-6"
//         >
//           <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
//             Leave Management System
//           </h1>
//           <p className="mt-4 text-lg text-orange-100">
//             Simplify your employee leave tracking with ease and efficiency.
//           </p>
//         </motion.div>
//       </div>

//       {/* Right Side */}
//       <div className="flex w-1/2 bg-white justify-center items-center">
//         <p className="text-lg font-semibold text-gray-800">
//           🎉 Welcome {session.user?.email}, you are logged in!
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Onboard;  

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/lib/store/store";
import { setSession, clearSession } from "@/lib/store/slices/authSlice";
import { setOnboardField, resetOnboard } from "@/lib/store/slices/onboardSlice";
import { RiArrowLeftLongLine, RiArrowRightSLine, RiLoader2Line } from "@remixicon/react";
import { step1Schema , step2Schema } from "@/lib/validation/onboardSchema";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

const Onboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { session } = useSelector((state: RootState) => state.auth);
  const onboard = useSelector((state: RootState) => state.onboard);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  console.log(session);

  // Restore session from backend (cookies)
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await fetch("http://localhost:4005/auth/restore", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          dispatch(setSession(data));
        } else {
          dispatch(clearSession());
          navigate("/");
        }
      } catch {
        dispatch(clearSession());
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
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
      const res = await fetch("http://localhost:4005/onboard", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(onboard),
      });

      if (res.ok) {
        dispatch(resetOnboard());
        navigate("/dashboard"); // after success
      } else {
        const err = await res.json();
        alert(err.error || "Onboarding failed");
      }
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
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboard;