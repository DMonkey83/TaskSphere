"use client";

import { useState } from "react";
import {
  IoCheckmarkCircle,
  IoTime,
  IoArrowForward,
  IoClose,
} from "react-icons/io5";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useReminderDismissal } from "@/hooks/use-onboarding-reminder";
import { useOnboarding } from "@/lib/queries/useOnboarding";
import { useOnboardingStore } from "@/store/onboarding-store";

interface OnboardingReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinueOnboarding: () => void;
}

const ONBOARDING_STEPS = [
  { id: 0, title: "Welcome", description: "Get started with TaskSphere" },
  {
    id: 1,
    title: "Project Defaults",
    description: "Set your project preferences",
  },
  { id: 2, title: "Preferences", description: "Customize your experience" },
];

export function OnboardingReminderModal({
  open,
  onOpenChange,
  onContinueOnboarding,
}: OnboardingReminderModalProps) {
  const { draft } = useOnboarding();
  const { dismissReminder } = useReminderDismissal();
  const { setShowReminder } = useOnboardingStore();
  const [isClosing, setIsClosing] = useState(false);

  const currentStep = draft?.step || 0;
  const totalSteps = ONBOARDING_STEPS.length;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleContinue = () => {
    setIsClosing(true);
    onContinueOnboarding();
    setShowReminder(false);
    onOpenChange(false);
  };

  const handleDismiss = () => {
    dismissReminder(true); // Dismiss for this session
    setShowReminder(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    setShowReminder(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Complete Your Setup
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
              <IoClose className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            You&apos;re almost there! Finish setting up your TaskSphere account
            to get the most out of the platform.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Section */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <Badge variant="secondary" className="text-xs">
                  {currentStep} of {totalSteps}
                </Badge>
              </div>
              <Progress value={progressPercentage} className="h-2 mb-3" />
              <div className="text-xs text-muted-foreground">
                {Math.round(progressPercentage)}% complete
              </div>
            </CardContent>
          </Card>

          {/* Steps Overview */}
          <div className="space-y-2">
            {ONBOARDING_STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-2 rounded-md transition-colors ${
                  step.id < currentStep
                    ? "text-green-600 bg-green-50"
                    : step.id === currentStep
                    ? "text-blue-600 bg-blue-50"
                    : "text-muted-foreground"
                }`}
              >
                {step.id < currentStep ? (
                  <IoCheckmarkCircle className="h-4 w-4" />
                ) : step.id === currentStep ? (
                  <IoTime className="h-4 w-4" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                )}
                <div>
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs opacity-75">{step.description}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={handleContinue}
              disabled={isClosing}
              className="w-full"
            >
              Continue Setup
              <IoArrowForward className="ml-2 h-4 w-4" />
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleDismiss}
                className="flex-1 text-sm"
              >
                Remind me later
              </Button>
              <Button
                variant="ghost"
                onClick={handleClose}
                className="flex-1 text-sm"
              >
                Maybe later
              </Button>
            </div>
          </div>

          {/* Benefits */}
          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
            <strong>Why complete setup?</strong>
            <ul className="mt-1 space-y-1 list-disc list-inside">
              <li>Personalized project defaults</li>
              <li>Optimized workflow for your team</li>
              <li>Better task management experience</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
