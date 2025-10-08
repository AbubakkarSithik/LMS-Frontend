import type { Session } from "@supabase/supabase-js";
export interface SignupState {
  email: string;
  password: string;
}

export interface SignupStepProps{
    setStep?: (step: number) => void
}

export interface OnboardState {
  org_name: string;
  subdomain: string;
  username: string;
  first_name: string;
  last_name: string;
}

export interface Holiday{
  holiday_id : number;
  organization_id : number;
  name : string;
  holiday_date : string;
  is_recurring : boolean;
}

export interface LeaveTypes{
  leave_type_id : number,
  organization_id : number,
  name : string,
  description : string,
  max_days_per_year: number
}

export interface Organization {
  organization_id: number;
  name: string;
  subdomain: string;
}
export interface UserRow {
  id: string;
  first_name: string;
  last_name: string;
  role_id: number;
  created_at: string;
  username: string;
  email: string;
  organization_id?: number
}

export interface Roles {
  role_id: number;
  role_name: string;
}

export type RelationType = "employee-manager" | "manager-hr";

export interface RelationData {
  id?: number;
  employee_id?: string;
  manager_id?: string;
  hr_id?: string;
}

export type OrganizationState = {
    organization: Organization | null,
    holiday: Holiday[],
    leave_types: LeaveTypes[]
    users: UserRow[]
    roles: Roles[];
    relations: Record<RelationType, RelationData[]>;
};

export interface AppUser {
  id: string;
  email: string;
  role_id: number;
  organization_id: number;
  first_name?: string;
  last_name?: string;
}
export interface AuthState {
  session: Session | null;
  appUser: AppUser | null;
  isAdmin: boolean | null;
  isManager: boolean | null;
  isHR: boolean | null;
  isEmployee: boolean | null;
}

export interface LeaveBalance {
  leave_balance_id: number;
  employee_id: string;
  leave_type_id: number;
  year: number;
  total_allocated: number;
  total_used: number | null;
  remaining: number | null;
}

export interface LeaveSliceState {
  leaveBalance: LeaveBalance[];
}
export interface Relation {
  employee_id?: string;
  manager_id?: string;
  hr_id?: string;
  admin_id?: string;
}

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface LeaveRequest {
  leave_request_id: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  applied_at: string;
  approved_at?: string | null;
  approved_by?: string | null;
  app_user: Employee;
  leave_type: LeaveTypes;
}

export interface LeaveAuditLog {
  log_id: number;
  leave_request_id: number;
  action: 'Created' | 'Approved' | 'Rejected';
  from_status: string;
  to_status: string;
  performed_by: string;
  performed_at: string;
  remarks: string | null;
}

export interface LeaveState {
  requests: LeaveRequest[];
  pendingRequests: LeaveRequest[]; 
  history: LeaveRequest[]; 
  leaveTypes: LeaveTypes[];
  isLoading: boolean;
  error: string | null;
  activeRequestLog: LeaveAuditLog[] | null;
}

export interface LeaveRequestPayload {
  leave_type_id: number;
  start_date: string;
  end_date: string;
  reason: string;
}

export interface LeaveRequestCardProps {
  request: LeaveRequest;
  isManagerView: boolean;
  onApprove: (id: number, remarks: string) => void;
  onReject: (id: number, remarks: string) => void;
  onViewDetails: (id: number) => void;
}