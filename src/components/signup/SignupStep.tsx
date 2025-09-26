import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RiMailLine, RiLockLine ,RiEyeLine, RiEyeOffLine, RiLoader2Line } from "@remixicon/react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/lib/store/store";
import { setEmail, setPassword, resetSignup } from "@/lib/store/slices/signupSlice";
import { signupSchema } from "@/lib/validation/signupSchema";
import { useNavigate } from "react-router-dom";

const SignupStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { email, password } = useSelector((state: RootState) => state.signup);

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [emailSent , setEmailSent] = useState<boolean>(false);
  const [loading , setLoading] = useState<boolean>(false);
  const [isLogin, setIsLogin] = useState<boolean>(false);

  const validateField = (field: "email" | "password", value: string) => {
    const result = signupSchema.safeParse({ email, password, [field]: value });

    if (!result.success) {
      const fieldError = result.error.issues.find((err) => err.path[0] === field);
      setErrors((prev) => ({ ...prev, [field]: fieldError?.message }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

  try {
    setLoading(true);
    const apiUrl = `http://localhost:4005/auth/${isLogin ? "login" : "signup"}`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: result.data.email,
        password: result.data.password,
      }),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert("❌ Signup failed: " + errorData.message);
      return;
    }

    const data = await response.json();
    data.user.aud && setEmailSent(true);
    setLoading(false);
    if (isLogin) navigate("/onboard");
    dispatch(resetSignup());
  } catch (error) {
    console.error("Signup error:", error);
    alert("⚠️ Something went wrong, please try again.");
  }
};

  return (
    <>
    {!emailSent && <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md p-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800">{isLogin ? "Login" : "Sign Up"}</h2>

          <form className="space-y-5" onSubmit={handleSubmit} name={isLogin ? "Login" : "Sign Up"} id={isLogin ? "Login" : "Sign Up"}>
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
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
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

            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Button */}
            <Button
              type="submit"
              className="w-1/4 cursor-pointer bg-ts12 hover:bg-orange-400 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-md hover:shadow-ts12 text-white"
            >
               {loading ? <RiLoader2Line className="animate-spin text-white text-lg" size={20} />: <div>{isLogin ? "Login" : "Sign Up"}</div>}
            </Button>
          </form>
          <p className="mt-4">{isLogin ? "Don't have an account?" : "Already have an account?"} <Button className="text-ts12 p-0 bg-transparent hover:bg-transparent hover:text-orange-400 transition-all duration-300 hover:transform hover:-translate-y-1 cursor-pointer"
            onClick={() => setIsLogin(!isLogin)}>{isLogin ? "Sign Up" : "Login"}</Button></p>
   </motion.div>}
   {emailSent && <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md p-8"
        >
         <div>Check your email for verification link</div>
   </motion.div>}
   </>
  )
}

export default SignupStep;