import { configureStore } from "@reduxjs/toolkit";
import signupReducer from "@/lib/store/slices/signupSlice";
import authReducer from "@/lib/store/slices/authSlice";

export const store = configureStore({
  reducer: {
    signup: signupReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
