import { icpAgent } from '@/lib/icpagent';
import { EscrowAgreement, CreateEscrowArgs, EscrowStatus } from '@/types/icp';

// ===== ESCROW API FUNCTIONS =====

// Balance Management
export const depositToEscrow = async (sessionId: string, amount: number) => {
  return await icpAgent.depositToEscrow(sessionId, amount);
};

export const withdrawFromEscrow = async (sessionId: string, amount: number) => {
  return await icpAgent.withdrawFromEscrow(sessionId, amount);
};

export const getEscrowBalance = async (sessionId: string) => {
  return await icpAgent.getEscrowBalance(sessionId);
};

// Escrow Management
export const createEscrow = async (sessionId: string, args: CreateEscrowArgs) => {
  return await icpAgent.createEscrow(sessionId, args);
};

export const getEscrow = async (sessionId: string, escrowId: number) => {
  return await icpAgent.getEscrow(sessionId, escrowId);
};

export const getMyEscrows = async (sessionId: string) => {
  return await icpAgent.getMyEscrows(sessionId);
};

export const getEscrowsByService = async (sessionId: string, serviceId: string) => {
  return await icpAgent.getEscrowsByService(sessionId, serviceId);
};

// Escrow Actions
export const buyerApproveEscrow = async (sessionId: string, escrowId: number) => {
  return await icpAgent.buyerApproveEscrow(sessionId, escrowId);
};

export const sellerApproveEscrow = async (sessionId: string, escrowId: number) => {
  return await icpAgent.sellerApproveEscrow(sessionId, escrowId);
};

export const cancelEscrow = async (sessionId: string, escrowId: number) => {
  return await icpAgent.cancelEscrow(sessionId, escrowId);
};

// Dispute Management
export const raiseEscrowDispute = async (sessionId: string, escrowId: number) => {
  return await icpAgent.raiseEscrowDispute(sessionId, escrowId);
};

export const raiseClientDispute = async (sessionId: string, escrowId: number, reason: string) => {
  return await icpAgent.raiseClientDispute(sessionId, escrowId, reason);
};

export const raiseFreelancerDispute = async (sessionId: string, escrowId: number, reason: string) => {
  return await icpAgent.raiseFreelancerDispute(sessionId, escrowId, reason);
};

export const resolveEscrowDispute = async (sessionId: string, escrowId: number, favorBuyer: boolean) => {
  return await icpAgent.resolveEscrowDispute(sessionId, escrowId, favorBuyer);
};

// Arbitration
export const getArbitrationEscrows = async (sessionId: string) => {
  return await icpAgent.getArbitrationEscrows(sessionId);
};

// Admin Functions
export const getPlatformFeeBalance = async (sessionId: string) => {
  return await icpAgent.getPlatformFeeBalance(sessionId);
};

export const getPlatformFeeStats = async (sessionId: string) => {
  return await icpAgent.getPlatformFeeStats(sessionId);
};

export const checkOverdueProjects = async (sessionId: string) => {
  return await icpAgent.checkOverdueProjects(sessionId);
};

// ===== UTILITY FUNCTIONS =====

// Convert escrow status to human-readable string
export const getEscrowStatusText = (status: EscrowStatus): string => {
  if ('Pending' in status) return 'Pending';
  if ('Completed' in status) return 'Completed';
  if ('Disputed' in status) return 'Disputed';
  if ('Cancelled' in status) return 'Cancelled';
  if ('Refunded' in status) return 'Refunded';
  return 'Unknown';
};

// Check if escrow can be approved by buyer
export const canBuyerApprove = (escrow: EscrowAgreement): boolean => {
  return escrow.status.Pending !== undefined && !escrow.buyerApproved;
};

// Check if escrow can be approved by seller
export const canSellerApprove = (escrow: EscrowAgreement): boolean => {
  return escrow.status.Pending !== undefined && !escrow.sellerApproved;
};

// Check if escrow can be cancelled
export const canCancelEscrow = (escrow: EscrowAgreement): boolean => {
  return escrow.status.Pending !== undefined;
};

// Check if escrow can be disputed
export const canDisputeEscrow = (escrow: EscrowAgreement): boolean => {
  return escrow.status.Pending !== undefined;
};

// Format balance for display
export const formatBalance = (balance: number): string => {
  return (balance / 100000000).toFixed(8) + ' ICP'; // Assuming 8 decimal places
};

// Calculate platform fee (5%)
export const calculatePlatformFee = (amount: number): number => {
  return Math.floor(amount * 0.05);
};

// Calculate net amount after platform fee
export const calculateNetAmount = (amount: number): number => {
  return amount - calculatePlatformFee(amount);
};
