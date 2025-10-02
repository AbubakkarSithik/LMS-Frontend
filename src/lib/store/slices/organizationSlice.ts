import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Holiday, LeaveTypes, Organization, OrganizationState } from "@/lib/types/type";
const initialState: OrganizationState = {
  organization: null,
  holiday: null,
  leave_types: null
};

const OrganizationSlice = createSlice({
  name: "Organization",
  initialState,
  reducers: {
    setOrganization: (state, action: PayloadAction<Organization | null>) => {
          state.organization = action.payload;
    },
    setHoliday: (state, action: PayloadAction<Holiday | null>) => {
          state.holiday = action.payload;
    },
    setLeaveTypes: (state, action: PayloadAction<LeaveTypes | null>) => {
          state.leave_types = action.payload;
    },
    resetOrganization: () => initialState,
  },
});

export const { setOrganization, setHoliday, setLeaveTypes,  resetOrganization } = OrganizationSlice.actions;
export default OrganizationSlice.reducer;
