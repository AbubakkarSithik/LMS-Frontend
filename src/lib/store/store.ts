import { configureStore } from "@reduxjs/toolkit";
import signupReducer from "@/lib/store/slices/signupSlice";
import authReducer from "@/lib/store/slices/authSlice";
import onboardReducer from "@/lib/store/slices/onboardSlice";
import OrganizationSlice from "@/lib/store/slices/organizationSlice";

export const store = configureStore({
  devTools: import.meta.env.DEV,
  reducer: {
    signup: signupReducer,
    auth: authReducer,
    onboard: onboardReducer,
    organization: OrganizationSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
