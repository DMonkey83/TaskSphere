import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

import {
  validateInvite,
  registerWithInvite,
  AcceptInviteData,
  createInvite,
  bulkCreateInvites,
  getInvites,
  resendInvite,
  revokeInvite,
} from "../api/invites";

// Invite acceptance hooks
export const useValidateInvite = (token: string | null) => {
  return useQuery({
    queryKey: ["invite", token],
    queryFn: () => validateInvite(token!),
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRegisterWithInvite = () => {
  return useMutation({
    mutationFn: (data: AcceptInviteData) => registerWithInvite(data),
    onSuccess: () => {
      toast.success("Account created successfully! Please log in.");
    },
    onError: (error) => {
      const axiosError = (error as AxiosError)?.response?.data as { message?: string };
      toast.error(
        axiosError?.message || "Failed to accept invitation. Please try again."
      );
    },
  });
};

// Invite management hooks
export const useCreateInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; role: string }) => createInvite(data),
    onSuccess: () => {
      toast.success("Invitation sent successfully!");
      queryClient.invalidateQueries({ queryKey: ["invites"] });
    },
    onError: (error) => {
      const axiosError = (error as AxiosError)?.response?.data as { message?: string };
      toast.error(
        axiosError?.message || "Failed to send invitation. Please try again."
      );
    },
  });
};

export const useBulkCreateInvites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { invites: Array<{ email: string; role: string }> }) =>
      bulkCreateInvites(data),
    onSuccess: (data) => {
      const successful = data.successful?.length || 0;
      const failed = data.failed?.length || 0;

      if (failed > 0) {
        toast.warning(`${successful} invitations sent, ${failed} failed`);
      } else {
        toast.success(`${successful} invitations sent successfully!`);
      }

      queryClient.invalidateQueries({ queryKey: ["invites"] });
    },
    onError: (error) => {
      const axiosError = (error as AxiosError)?.response?.data as { message?: string };
      toast.error(
        axiosError?.message || "Failed to send bulk invitations. Please try again."
      );
    },
  });
};

export const useGetInvites = (params: {
  page?: number;
  limit?: number;
  status?: string;
  email?: string;
}) => {
  return useQuery({
    queryKey: ["invites", params],
    queryFn: () => getInvites(params),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useResendInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: string) => resendInvite(inviteId),
    onSuccess: () => {
      toast.success("Invitation resent successfully!");
      queryClient.invalidateQueries({ queryKey: ["invites"] });
    },
    onError: (error) => {
      const axiosError = (error as AxiosError)?.response?.data as { message?: string };
      toast.error(
        axiosError?.message || "Failed to resend invitation. Please try again."
      );
    },
  });
};

export const useRevokeInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: string) => revokeInvite(inviteId),
    onSuccess: () => {
      toast.success("Invitation revoked successfully!");
      queryClient.invalidateQueries({ queryKey: ["invites"] });
    },
    onError: (error) => {
      const axiosError = (error as AxiosError)?.response?.data as { message?: string };
      toast.error(
        axiosError?.message || "Failed to revoke invitation. Please try again."
      );
    },
  });
};
