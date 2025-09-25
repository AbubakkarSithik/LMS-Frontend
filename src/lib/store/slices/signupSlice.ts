import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SignupState } from "@/lib/types/type";


const initialState: SignupState = {
  email: "",
  password: "",
};

const signupSlice = createSlice({
  name: "signup",
  initialState,
  reducers: {
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setPassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload;
    },
    resetSignup: () => initialState,
  },
});

export const { setEmail, setPassword, resetSignup } = signupSlice.actions;
export default signupSlice.reducer;
