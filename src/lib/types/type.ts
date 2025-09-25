export interface SignupState {
  email: string;
  password: string;
}

export interface SignupStepProps{
    setStep?: (step: number) => void
}