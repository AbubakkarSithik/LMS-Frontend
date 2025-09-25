import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RiMailLine, RiLockLine ,RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/lib/store/store";
import { setEmail, setPassword, resetSignup } from "@/lib/store/slices/signupSlice";
import { signupSchema } from "@/lib/validation/signupSchema";

const Onboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { email, password } = useSelector((state: RootState) => state.signup);

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateField = (field: "email" | "password", value: string) => {
    const result = signupSchema.safeParse({ email, password, [field]: value });

    if (!result.success) {
      const fieldError = result.error.issues.find((err) => err.path[0] === field);
      setErrors((prev) => ({ ...prev, [field]: fieldError?.message }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = signupSchema.safeParse({ email, password });
    if (!result.success) {
      const formErrors: { email?: string; password?: string } = {};
      result.error.issues.forEach((err) => {
        if (err.path[0] === "email") formErrors.email = err.message;
        if (err.path[0] === "password") formErrors.password = err.message;
      });
      setErrors(formErrors);
      return;
    }

    setErrors({});
    alert("✅ Form valid: " + JSON.stringify(result.data));
    dispatch(resetSignup());
  };

  return (
    <div className="flex h-screen w-screen font-manrope">
      {/* Left Side */}
      <div className="relative flex flex-col justify-center items-center w-1/2 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute -top-8 -left-10 size-[800px] bg-gradient-to-br from-ts12 via-orange-500 to-orange-700 blur-2xl opacity-90" />
        <div className="absolute top-0 right-0 size-[300px] bg-gradient-to-tr from-orange-200 to-orange-100 rounded-full blur-3xl opacity-80" />
        <div className="absolute -bottom-6 -left-6 size-[300px] bg-gradient-to-tr from-orange-200 to-orange-100 rounded-full blur-3xl opacity-80" />

        {/* Foreground branding */}
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
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md p-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Sign Up</h2>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="relative">
              <RiMailLine className="absolute left-3 top-2.5 text-gray-800" size={20} />
              <Input
                type="email"
                placeholder="Org email"
                className="pl-10"
                value={email}
                onChange={(e) => {
                  dispatch(setEmail(e.target.value));
                  validateField("email", e.target.value);
                }}
                onBlur={(e) => validateField("email", e.target.value)}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

           {/* Password */}
            <div className="relative">
            <RiLockLine className="absolute left-3 top-2.5 text-gray-800" size={20} />

            <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="pl-10 pr-10"
                value={password}
                onChange={(e) => {
                dispatch(setPassword(e.target.value));
                validateField("password", e.target.value);
                }}
                onBlur={(e) => validateField("password", e.target.value)}
            />

            {/* Toggle Eye Icon */}
            { password &&  <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-2.5 text-gray-800 hover:text-gray-600"
            >
                {showPassword ? (
                <RiEyeOffLine size={20} />
                ) : (
                <RiEyeLine size={20} />
                )}
            </motion.button> }

            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Button */}
            <Button
              type="submit"
              className="w-1/4 cursor-pointer bg-ts12 hover:bg-orange-400 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-md hover:shadow-ts12 text-white"
            >
              Sign In
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Onboard;
