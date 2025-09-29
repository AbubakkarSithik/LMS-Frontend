import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { OrganizationState } from "@/lib/types/type";

const initialState: OrganizationState = {
  organization_id: "",
  org_name: "",
  subdomain: "",
};

const OrganizationSlice = createSlice({
  name: "Organization",
  initialState,
  reducers: {
    setOrganizationField: (
      state,
      action: PayloadAction<{ field: keyof OrganizationState; value: string  }>
    ) => {
      state[action.payload.field] = action.payload.value;
    },
    resetOrganization: () => initialState,
  },
});

export const { setOrganizationField, resetOrganization } = OrganizationSlice.actions;
export default OrganizationSlice.reducer;
