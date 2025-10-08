import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Holiday,UserRow ,LeaveTypes, Organization, OrganizationState, Roles , RelationData , RelationType} from "@/lib/types/type";
const initialState: OrganizationState = {
  organization: null,
  holiday: [],
  leave_types: [],
  users: [],
  roles: [],
  relations: {
    "employee-manager": [],
    "manager-hr": [],
  },
};

const OrganizationSlice = createSlice({
  name: "Organization",
  initialState,
  reducers: {
    setOrganization: (state, action: PayloadAction<Organization | null>) => {
          state.organization = action.payload;
    },
    setHoliday: (state, action: PayloadAction<Holiday[]>) => {
          state.holiday = action.payload;
    },
    setLeaveTypes: (state, action: PayloadAction<LeaveTypes[]>) => {
          state.leave_types = action.payload;
    },
    setUsers: (state, action: PayloadAction<UserRow[]>) => {
          state.users = action.payload;
    },
    setRoles: (state, action: PayloadAction<Roles[]>) => {
          state.roles = action.payload;
    },
    setRelations( state, action: PayloadAction<Record<RelationType, RelationData[]>> ) {
      state.relations = action.payload;
    },
    resetOrganization: () => initialState,
  },
});

export const { setOrganization, setHoliday, setLeaveTypes, setUsers, setRoles, setRelations ,resetOrganization } = OrganizationSlice.actions;
export default OrganizationSlice.reducer;
