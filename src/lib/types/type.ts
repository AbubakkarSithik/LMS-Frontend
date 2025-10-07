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

export type OrganizationState = {
    organization: Organization | null,
    holiday: Holiday[],
    leave_types: LeaveTypes[]
    users: UserRow[]
    roles: Roles[];
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