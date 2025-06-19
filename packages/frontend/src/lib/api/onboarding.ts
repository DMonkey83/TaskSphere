import { AxiosError } from "axios";
import { z } from "zod";

import type { OnboardingData } from "@/store/onboarding-store";

import {
  OnboardingDraftResponseSchema,
  OnboardingStatusSchema,
  OnboardingStatsSchema,
  type OnboardingDraftResponse,
  type OnboardingStatus,
  type OnboardingStats,
} from "@shared/dto/onboarding.dto";

import clientApi from "../axios";

export interface UpdateOnboardingDraftRequest {
  step?: number;
  completed?: boolean;
  data?: OnboardingData;
}

// Get current user's onboarding draft
export const getDraft = async (): Promise<OnboardingDraftResponse> => {
  try {
    const response = await clientApi.get("/api/onboarding/draft", {
      withCredentials: true,
    });
    console.log("Onboarding draft response:", response.data);
    return OnboardingDraftResponseSchema.parse(response.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        "Validation error for /api/onboarding/draft:",
        error.errors
      );
      throw new Error("Invalid data structure received from server");
    }
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data ?? {
      message: "Failed to get onboarding draft",
    };
    throw new Error(JSON.stringify(errorData));
  }
};

// Create new onboarding draft
export const createDraft = async (): Promise<OnboardingDraftResponse> => {
  try {
    const response = await clientApi.post(
      "/api/onboarding/draft",
      {},
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
    console.log("Created onboarding draft:", response.data);
    return OnboardingDraftResponseSchema.parse(response.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        "Validation error for /api/onboarding/draft creation:",
        error.errors
      );
      throw new Error("Invalid data structure received from server");
    }
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data ?? {
      message: "Failed to create onboarding draft",
    };
    throw new Error(JSON.stringify(errorData));
  }
};

// Update onboarding draft
export const updateDraft = async (
  data: UpdateOnboardingDraftRequest
): Promise<OnboardingDraftResponse> => {
  try {
    const response = await clientApi.put("/api/onboarding/draft", data, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });
    console.log("Updated onboarding draft:", response.data);
    return OnboardingDraftResponseSchema.parse(response.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        "Validation error for /api/onboarding/draft update:",
        error.errors
      );
      throw new Error("Invalid data structure received from server");
    }
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data ?? {
      message: "Failed to update onboarding draft",
    };
    throw new Error(JSON.stringify(errorData));
  }
};

// Complete onboarding
export const completeDraft = async (): Promise<OnboardingDraftResponse> => {
  try {
    const response = await clientApi.post(
      "/api/onboarding/complete",
      {},
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
    console.log("Completed onboarding:", response.data);
    return OnboardingDraftResponseSchema.parse(response.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        "Validation error for /api/onboarding/complete:",
        error.errors
      );
      throw new Error("Invalid data structure received from server");
    }
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data ?? {
      message: "Failed to complete onboarding",
    };
    throw new Error(JSON.stringify(errorData));
  }
};

// Delete onboarding draft
export const deleteDraft = async (): Promise<void> => {
  try {
    await clientApi.delete("/api/onboarding/draft", {
      withCredentials: true,
    });
    console.log("Deleted onboarding draft");
  } catch (error) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data ?? {
      message: "Failed to delete onboarding draft",
    };
    throw new Error(JSON.stringify(errorData));
  }
};

// Get onboarding status (for checking if user needs onboarding)
export const getOnboardingStatus = async (): Promise<OnboardingStatus> => {
  try {
    const response = await clientApi.get("/api/onboarding/status", {
      withCredentials: true,
    });
    console.log("Onboarding status:", response.data);
    return OnboardingStatusSchema.parse(response.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        "Validation error for /api/onboarding/status:",
        error.errors
      );
      throw new Error("Invalid data structure received from server");
    }
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data ?? {
      message: "Failed to get onboarding status",
    };
    throw new Error(JSON.stringify(errorData));
  }
};

// Get onboarding stats (for admin/account owners)
export const getOnboardingStats = async (): Promise<OnboardingStats> => {
  try {
    const response = await clientApi.get("/api/onboarding/stats", {
      withCredentials: true,
    });
    console.log("Onboarding stats:", response.data);
    return OnboardingStatsSchema.parse(response.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        "Validation error for /api/onboarding/stats:",
        error.errors
      );
      throw new Error("Invalid data structure received from server");
    }
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data ?? {
      message: "Failed to get onboarding stats",
    };
    throw new Error(JSON.stringify(errorData));
  }
};
