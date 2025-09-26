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

export type OrganizationState = {
    organization_id: string;
    name: string,
    subdomain: string
};
