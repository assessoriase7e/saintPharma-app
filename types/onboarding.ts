// Tipos para o processo de onboarding
export interface OnboardingData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    imgUrl?: string;
  };
  storeCustomer?: {
    cpf?: string;
  };
  address: {
    name: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface OnboardingResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export interface OnboardingStatus {
  needsOnboarding: boolean;
  userExists: boolean;
  storeCustomerExists: boolean;
  hasAddress: boolean;
  user?: any;
  storeCustomer?: any;
  address?: any;
}

export interface OnboardingCheckResult {
  isLoading: boolean;
  needsOnboarding: boolean;
  error?: string;
}
