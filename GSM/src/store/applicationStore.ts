import { create } from 'zustand';
import { ApplicationData, ApplicationResponse, StatusCheckData } from '../types';

interface ApplicationStore {
  // Application form data
  applicationData: Partial<ApplicationData>;
  setApplicationData: (data: Partial<ApplicationData>) => void;
  
  // Application response
  applicationResponse: ApplicationResponse | null;
  setApplicationResponse: (response: ApplicationResponse) => void;
  
  // Current step
  currentStep: number;
  setCurrentStep: (step: number) => void;
  
  // Loading states
  isSubmitting: boolean;
  setIsSubmitting: (loading: boolean) => void;
  
  // Status check
  statusData: StatusCheckData | null;
  setStatusData: (data: StatusCheckData | null) => void;
  
  // Reset application
  resetApplication: () => void;
}

export const useApplicationStore = create<ApplicationStore>((set) => ({
  applicationData: {},
  setApplicationData: (data) =>
    set((state) => ({
      applicationData: { ...state.applicationData, ...data },
    })),
  
  applicationResponse: null,
  setApplicationResponse: (response) =>
    set({ applicationResponse: response }),
  
  currentStep: 1,
  setCurrentStep: (step) => set({ currentStep: step }),
  
  isSubmitting: false,
  setIsSubmitting: (loading) => set({ isSubmitting: loading }),
  
  statusData: null,
  setStatusData: (data) => set({ statusData: data }),
  
  resetApplication: () =>
    set({
      applicationData: {},
      applicationResponse: null,
      currentStep: 1,
      isSubmitting: false,
    }),
}));