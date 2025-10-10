import {  createSlice, createAsyncThunk, isRejected, isPending } from '@reduxjs/toolkit';
import type { PayloadAction , Action  } from '@reduxjs/toolkit';
import type { LeaveRequest, LeaveState, LeaveTypes, LeaveRequestPayload, LeaveAuditLog } from '@/lib/types/type';
import * as api from '@/lib/apiUtils/leaveApiUtils'; 

type RejectValue = string;

export const fetchAllLeaveRequests = createAsyncThunk<LeaveRequest[], void, { rejectValue: RejectValue }>(
  'leave/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await api.fetchLeaveRequests();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllLeaveHistory = createAsyncThunk<LeaveRequest[], void, { rejectValue: RejectValue }>(
  'leave/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      return await api.fetchLeaveHistory();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLeaveTypes = createAsyncThunk<LeaveTypes[], void, { rejectValue: RejectValue }>(
    'leave/fetchTypes',
    async (_, { rejectWithValue }) => {
        try {
            return await api.fetchLeaveTypes();
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const requestLeave = createAsyncThunk<any, LeaveRequestPayload, { rejectValue: RejectValue }>(
  'leave/requestLeave',
  async (payload, { rejectWithValue }) => {
    try {
      return await api.createLeaveRequest(payload);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const approveLeave = createAsyncThunk<{ id: number; response: any }, { id: number; remarks: string }, { rejectValue: RejectValue }>(
  'leave/approveLeave',
  async ({ id, remarks }, { rejectWithValue }) => {
    try {
      const response = await api.approveLeave(id, remarks);
      return { id, response };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const rejectLeave = createAsyncThunk<{ id: number; response: any }, { id: number; remarks: string }, { rejectValue: RejectValue }>(
  'leave/rejectLeave',
  async ({ id, remarks }, { rejectWithValue }) => {
    try {
      const response = await api.rejectLeave(id, remarks);
      return { id, response };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAuditLog = createAsyncThunk<LeaveAuditLog[], number, { rejectValue: RejectValue }>(
    'leave/fetchAuditLog',
    async (id, { rejectWithValue }) => {
        try {
            return await api.fetchAuditLog(id);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// --- Redux Slice ---

const initialState: LeaveState = {
  requests: [],
  pendingRequests: [],
  history: [],
  leaveTypes: [],
  error: null,
  activeRequestLog: null,
};

const leaveRequestSlice = createSlice({
  name: 'leaveRequest',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    separateRequests: (state: LeaveState, action: PayloadAction<LeaveRequest[]>) => {
        state.history = action.payload.filter(req => req.app_user.id === 'current_user_id');
        state.pendingRequests = action.payload.filter(req => req.status === 'Pending');
    }
  },
  extraReducers: (builder) => {    
    // Fetch Leave Types
    builder.addCase(fetchLeaveTypes.fulfilled, (state, action: PayloadAction<LeaveTypes[]>) => {
      state.leaveTypes = action.payload;
    })

    // Fetch All Leave Requests
    .addCase(fetchAllLeaveRequests.fulfilled, (state, action: PayloadAction<LeaveRequest[]>) => {
      state.requests = action.payload;
      state.pendingRequests = action.payload.filter(req => req.status === 'Pending' || req.status === 'Under Review');
    })

    // Fetch All Leave History
    .addCase(fetchAllLeaveHistory.fulfilled, (state, action: PayloadAction<LeaveRequest[]>) => {
      state.history = action.payload; 
    })

    // Handle Approvals
    .addCase(approveLeave.fulfilled, (state, action: PayloadAction<{ id: number; response: any }>) => {
      const approvedId = action.payload.id;
      state.pendingRequests = state.pendingRequests.filter(req => req.leave_request_id !== approvedId);
    })

    // Handle Rejections
    .addCase(rejectLeave.fulfilled, (state, action: PayloadAction<{ id: number; response: any }>) => {
      const rejectedId = action.payload.id;
      state.pendingRequests = state.pendingRequests.filter(req => req.leave_request_id !== rejectedId);
    })

    // Fetch Audit Log
    .addCase(fetchAuditLog.fulfilled, (state, action: PayloadAction<LeaveAuditLog[]>) => {
      state.activeRequestLog = action.payload;
    })
    
    // Handle Loading for all pending actions
    .addMatcher(
      (action: Action) => isPending(action) && action.type.startsWith('leave/'),
      (state) => {
        state.error = null;
      }
    )

    // Handle Errors for all rejected actions
    .addMatcher(
      (action: Action) => isRejected(action) && action.type.startsWith('leave/'),
      (state, action: any) => {
        state.error = action.payload || action.error?.message || 'An unknown error occurred.';
      }
    );
  },
});

export const { clearError, separateRequests } = leaveRequestSlice.actions;
export default leaveRequestSlice.reducer;