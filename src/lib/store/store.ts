import { configureStore } from "@reduxjs/toolkit";
import signupReducer from "@/lib/store/slices/signupSlice";
import authReducer from "@/lib/store/slices/authSlice";
import onboardReducer from "@/lib/store/slices/onboardSlice";
import OrganizationSlice from "@/lib/store/slices/organizationSlice";
import leaveSlice from "@/lib/store/slices/leaveSlice";
import leaveRequestSlice from "@/lib/store/slices/leaveRequestSlice";

export const store = configureStore({
  devTools: import.meta.env.DEV,
  reducer: {
    signup: signupReducer,
    auth: authReducer,
    onboard: onboardReducer,
    organization: OrganizationSlice,
    leave: leaveSlice,
    leaveRequest: leaveRequestSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
