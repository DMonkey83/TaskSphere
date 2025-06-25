"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IoArrowBack,
  IoArrowForward,
  IoCheckmarkCircle,
} from "react-icons/io5";

import { CompletionStep } from "@/components/onboarding/steps/completion-step";
import { PreferencesStep } from "@/components/onboarding/steps/preferences-step";
import { ProjectDefaultsStep } from "@/components/onboarding/steps/project-defaults-step";
import { WelcomeStep } from "@/components/onboarding/steps/welcome-step";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useOnboarding } from "@/lib/queries/useOnboarding";
import { useOnboardingStore } from "@/store/onboarding-store";
import { userStore } from "@/store/user-store";

// Step components (we'll create these next)

const ONBOARDING_STEPS = [
  {
    id: 0,
    title: "Welcome",
    description: "Welcome to TaskSphere",
    component: WelcomeStep,
  },
  {
    id: 1,
    title: "Project Defaults",
    description: "Set your project preferences",
    component: ProjectDefaultsStep,
  },
  {
    id: 2,
    title: "Preferences",
    description: "Customize your experience",
    component: PreferencesStep,
  },
  {
    id: 3,
    title: "Complete",
    description: "You're all set!",
    component: CompletionStep,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const user = userStore((state) => state.user);
  const { currentStep, setCurrentStep } = useOnboardingStore();
  const { draft, createDraft, updateDraft, completeDraft, isLoading } =
    useOnboarding();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize onboarding draft if needed
  useEffect(() => {
    if (!user || isInitialized) return;

    const initializeOnboarding = async () => {
      try {
        if (!draft) {
          await createDraft();
        }
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize onboarding:", error);
      }
    };

    initializeOnboarding();
  }, [user, draft, createDraft, isInitialized]);

  // Redirect if user has already completed onboarding
  useEffect(() => {
    if (user?.hasCompletedOnboarding) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  // Redirect if user shouldn't be here (safety check)
  useEffect(() => {
    if (user && draft?.completed) {
      router.replace("/dashboard");
    }
  }, [user, draft, router]);

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const totalSteps = ONBOARDING_STEPS.length - 1; // Exclude completion step from progress
  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleNext = async () => {
    console.log("🔴 HandleNext called for step:", currentStep);

    // Trigger form submission for current step before moving to next
    const currentStepElement = document.querySelector(
      `[data-step="${currentStep}"] form`
    );
    if (currentStepElement) {
      console.log("🔴 Found form element, triggering submission");
      // Trigger form submission
      const submitEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      });
      currentStepElement.dispatchEvent(submitEvent);

      // Wait a bit for the submission to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (currentStep < ONBOARDING_STEPS.length - 1) {
      const nextStep = currentStep + 1;
      console.log("🔴 Moving to next step:", nextStep);
      await updateDraft({ step: nextStep });
      setCurrentStep(nextStep);
    } else {
      // Complete onboarding
      console.log("🔴 Completing onboarding");
      await completeDraft();
      router.push("/dashboard");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      updateDraft({ step: prevStep });
      setCurrentStep(prevStep);
    }
  };

  const handleSkipToEnd = async () => {
    await completeDraft();
    router.push("/dashboard");
  };

  if (!user || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Setting up your onboarding...</p>
        </div>
      </div>
    );
  }

  const CurrentStepComponent = currentStepData?.component || WelcomeStep;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome to TaskSphere
              </h1>
              <p className="text-gray-600 mt-2">
                Let&apos;s set up your account for the best experience
              </p>
            </div>
            <Badge variant="secondary" className="text-sm">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </Badge>
          </div>

          {/* Progress Bar */}
          {currentStep < totalSteps && (
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{currentStepData?.title}</span>
                <span>{Math.round(progressPercentage)}% complete</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}

          {/* Steps Overview */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {ONBOARDING_STEPS.slice(0, -1).map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                      index < currentStep
                        ? "bg-green-500 border-green-500 text-white"
                        : index === currentStep
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "border-gray-300 text-gray-400"
                    }`}
                  >
                    {index < currentStep ? (
                      <IoCheckmarkCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  {index < totalSteps - 1 && (
                    <div
                      className={`w-12 h-0.5 mx-2 transition-colors ${
                        index < currentStep ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">
                {currentStepData?.title}
              </CardTitle>
              <p className="text-muted-foreground">
                {currentStepData?.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-6" data-step={currentStep}>
              <CurrentStepComponent />
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0 || isLoading}
              className="flex items-center gap-2"
            >
              <IoArrowBack className="w-4 h-4" />
              Previous
            </Button>

            <Button
              variant="ghost"
              onClick={handleSkipToEnd}
              disabled={isLoading}
              className="text-sm"
            >
              Skip setup
            </Button>

            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {currentStep === ONBOARDING_STEPS.length - 1 ? "Finish" : "Next"}
              <IoArrowForward className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
