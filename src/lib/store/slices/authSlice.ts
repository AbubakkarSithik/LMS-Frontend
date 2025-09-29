import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Session } from "@supabase/supabase-js";
import type { AuthState , AppUser } from "@/lib/types/type";

const initialState: AuthState = {
  session: null,
  appUser: null,
  isAdmin: null
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
    clearSession: (state) => {
      state.session = null;
      state.appUser = null;
      state.isAdmin = null;
    },
  },
});

export const { setSession, clearSession , setAppUser , setIsAdmin} = authSlice.actions;
export default authSlice.reducer;