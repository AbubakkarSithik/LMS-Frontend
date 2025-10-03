import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { LeaveSliceState , LeaveBalance } from "@/lib/types/type";

const initialState: LeaveSliceState = {
    leaveBalance: [],
};

const leaveSlice = createSlice({
  name: "leave",
  initialState,
  reducers: {
     setLeaveBalance: (state, action: PayloadAction<LeaveBalance[]>) => { state.leaveBalance = action.payload },
  },
});

export const { setLeaveBalance } = leaveSlice.actions;
export default leaveSlice.reducer;