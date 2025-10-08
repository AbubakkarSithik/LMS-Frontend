import type { LeaveRequest, LeaveTypes, LeaveRequestPayload, LeaveAuditLog } from '@/lib/types/type';
import { getBackendURL } from '../utils';

const BASE_URL = `${getBackendURL()}/request-leave`; 

const defaultHeaders = () => ({
    'Content-Type': 'application/json',
});

// POST /api/leave/request
export const createLeaveRequest = async (payload: LeaveRequestPayload) => {
    const response = await fetch(`${BASE_URL}/request`, {
        method: 'POST',
        credentials: 'include',
        headers: defaultHeaders(),
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to request leave.');
    }
    return response.json();
};

// GET /api/leave/requests
export const fetchLeaveRequests = async (): Promise<LeaveRequest[]> => {
    const response = await fetch(`${BASE_URL}/requests`, {
        method: 'GET',
        credentials: 'include',
        headers: defaultHeaders(),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch leave requests.');
    }
    return response.json();
};


// GET leavetypes
export const fetchLeaveTypes = async (): Promise<LeaveTypes[]> => {
    const res = await fetch(`${getBackendURL()}/organization/leave-types`, { credentials: "include" });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err.error || 'Failed to fetch leave types.');
      }
      return res.json();
};

// PATCH /api/leave/approve/:id
export const approveLeave = async (id: number, remarks: string) => {
    const response = await fetch(`${BASE_URL}/approve/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: defaultHeaders(),
        body: JSON.stringify({ remarks }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve leave.');
    }
    return response.json();
};

// PATCH /api/leave/reject/:id
export const rejectLeave = async (id: number, remarks: string) => {
    const response = await fetch(`${BASE_URL}/reject/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: defaultHeaders(),
        body: JSON.stringify({ remarks }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject leave.');
    }
    return response.json();
};

// GET /api/leave/:id/auditlog
export const fetchAuditLog = async (id: number): Promise<LeaveAuditLog[]> => {
    const response = await fetch(`${BASE_URL}/${id}/auditlog`, {
        method: 'GET',
        credentials: 'include',
        headers: defaultHeaders(),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch audit log.');
    }
    return response.json();
};