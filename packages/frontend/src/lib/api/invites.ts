import { RegisterInput, RegisterResponse } from "@shared/dto/auth.dto";

import clientApi from "../axios";

export interface InviteDetails {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  accounts: {
    id: string;
    name: string;
  };
  token: string;
  status: string;
}

export interface AcceptInviteData extends RegisterInput {
  inviteToken: string;
}

export const validateInvite = async (token: string): Promise<InviteDetails> => {
  const response = await clientApi.get(`/api/account-invites/validate/${token}`);
  return response.data;
};

export const acceptInvite = async (inviteId: string): Promise<InviteDetails> => {
  const response = await clientApi.post(`/api/account-invites/${inviteId}/accept`);
  return response.data;
};

export const registerWithInvite = async (data: AcceptInviteData): Promise<RegisterResponse> => {
  // First register the user, then accept the invite
  const response = await clientApi.post('/api/auth/register', {
    ...data,
    accountName: undefined, // Remove accountName for invite-based registration
  });
  
  // If registration is successful, accept the invite
  if (response.data && data.inviteToken) {
    try {
      // Get invite details to get the ID
      const inviteDetails = await validateInvite(data.inviteToken);
      await acceptInvite(inviteDetails.id);
    } catch (error) {
      console.warn('Failed to accept invite after registration:', error);
    }
  }
  
  return response.data;
};

// Invite management API functions
export const createInvite = async (data: { email: string; role: string }) => {
  const response = await clientApi.post('/api/account-invites/invite', data);
  return response.data;
};

export const bulkCreateInvites = async (data: { invites: Array<{ email: string; role: string }> }) => {
  const response = await clientApi.post('/api/account-invites/bulk', data);
  return response.data;
};

export const getInvites = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  email?: string;
}) => {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.status) searchParams.append('status', params.status);
  if (params.email) searchParams.append('email', params.email);
  
  const response = await clientApi.get(`/api/account-invites?${searchParams.toString()}`);
  return response.data;
};

export const resendInvite = async (inviteId: string) => {
  const response = await clientApi.post(`/api/account-invites/${inviteId}/resend`);
  return response.data;
};

export const revokeInvite = async (inviteId: string) => {
  const response = await clientApi.delete(`/api/account-invites/${inviteId}`);
  return response.data;
};