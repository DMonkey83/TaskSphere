import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import * as onboardingApi from "@/lib/api/onboarding";
import { useOnboardingStore } from "@/store/onboarding-store";

// Query keys
export const onboardingKeys = {
  all: ["onboarding"] as const,
  draft: () => [...onboardingKeys.all, "draft"] as const,
  status: () => [...onboardingKeys.all, "status"] as const,
  stats: () => [...onboardingKeys.all, "stats"] as const,
};

// Get onboarding draft
export const useOnboardingDraft = () => {
  const { setDraft, setError } = useOnboardingStore();

  return useQuery({
    queryKey: onboardingKeys.draft(),
    queryFn: onboardingApi.getDraft,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if draft doesn't exist (404)
      if (error.message.includes("404")) return false;
      return failureCount < 2;
    },
    meta: {
      onSuccess: (data) => {
        setDraft(data);
        setError(null);
      },
      onError: (error) => {
        setError(error.message);
        console.error("Failed to fetch onboarding draft:", error);
      },
    },
  });
};

// Get onboarding status
export const useOnboardingStatus = () => {
  return useQuery({
    queryKey: onboardingKeys.status(),
    queryFn: onboardingApi.getOnboardingStatus,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

// Get onboarding stats (for admins)
export const useOnboardingStats = () => {
  return useQuery({
    queryKey: onboardingKeys.stats(),
    queryFn: onboardingApi.getOnboardingStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

// Create onboarding draft
export const useCreateOnboardingDraft = () => {
  const queryClient = useQueryClient();
  const { setDraft, setLoading, setError } = useOnboardingStore();

  return useMutation({
    mutationFn: onboardingApi.createDraft,
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      setDraft(data);
      setLoading(false);
      queryClient.setQueryData(onboardingKeys.draft(), data);
      queryClient.invalidateQueries({ queryKey: onboardingKeys.status() });
      toast.success("Onboarding started!");
    },
    onError: (error) => {
      setLoading(false);
      setError(error.message);
      toast.error("Failed to start onboarding");
      console.error("Failed to create onboarding draft:", error);
    },
  });
};

// Update onboarding draft
export const useUpdateOnboardingDraft = () => {
  const queryClient = useQueryClient();
  const { setDraft, setLoading, setError, setCurrentStep } =
    useOnboardingStore();

  return useMutation({
    mutationFn: onboardingApi.updateDraft,
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data, variables) => {
      setDraft(data);
      setLoading(false);

      // Update current step if provided
      if (variables.step !== undefined) {
        setCurrentStep(variables.step);
      }

      queryClient.setQueryData(onboardingKeys.draft(), data);
      queryClient.invalidateQueries({ queryKey: onboardingKeys.status() });
    },
    onError: (error) => {
      setLoading(false);
      setError(error.message);
      toast.error("Failed to update onboarding");
      console.error("Failed to update onboarding draft:", error);
    },
  });
};

// Complete onboarding
export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();
  const { setDraft, setLoading, setError, setShowReminder } =
    useOnboardingStore();

  return useMutation({
    mutationFn: onboardingApi.completeDraft,
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      setDraft(data);
      setLoading(false);
      setShowReminder(false);

      queryClient.setQueryData(onboardingKeys.draft(), data);
      queryClient.invalidateQueries({ queryKey: onboardingKeys.status() });
      queryClient.invalidateQueries({ queryKey: onboardingKeys.stats() });

      toast.success("Welcome to TaskSphere! 🎉");
    },
    onError: (error) => {
      setLoading(false);
      setError(error.message);
      toast.error("Failed to complete onboarding");
      console.error("Failed to complete onboarding:", error);
    },
  });
};

// Delete onboarding draft
export const useDeleteOnboardingDraft = () => {
  const queryClient = useQueryClient();
  const { resetOnboarding, setLoading, setError } = useOnboardingStore();

  return useMutation({
    mutationFn: onboardingApi.deleteDraft,
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: () => {
      resetOnboarding();
      setLoading(false);

      queryClient.removeQueries({ queryKey: onboardingKeys.draft() });
      queryClient.invalidateQueries({ queryKey: onboardingKeys.status() });

      toast.success("Onboarding draft deleted");
    },
    onError: (error) => {
      setLoading(false);
      setError(error.message);
      toast.error("Failed to delete onboarding draft");
      console.error("Failed to delete onboarding draft:", error);
    },
  });
};

// Combined hook for easier usage
export const useOnboarding = () => {
  const draft = useOnboardingDraft();
  const status = useOnboardingStatus();
  const createDraft = useCreateOnboardingDraft();
  const updateDraft = useUpdateOnboardingDraft();
  const completeDraft = useCompleteOnboarding();
  const deleteDraft = useDeleteOnboardingDraft();

  return {
    // Data
    draft: draft.data,
    status: status.data,

    // Loading states
    isLoading: draft.isLoading || status.isLoading,
    isDraftLoading: draft.isLoading,
    isStatusLoading: status.isLoading,

    // Error states
    error: draft.error || status.error,
    draftError: draft.error,
    statusError: status.error,

    // Mutations
    createDraft: createDraft.mutate,
    updateDraft: updateDraft.mutate,
    completeDraft: completeDraft.mutate,
    deleteDraft: deleteDraft.mutate,

    // Mutation states
    isCreating: createDraft.isPending,
    isUpdating: updateDraft.isPending,
    isCompleting: completeDraft.isPending,
    isDeleting: deleteDraft.isPending,

    // Refetch
    refetchDraft: draft.refetch,
    refetchStatus: status.refetch,
  };
};
