"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  useOnboardingReminder,
  useReminderDismissal,
} from "@/hooks/use-onboarding-reminder";
import { useOnboardingStore } from "@/store/onboarding-store";
import { userStore } from "@/store/user-store";

import { OnboardingReminderModal } from "./onboarding-reminder-modal";

interface OnboardingReminderProviderProps {
  children: React.ReactNode;
}

export function OnboardingReminderProvider({
  children,
}: OnboardingReminderProviderProps) {
  const router = useRouter();
  const user = userStore((state) => state.user);
  const { showReminder } = useOnboardingStore();
  const { isDismissedThisSession } = useReminderDismissal();
  const [modalOpen, setModalOpen] = useState(false);

  // Use reminder hook to check onboarding status
  const { shouldShowReminder, isLoading } = useOnboardingReminder({
    enabled: !!user,
    // Temporary fix: If firstLoginAt is undefined, assume not first login (show reminders)
    // TODO: Fix firstLoginAt population in user store
    skipFirstLogin: false, // Temporarily disabled until firstLoginAt is properly populated
  });

  // Effect to show modal when conditions are met
  useEffect(() => {
    if (!user || isLoading) return;

    // Don't show if user dismissed it this session
    if (isDismissedThisSession()) return;

    // Show modal if reminder conditions are met and store says to show
    if (shouldShowReminder && showReminder) {
      // Add a small delay to ensure page is loaded
      const timer = setTimeout(() => {
        setModalOpen(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [
    user,
    shouldShowReminder,
    showReminder,
    isLoading,
    isDismissedThisSession,
  ]);

  const handleContinueOnboarding = () => {
    // Navigate to onboarding page or modal
    router.push("/onboarding");
  };

  const handleModalClose = (open: boolean) => {
    setModalOpen(open);
  };

  return (
    <>
      {children}
      <OnboardingReminderModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        onContinueOnboarding={handleContinueOnboarding}
      />
    </>
  );
}
