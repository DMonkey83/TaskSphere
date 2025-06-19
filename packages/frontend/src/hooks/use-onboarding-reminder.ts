import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getOnboardingStatus } from "@/lib/api/onboarding";
import { useOnboardingStore } from "@/store/onboarding-store";
import { userStore } from "@/store/user-store";

interface UseOnboardingReminderOptions {
  enabled?: boolean;
  skipFirstLogin?: boolean; // Don't show reminder for first-time users (they get full onboarding)
}

export const useOnboardingReminder = (
  options: UseOnboardingReminderOptions = {}
) => {
  const { enabled = true, skipFirstLogin = true } = options;
  const { setShowReminder } = useOnboardingStore();
  const user = userStore((state) => state.user);


  // Query onboarding status
  const statusQuery = useQuery({
    queryKey: ["onboarding", "reminder-status"],
    queryFn: getOnboardingStatus,
    enabled: enabled && !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: false, // Don't retry on 404 (user might not have onboarding yet)
  });

  // Effect to handle reminder logic
  useEffect(() => {
    if (!statusQuery.data || !user) return;

    const { completed, needsReminder } = statusQuery.data;

    // Don't show reminder if onboarding is already completed
    if (completed) {
      setShowReminder(false);
      return;
    }

    // Check if this is likely a first-time login session
    // Only skip if we explicitly know this is a first login AND we're configured to skip
    if (skipFirstLogin && !user.firstLoginAt) {
      setShowReminder(false);
      return;
    }

    // Show reminder for incomplete onboarding
    if (needsReminder) {
      setShowReminder(true);
    }
  }, [statusQuery.data, user, setShowReminder, skipFirstLogin]);

  return {
    status: statusQuery.data,
    isLoading: statusQuery.isLoading,
    error: statusQuery.error,
    refetch: statusQuery.refetch,
    shouldShowReminder:
      statusQuery.data?.needsReminder && !statusQuery.data?.completed,
  };
};

// Hook specifically for checking if user needs onboarding
export const useOnboardingCheck = () => {
  const user = userStore((state) => state.user);
  const { status, isLoading } = useOnboardingReminder({ enabled: !!user });

  return {
    needsOnboarding: status && status?.needsReminder ? true : false,
    hasStartedOnboarding: status && status?.hasOnboarding ? true : false,
    isFirstTimeUser: !user?.hasCompletedOnboarding && !status?.hasOnboarding,
    isLoading,
    status,
  };
};

// Hook for managing reminder dismissal
export const useReminderDismissal = () => {
  const { setShowReminder } = useOnboardingStore();

  const dismissReminder = (temporarily = false) => {
    setShowReminder(false);

    if (temporarily && typeof window !== "undefined") {
      // Store dismissal in sessionStorage to prevent showing again this session
      sessionStorage.setItem(
        "onboarding-reminder-dismissed",
        Date.now().toString()
      );
    }
  };

  const isDismissedThisSession = () => {
    if (typeof window === "undefined") return false; // SSR check
    
    const dismissed = sessionStorage.getItem("onboarding-reminder-dismissed");
    if (!dismissed) return false;

    // Check if dismissed less than 1 hour ago
    const dismissedTime = parseInt(dismissed);
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    return dismissedTime > oneHourAgo;
  };

  return {
    dismissReminder,
    isDismissedThisSession,
  };
};
