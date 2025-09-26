import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { OnboardState } from "@/lib/types/type";

const initialState: OnboardState = {
  org_name: "",
  subdomain: "",
  username: "",
  first_name: "",
  last_name: "",
};

const onboardSlice = createSlice({
  name: "onboard",
  initialState,
  reducers: {
    setOnboardField: (
      state,
      action: PayloadAction<{ field: keyof OnboardState; value: string  }>
    ) => {
      state[action.payload.field] = action.payload.value;
    },
    resetOnboard: () => initialState,
  },
});

export const { setOnboardField, resetOnboard } = onboardSlice.actions;
export default onboardSlice.reducer;
