import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Session } from "@supabase/supabase-js";
import type { AuthState , AppUser } from "@/lib/types/type";

const initialState: AuthState = {
  session: null,
  appUser: null,
  isAdmin: null,
  isManager: null,
  isHR: null,
  isEmployee: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<Session | null>) => {
      state.session = action.payload;
    },
    setAppUser: (state, action: PayloadAction<AppUser | null>) => {
      state.appUser = action.payload;
    },
    setIsAdmin: (state, action: PayloadAction<boolean | null>) => {
      state.isAdmin = action.payload;
    },
    setIsManager: (state, action: PayloadAction<boolean | null>) => {
      state.isManager = action.payload;
    },
    setIsHR: (state, action: PayloadAction<boolean | null>) => {
      state.isHR = action.payload;
    },
    setIsEmployee: (state, action: PayloadAction<boolean | null>) => {
      state.isEmployee = action.payload;
    },
    clearSession: () => initialState,
  },
});

export const { setSession, clearSession , setAppUser , setIsAdmin , setIsManager , setIsHR , setIsEmployee} = authSlice.actions;
export default authSlice.reducer;