import { icpAgent } from '@/lib/icpagent';
import { FreelancerProfile } from '@/types/icp';

export const createFreelancerProfile = async (profile: Omit<FreelancerProfile, 'userId'> & { userId: string }) => {
  return await icpAgent.createFreelancerProfile(profile);
};

export const updateFreelancerProfile = async (profile: FreelancerProfile) => {
  return await icpAgent.updateFreelancerProfile(profile);
};

export const getFreelancerProfile = async (userId: string) => {
  return await icpAgent.getFreelancerProfile(userId);
};

export const deleteFreelancerProfile = async (userId: string) => {
  return await icpAgent.deleteFreelancerProfile(userId);
};

export const searchFreelancersBySkill = async (skill: string) => {
  return await icpAgent.searchFreelancersBySkill(skill);
};

export const searchFreelancersByLocation = async (country: string, state?: string) => {
  return await icpAgent.searchFreelancersByLocation(country, state);
};

export const getAllFreelancers = async () => {
  return await icpAgent.getAllFreelancers();
};
