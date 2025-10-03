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

export type OrganizationState = {
    organization: Organization | null,
    holiday: Holiday[],
    leave_types: LeaveTypes[]
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
}

export interface UserRow {
  id: string;
  first_name: string;
  last_name: string;
  role_id: number;
  created_at: string;
  role_name?: string;
}