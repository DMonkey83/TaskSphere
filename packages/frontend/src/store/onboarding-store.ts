import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { OnboardingDraftResponse } from "@shared/dto/onboarding.dto";

export interface ProjectDefaults {
  name?: string; // Template for project names
  description?: string; // Template for project descriptions
  industry?:
    | "programming"
    | "legal"
    | "logistics"
    | "marketing"
    | "product"
    | "other";
  workflow?: "kanban" | "scrum" | "timeline" | "calendar" | "checklist";
  status?:
    | "planned"
    | "in_progress"
    | "on_hold"
    | "completed"
    | "cancelled";
  visibility?: "private" | "team" | "account";
}

export interface Preferences {
  theme?: "light" | "dark" | "system";
  notifications?: boolean;
  emailUpdates?: boolean;
}

export interface OnboardingData {
  projectDefaults?: ProjectDefaults;
  preferences?: Preferences;
}

// Use the shared API response type
export type OnboardingDraft = OnboardingDraftResponse;

interface OnboardingStore {
  // State
  draft: OnboardingDraft | null;
  currentStep: number;
  isLoading: boolean;
  error: string | null;
  showReminder: boolean;

  // Actions
  setDraft: (draft: OnboardingDraft) => void;
  setCurrentStep: (step: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setShowReminder: (show: boolean) => void;

  // Form data actions
  updateProjectDefaults: (defaults: Partial<ProjectDefaults>) => void;
  updatePreferences: (prefs: Partial<Preferences>) => void;

  // Step navigation
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;

  // Validation
  isStepValid: (step: number) => boolean;
  canProceedToStep: (step: number) => boolean;

  // Reset
  resetOnboarding: () => void;
  clearError: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      // Initial state
      draft: null,
      currentStep: 0,
      isLoading: false,
      error: null,
      showReminder: false,

      // Basic setters
      setDraft: (draft) => set({ draft }),
      setCurrentStep: (currentStep) => set({ currentStep }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setShowReminder: (showReminder) => set({ showReminder }),

      // Form data updates
      updateProjectDefaults: (defaults) =>
        set((state) => ({
          draft: state?.draft
            ? {
                ...state?.draft,
                data: {
                  ...state?.draft?.data,
                  projectDefaults: {
                    ...state?.draft?.data?.projectDefaults,
                    ...defaults,
                  },
                },
              }
            : null,
        })),

      updatePreferences: (prefs) =>
        set((state) => ({
          draft: state?.draft
            ? {
                ...state?.draft,
                data: {
                  ...state?.draft?.data,
                  preferences: {
                    ...state?.draft?.data?.preferences,
                    ...prefs,
                  },
                },
              }
            : null,
        })),

      // Step navigation
      nextStep: () => {
        const { currentStep, canProceedToStep } = get();
        const nextStep = currentStep + 1;
        if (canProceedToStep(nextStep)) {
          set({ currentStep: nextStep });
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 });
        }
      },

      goToStep: (step) => {
        const { canProceedToStep } = get();
        if (step >= 0 && canProceedToStep(step)) {
          set({ currentStep: step });
        }
      },

      // Validation
      isStepValid: (step) => {
        const { draft } = get();
        if (!draft) return false;

        switch (step) {
          case 0: // Welcome step
            return true;
          case 1: // Project defaults - industry preference and default workflow are key
            return !!(
              draft?.data?.projectDefaults?.industry &&
              draft?.data?.projectDefaults?.workflow
            );
          case 2: // Preferences - theme and notifications
            return !!(
              draft?.data?.preferences?.theme !== undefined &&
              draft?.data?.preferences?.notifications !== undefined
            );
          default:
            return false;
        }
      },

      canProceedToStep: (step) => {
        const { isStepValid } = get();
        // Can always go back or to current step
        const { currentStep } = get();
        if (step <= currentStep) return true;

        // Can only go forward if all previous steps are valid
        for (let i = 0; i < step; i++) {
          if (!isStepValid(i)) return false;
        }
        return true;
      },

      // Reset
      resetOnboarding: () =>
        set({
          draft: null,
          currentStep: 0,
          isLoading: false,
          error: null,
          showReminder: false,
        }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "onboarding-storage",
      partialize: (state) => ({
        draft: state?.draft,
        currentStep: state?.currentStep,
        showReminder: state?.showReminder,
      }),
    }
  )
);

// Selectors for better performance
export const useOnboardingDraft = () =>
  useOnboardingStore((state) => state.draft);

export const useOnboardingStep = () => {
  const currentStep = useOnboardingStore((state) => state.currentStep);
  const nextStep = useOnboardingStore((state) => state.nextStep);
  const previousStep = useOnboardingStore((state) => state.previousStep);
  const goToStep = useOnboardingStore((state) => state.goToStep);
  const isStepValid = useOnboardingStore((state) => state.isStepValid);
  const canProceedToStep = useOnboardingStore(
    (state) => state.canProceedToStep
  );

  return {
    currentStep,
    nextStep,
    previousStep,
    goToStep,
    isStepValid,
    canProceedToStep,
  };
};

export const useOnboardingData = () => {
  const projectDefaults = useOnboardingStore(
    (state) => state.draft?.data?.projectDefaults
  );
  const preferences = useOnboardingStore(
    (state) => state.draft?.data?.preferences
  );
  const updateProjectDefaults = useOnboardingStore(
    (state) => state.updateProjectDefaults
  );
  const updatePreferences = useOnboardingStore(
    (state) => state.updatePreferences
  );

  return {
    projectDefaults,
    preferences,
    updateProjectDefaults,
    updatePreferences,
  };
};

export const useOnboardingState = () => {
  const isLoading = useOnboardingStore((state) => state.isLoading);
  const error = useOnboardingStore((state) => state.error);
  const showReminder = useOnboardingStore((state) => state.showReminder);
  const setLoading = useOnboardingStore((state) => state.setLoading);
  const setError = useOnboardingStore((state) => state.setError);
  const setShowReminder = useOnboardingStore((state) => state.setShowReminder);
  const clearError = useOnboardingStore((state) => state.clearError);

  return {
    isLoading,
    error,
    showReminder,
    setLoading,
    setError,
    setShowReminder,
    clearError,
  };
};
