import { 
  mainCanister, 
  freelancerCanister, 
  clientCanister, 
  escrowCanister, 
  workStoreCanister,
  type Freelancer,
  type Client,
  type CreateEscrowArgs,
  type WorkProject
} from './canister-connections';

// ===== AUTHENTICATION SERVICE =====

export class AuthService {
  static async signup(email: string, password: string, userType: 'freelancer' | 'client') {
    return await mainCanister.signup(email, password, userType);
  }

  static async login(email: string, password: string) {
    return await mainCanister.login(email, password);
  }

  static async logout(sessionId: string) {
    return await mainCanister.logoutUser(sessionId);
  }

  static async validateSession(sessionId: string) {
    return await mainCanister.validateUserSession(sessionId);
  }

  static async getUserByEmail(email: string) {
    return await mainCanister.getUserByEmail(email);
  }

  static async verifyOTP(userId: string, otp: string) {
    return await mainCanister.verifyOTP(userId, otp);
  }

  static async resendOTP(userId: string) {
    return await mainCanister.resendOTP(userId);
  }

  static async changePassword(userId: string, otp: string, newPassword: string) {
    return await mainCanister.changePassword(userId, otp, newPassword);
  }
}

// ===== FREELANCER SERVICE =====

export class FreelancerService {
  static async createProfile(sessionId: string, freelancer: Freelancer) {
    return await mainCanister.createFreelancerProfile(sessionId, freelancer);
  }

  static async updateProfile(sessionId: string, freelancer: Freelancer) {
    return await mainCanister.updateFreelancerProfile(sessionId, freelancer);
  }

  static async getProfile(sessionId: string) {
    return await mainCanister.getFreelancerProfile(sessionId);
  }

  static async getAllFreelancers(sessionId: string) {
    return await mainCanister.getAllFreelancers(sessionId);
  }

  // Direct canister methods (for admin use)
  static async storeFreelancer(email: string, freelancer: Freelancer) {
    return await freelancerCanister.storeFreelancer(email, freelancer);
  }

  static async updateFreelancer(email: string, freelancer: Freelancer) {
    return await freelancerCanister.updateFreelancer(email, freelancer);
  }

  static async getFreelancer(email: string) {
    return await freelancerCanister.getFreelancer(email);
  }

  static async deleteFreelancer(email: string) {
    return await freelancerCanister.deleteFreelancer(email);
  }

  static async freelancerExists(email: string) {
    return await freelancerCanister.freelancerExists(email);
  }

  static async getTotalFreelancers() {
    return await freelancerCanister.getTotalFreelancers();
  }
}

// ===== CLIENT SERVICE =====

export class ClientService {
  static async createProfile(sessionId: string, client: Client) {
    return await mainCanister.createClientProfile(sessionId, client);
  }

  static async updateProfile(sessionId: string, client: Client) {
    return await mainCanister.updateClientProfile(sessionId, client);
  }

  static async getProfile(sessionId: string) {
    return await mainCanister.getClientProfile(sessionId);
  }

  static async getAllClients(sessionId: string) {
    return await mainCanister.getAllClients(sessionId);
  }

  // Direct canister methods
  static async storeClient(client: Client) {
    return await clientCanister.storeClient(client);
  }

  static async updateClient(client: Client) {
    return await clientCanister.updateClient(client);
  }

  static async getClient(principal: string) {
    return await clientCanister.getClient(principal);
  }

  static async getMyProfile() {
    return await clientCanister.getMyProfile();
  }

  static async deleteClient() {
    return await clientCanister.deleteClient();
  }

  static async getAllClientsDirect() {
    return await clientCanister.getAllClients();
  }
}

// ===== ESCROW SERVICE =====

export class EscrowService {
  static async deposit(amount: bigint) {
    return await escrowCanister.deposit(amount);
  }

  static async withdraw(amount: bigint) {
    return await escrowCanister.withdraw(amount);
  }

  static async getBalance() {
    return await escrowCanister.getMyBalance();
  }

  static async createEscrow(args: CreateEscrowArgs) {
    return await escrowCanister.createEscrow(args);
  }

  static async buyerApprove(escrowId: bigint) {
    return await escrowCanister.buyerApprove(escrowId);
  }

  static async sellerApprove(escrowId: bigint) {
    return await escrowCanister.sellerApprove(escrowId);
  }

  static async cancelEscrow(escrowId: bigint) {
    return await escrowCanister.cancelEscrow(escrowId);
  }

  static async raiseDispute(escrowId: bigint) {
    return await escrowCanister.raiseDispute(escrowId);
  }

  static async resolveDispute(escrowId: bigint, favorBuyer: boolean) {
    return await escrowCanister.resolveDispute(escrowId, favorBuyer);
  }

  static async getEscrow(escrowId: bigint) {
    return await escrowCanister.getEscrow(escrowId);
  }

  static async getMyEscrows() {
    return await escrowCanister.getMyEscrows();
  }

  static async getArbitrationEscrows() {
    return await escrowCanister.getArbitrationEscrows();
  }
}

// ===== WORK STORE SERVICE =====

export class WorkStoreService {
  static async createProject(project: Omit<WorkProject, 'id' | 'createdAt'>) {
    return await workStoreCanister.createProject(project);
  }

  static async updateProject(id: bigint, project: Partial<WorkProject>) {
    return await workStoreCanister.updateProject(id, project);
  }

  static async getProject(id: bigint) {
    return await workStoreCanister.getProject(id);
  }

  static async getAllProjects() {
    return await workStoreCanister.getAllProjects();
  }

  static async deleteProject(id: bigint) {
    return await workStoreCanister.deleteProject(id);
  }
}

// ===== UTILITY FUNCTIONS =====

export class UtilityService {
  static async getActiveSessionCount() {
    return await mainCanister.getActiveSessionCount();
  }

  // Helper function to convert bigint to number for display
  static bigintToNumber(value: bigint): number {
    return Number(value);
  }

  // Helper function to convert number to bigint for canister calls
  static numberToBigint(value: number): bigint {
    return BigInt(value);
  }

  // Helper function to format currency
  static formatCurrency(amount: bigint, currency: string = 'ICP'): string {
    const num = Number(amount);
    return `${num.toLocaleString()} ${currency}`;
  }

  // Helper function to format date
  static formatDate(timestamp: bigint): string {
    const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
    return date.toLocaleDateString();
  }

  // Helper function to check if result is success
  static isSuccess<T, E>(result: { ok: T } | { err: E }): result is { ok: T } {
    return 'ok' in result;
  }

  // Helper function to check if result is error
  static isError<T, E>(result: { ok: T } | { err: E }): result is { err: E } {
    return 'err' in result;
  }

  // Helper function to extract error message
  static getErrorMessage(error: any): string {
    if (typeof error === 'object' && error !== null) {
      const keys = Object.keys(error);
      if (keys.length > 0) {
        return keys[0];
      }
    }
    return String(error);
  }
}

// ===== COMBINED SERVICE =====

export class ICPWorkService {
  static auth = AuthService;
  static freelancer = FreelancerService;
  static client = ClientService;
  static escrow = EscrowService;
  static workStore = WorkStoreService;
  static utils = UtilityService;
}

// Export individual services for convenience
export {
  AuthService,
  FreelancerService,
  ClientService,
  EscrowService,
  WorkStoreService,
  UtilityService
};

// Export the main service
export default ICPWorkService;
