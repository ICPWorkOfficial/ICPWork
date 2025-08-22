import { icpAgent } from '@/lib/icpagent';
import { ClientProfile } from '@/types/icp';

export const createClientProfile = async (profile: Omit<ClientProfile, 'userId'> & { userId: string }) => {
  return await icpAgent.createClientProfile(profile);
};

export const updateClientProfile = async (profile: ClientProfile) => {
  return await icpAgent.updateClientProfile(profile);
};

export const getClientProfile = async (userId: string) => {
  return await icpAgent.getClientProfile(userId);
};

export const deleteClientProfile = async (userId: string) => {
  return await icpAgent.deleteClientProfile(userId);
};

export const searchClientsByOrganization = async (orgName: string) => {
  return await icpAgent.searchClientsByOrganization(orgName);
};

export const searchClientsByLocation = async (country: string, state?: string) => {
  return await icpAgent.searchClientsByLocation(country, state);
};

export const searchClientsByDescription = async (keyword: string) => {
  return await icpAgent.searchClientsByDescription(keyword);
};

export const getAllClients = async () => {
  return await icpAgent.getAllClients();
};
