import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

// ===== CANISTER CONFIGURATION =====

export const CANISTER_IDS = {
  main: 'rrkah-fqaaa-aaaaa-aaaaq-cai', // Replace with actual main canister ID
  freelancerData: 'rdmx6-jaaaa-aaaaa-aaadq-cai', // Replace with actual freelancer canister ID
  clientData: 'ryjl3-tyaaa-aaaaa-aaaba-cai', // Replace with actual client canister ID
  escrow: 'r7inp-6aaaa-aaaaa-aaabq-cai', // Replace with actual escrow canister ID
  workStore: 'rdmx6-jaaaa-aaaaa-aaadq-cai', // Replace with actual work store canister ID
} as const;

export const NETWORK = process.env.NODE_ENV === 'production' 
  ? 'https://ic0.app' 
  : 'http://127.0.0.1:4943';

// ===== TYPES FROM BACKEND CANISTERS =====

// Main Canister Types
export type UserType = {
  freelancer: null;
  client: null;
};

export interface User {
  email: string;
  passwordHash: number[]; // Blob as Vec Nat8
  userType: UserType;
}

export type MainError = 
  | { AuthenticationFailed: null }
  | { RegistrationFailed: null }
  | { StorageError: string }
  | { InvalidUserType: null }
  | { EmailRequired: null }
  | { InvalidSession: null }
  | { UserAlreadyExists: null }
  | { UserNotFound: null }
  | { InvalidCredentials: null }
  | { InvalidEmail: null }
  | { WeakPassword: null };

export interface SessionInfo {
  sessionId: string;
  userType: string;
  expiresAt: bigint;
}

export interface AuthResult {
  sessionId: string;
  user: User;
}

// Freelancer Canister Types
export interface Freelancer {
  name: string;
  skills: string[]; // Max 5 skills
  country: string;
  state: string;
  city: string;
  zipCode: string;
  streetAddress: string;
  photo?: string;
  phoneNumber: string;
  linkedinProfile?: string;
}

export type FreelancerError = 
  | { NotFound: null }
  | { InvalidSkillsCount: null }
  | { Unauthorized: null }
  | { InvalidEmail: null };

// Client Canister Types
export interface Client {
  firstName: string;
  lastName: string;
  companyName: string;
  companyWebsite?: string;
  industry: string;
  businessType: string;
  numberOfEmployees: bigint;
  phoneNumber: string;
  description: string;
}

export type ClientError = 
  | { NotFound: null }
  | { AlreadyExists: null }
  | { Unauthorized: null }
  | { InvalidData: null };

// Escrow Canister Types
export type EscrowStatus = 
  | { Pending: null }
  | { Completed: null }
  | { Disputed: null }
  | { Cancelled: null }
  | { Refunded: null };

export interface EscrowAgreement {
  id: bigint;
  buyer: string; // Principal as string
  seller: string; // Principal as string
  arbitrator?: string; // Principal as string
  amount: bigint;
  description: string;
  status: EscrowStatus;
  createdAt: bigint;
  completedAt?: bigint;
  buyerApproved: boolean;
  sellerApproved: boolean;
}

export interface CreateEscrowArgs {
  seller: string; // Principal as string
  arbitrator?: string; // Principal as string
  amount: bigint;
  description: string;
}

// Work Store Canister Types (placeholder)
export interface WorkProject {
  id: bigint;
  title: string;
  description: string;
  clientId: string;
  freelancerId?: string;
  status: 'Open' | 'InProgress' | 'Completed' | 'Cancelled';
  budget: bigint;
  createdAt: bigint;
  deadline?: bigint;
}

// Result type for canister calls
export type Result<T, E> = 
  | { ok: T }
  | { err: E };

// ===== CANISTER INTERFACES =====

// Main Canister Interface
export interface MainCanister {
  // Authentication functions
  signup: (email: string, password: string, userType: string) => Promise<Result<AuthResult, MainError>>;
  login: (email: string, password: string) => Promise<Result<AuthResult, MainError>>;
  registerUser: (userType: string, email: string, password: string) => Promise<Result<null, MainError>>;
  loginUser: (userType: string, email: string, password: string) => Promise<Result<SessionInfo, MainError>>;
  getUserByEmail: (email: string) => Promise<Result<User, MainError>>;
  verifyOTP: (userId: string, otp: string) => Promise<Result<string, MainError>>;
  resendOTP: (userId: string) => Promise<Result<string, MainError>>;
  changePassword: (userId: string, otp: string, newPassword: string) => Promise<Result<string, MainError>>;
  logoutUser: (sessionId: string) => Promise<Result<null, MainError>>;
  validateUserSession: (sessionId: string) => Promise<Result<SessionInfo, MainError>>;
  
  // Freelancer functions
  createFreelancerProfile: (sessionId: string, freelancer: Freelancer) => Promise<Result<null, MainError>>;
  updateFreelancerProfile: (sessionId: string, freelancer: Freelancer) => Promise<Result<null, MainError>>;
  getFreelancerProfile: (sessionId: string) => Promise<Result<Freelancer, MainError>>;
  getAllFreelancers: (sessionId: string) => Promise<Result<[string, Freelancer][], MainError>>;
  
  // Client functions
  createClientProfile: (sessionId: string, client: Client) => Promise<Result<null, MainError>>;
  updateClientProfile: (sessionId: string, client: Client) => Promise<Result<null, MainError>>;
  getClientProfile: (sessionId: string) => Promise<Result<Client, MainError>>;
  getAllClients: (sessionId: string) => Promise<Result<[string, Client][], MainError>>;
  
  // Utility functions
  getActiveSessionCount: () => Promise<bigint>;
}

// Freelancer Canister Interface
export interface FreelancerCanister {
  storeFreelancer: (email: string, freelancer: Freelancer) => Promise<Result<null, FreelancerError>>;
  updateFreelancer: (email: string, freelancer: Freelancer) => Promise<Result<null, FreelancerError>>;
  getFreelancer: (email: string) => Promise<Result<Freelancer, FreelancerError>>;
  deleteFreelancer: (email: string) => Promise<Result<null, FreelancerError>>;
  getAllFreelancers: () => Promise<Result<[string, Freelancer][], FreelancerError>>;
  freelancerExists: (email: string) => Promise<Result<boolean, FreelancerError>>;
  getTotalFreelancers: () => Promise<Result<bigint, FreelancerError>>;
}

// Client Canister Interface
export interface ClientCanister {
  storeClient: (client: Client) => Promise<Result<null, ClientError>>;
  updateClient: (client: Client) => Promise<Result<null, ClientError>>;
  getClient: (principal: string) => Promise<Result<Client, ClientError>>;
  getMyProfile: () => Promise<Result<Client, ClientError>>;
  deleteClient: () => Promise<Result<null, ClientError>>;
  getAllClients: () => Promise<[string, Client][]>; // Query function
}

// Escrow Canister Interface
export interface EscrowCanister {
  deposit: (amount: bigint) => Promise<Result<bigint, string>>;
  withdraw: (amount: bigint) => Promise<Result<bigint, string>>;
  getMyBalance: () => Promise<bigint>;
  createEscrow: (args: CreateEscrowArgs) => Promise<Result<bigint, string>>;
  buyerApprove: (escrowId: bigint) => Promise<Result<string, string>>;
  sellerApprove: (escrowId: bigint) => Promise<Result<string, string>>;
  cancelEscrow: (escrowId: bigint) => Promise<Result<string, string>>;
  raiseDispute: (escrowId: bigint) => Promise<Result<string, string>>;
  resolveDispute: (escrowId: bigint, favorBuyer: boolean) => Promise<Result<string, string>>;
  getEscrow: (escrowId: bigint) => Promise<EscrowAgreement | null>;
  getMyEscrows: () => Promise<EscrowAgreement[]>;
  getArbitrationEscrows: () => Promise<EscrowAgreement[]>;
}

// Work Store Canister Interface (placeholder)
export interface WorkStoreCanister {
  createProject: (project: Omit<WorkProject, 'id' | 'createdAt'>) => Promise<Result<bigint, string>>;
  updateProject: (id: bigint, project: Partial<WorkProject>) => Promise<Result<null, string>>;
  getProject: (id: bigint) => Promise<Result<WorkProject, string>>;
  getAllProjects: () => Promise<Result<WorkProject[], string>>;
  deleteProject: (id: bigint) => Promise<Result<null, string>>;
}

// ===== CONNECTION UTILITIES =====

export const createAgent = () => {
  return new HttpAgent({
    host: NETWORK,
    verifyQuerySignatures: false, // Set to true in production
  });
};

export const getCanisterPrincipal = (canisterId: string): Principal => {
  return Principal.fromText(canisterId);
};

export const createActor = async <T>(
  canisterId: string,
  interfaceFactory: any
): Promise<T> => {
  const agent = createAgent();
  
  // In development, you might need to fetch the root key
  if (process.env.NODE_ENV !== 'production') {
    try {
      await agent.fetchRootKey();
    } catch (error) {
      console.warn('Could not fetch root key:', error);
    }
  }
  
  return Actor.createActor<T>(interfaceFactory, {
    agent,
    canisterId: getCanisterPrincipal(canisterId),
  });
};

// ===== CANISTER CONNECTION CLASSES =====

export class MainCanisterConnection {
  private actor: MainCanister | null = null;

  private async getActor(): Promise<MainCanister> {
    if (!this.actor) {
      // You'll need to import the interface factory from your generated .did.js file
      // this.actor = await createActor<MainCanister>(CANISTER_IDS.main, mainCanisterInterfaceFactory);
      throw new Error('Main canister interface factory not implemented. Generate from .did file.');
    }
    return this.actor;
  }

  // Authentication methods
  async signup(email: string, password: string, userType: 'freelancer' | 'client'): Promise<Result<AuthResult, MainError>> {
    const actor = await this.getActor();
    return await actor.signup(email, password, userType);
  }

  async login(email: string, password: string): Promise<Result<AuthResult, MainError>> {
    const actor = await this.getActor();
    return await actor.login(email, password);
  }

  async registerUser(userType: 'freelancer' | 'client', email: string, password: string): Promise<Result<null, MainError>> {
    const actor = await this.getActor();
    return await actor.registerUser(userType, email, password);
  }

  async loginUser(userType: 'freelancer' | 'client', email: string, password: string): Promise<Result<SessionInfo, MainError>> {
    const actor = await this.getActor();
    return await actor.loginUser(userType, email, password);
  }

  async getUserByEmail(email: string): Promise<Result<User, MainError>> {
    const actor = await this.getActor();
    return await actor.getUserByEmail(email);
  }

  async verifyOTP(userId: string, otp: string): Promise<Result<string, MainError>> {
    const actor = await this.getActor();
    return await actor.verifyOTP(userId, otp);
  }

  async resendOTP(userId: string): Promise<Result<string, MainError>> {
    const actor = await this.getActor();
    return await actor.resendOTP(userId);
  }

  async changePassword(userId: string, otp: string, newPassword: string): Promise<Result<string, MainError>> {
    const actor = await this.getActor();
    return await actor.changePassword(userId, otp, newPassword);
  }

  async logoutUser(sessionId: string): Promise<Result<null, MainError>> {
    const actor = await this.getActor();
    return await actor.logoutUser(sessionId);
  }

  async validateUserSession(sessionId: string): Promise<Result<SessionInfo, MainError>> {
    const actor = await this.getActor();
    return await actor.validateUserSession(sessionId);
  }

  // Freelancer methods
  async createFreelancerProfile(sessionId: string, freelancer: Freelancer): Promise<Result<null, MainError>> {
    const actor = await this.getActor();
    return await actor.createFreelancerProfile(sessionId, freelancer);
  }

  async updateFreelancerProfile(sessionId: string, freelancer: Freelancer): Promise<Result<null, MainError>> {
    const actor = await this.getActor();
    return await actor.updateFreelancerProfile(sessionId, freelancer);
  }

  async getFreelancerProfile(sessionId: string): Promise<Result<Freelancer, MainError>> {
    const actor = await this.getActor();
    return await actor.getFreelancerProfile(sessionId);
  }

  async getAllFreelancers(sessionId: string): Promise<Result<[string, Freelancer][], MainError>> {
    const actor = await this.getActor();
    return await actor.getAllFreelancers(sessionId);
  }

  // Client methods
  async createClientProfile(sessionId: string, client: Client): Promise<Result<null, MainError>> {
    const actor = await this.getActor();
    return await actor.createClientProfile(sessionId, client);
  }

  async updateClientProfile(sessionId: string, client: Client): Promise<Result<null, MainError>> {
    const actor = await this.getActor();
    return await actor.updateClientProfile(sessionId, client);
  }

  async getClientProfile(sessionId: string): Promise<Result<Client, MainError>> {
    const actor = await this.getActor();
    return await actor.getClientProfile(sessionId);
  }

  async getAllClients(sessionId: string): Promise<Result<[string, Client][], MainError>> {
    const actor = await this.getActor();
    return await actor.getAllClients(sessionId);
  }

  // Utility methods
  async getActiveSessionCount(): Promise<bigint> {
    const actor = await this.getActor();
    return await actor.getActiveSessionCount();
  }
}

export class FreelancerCanisterConnection {
  private actor: FreelancerCanister | null = null;

  private async getActor(): Promise<FreelancerCanister> {
    if (!this.actor) {
      // You'll need to import the interface factory from your generated .did.js file
      // this.actor = await createActor<FreelancerCanister>(CANISTER_IDS.freelancerData, freelancerCanisterInterfaceFactory);
      throw new Error('Freelancer canister interface factory not implemented. Generate from .did file.');
    }
    return this.actor;
  }

  async storeFreelancer(email: string, freelancer: Freelancer): Promise<Result<null, FreelancerError>> {
    const actor = await this.getActor();
    return await actor.storeFreelancer(email, freelancer);
  }

  async updateFreelancer(email: string, freelancer: Freelancer): Promise<Result<null, FreelancerError>> {
    const actor = await this.getActor();
    return await actor.updateFreelancer(email, freelancer);
  }

  async getFreelancer(email: string): Promise<Result<Freelancer, FreelancerError>> {
    const actor = await this.getActor();
    return await actor.getFreelancer(email);
  }

  async deleteFreelancer(email: string): Promise<Result<null, FreelancerError>> {
    const actor = await this.getActor();
    return await actor.deleteFreelancer(email);
  }

  async getAllFreelancers(): Promise<Result<[string, Freelancer][], FreelancerError>> {
    const actor = await this.getActor();
    return await actor.getAllFreelancers();
  }

  async freelancerExists(email: string): Promise<Result<boolean, FreelancerError>> {
    const actor = await this.getActor();
    return await actor.freelancerExists(email);
  }

  async getTotalFreelancers(): Promise<Result<bigint, FreelancerError>> {
    const actor = await this.getActor();
    return await actor.getTotalFreelancers();
  }
}

export class ClientCanisterConnection {
  private actor: ClientCanister | null = null;

  private async getActor(): Promise<ClientCanister> {
    if (!this.actor) {
      // You'll need to import the interface factory from your generated .did.js file
      // this.actor = await createActor<ClientCanister>(CANISTER_IDS.clientData, clientCanisterInterfaceFactory);
      throw new Error('Client canister interface factory not implemented. Generate from .did file.');
    }
    return this.actor;
  }

  async storeClient(client: Client): Promise<Result<null, ClientError>> {
    const actor = await this.getActor();
    return await actor.storeClient(client);
  }

  async updateClient(client: Client): Promise<Result<null, ClientError>> {
    const actor = await this.getActor();
    return await actor.updateClient(client);
  }

  async getClient(principal: string): Promise<Result<Client, ClientError>> {
    const actor = await this.getActor();
    return await actor.getClient(principal);
  }

  async getMyProfile(): Promise<Result<Client, ClientError>> {
    const actor = await this.getActor();
    return await actor.getMyProfile();
  }

  async deleteClient(): Promise<Result<null, ClientError>> {
    const actor = await this.getActor();
    return await actor.deleteClient();
  }

  async getAllClients(): Promise<[string, Client][]> {
    const actor = await this.getActor();
    return await actor.getAllClients();
  }
}

export class EscrowCanisterConnection {
  private actor: EscrowCanister | null = null;

  private async getActor(): Promise<EscrowCanister> {
    if (!this.actor) {
      // You'll need to import the interface factory from your generated .did.js file
      // this.actor = await createActor<EscrowCanister>(CANISTER_IDS.escrow, escrowCanisterInterfaceFactory);
      throw new Error('Escrow canister interface factory not implemented. Generate from .did file.');
    }
    return this.actor;
  }

  async deposit(amount: bigint): Promise<Result<bigint, string>> {
    const actor = await this.getActor();
    return await actor.deposit(amount);
  }

  async withdraw(amount: bigint): Promise<Result<bigint, string>> {
    const actor = await this.getActor();
    return await actor.withdraw(amount);
  }

  async getMyBalance(): Promise<bigint> {
    const actor = await this.getActor();
    return await actor.getMyBalance();
  }

  async createEscrow(args: CreateEscrowArgs): Promise<Result<bigint, string>> {
    const actor = await this.getActor();
    return await actor.createEscrow(args);
  }

  async buyerApprove(escrowId: bigint): Promise<Result<string, string>> {
    const actor = await this.getActor();
    return await actor.buyerApprove(escrowId);
  }

  async sellerApprove(escrowId: bigint): Promise<Result<string, string>> {
    const actor = await this.getActor();
    return await actor.sellerApprove(escrowId);
  }

  async cancelEscrow(escrowId: bigint): Promise<Result<string, string>> {
    const actor = await this.getActor();
    return await actor.cancelEscrow(escrowId);
  }

  async raiseDispute(escrowId: bigint): Promise<Result<string, string>> {
    const actor = await this.getActor();
    return await actor.raiseDispute(escrowId);
  }

  async resolveDispute(escrowId: bigint, favorBuyer: boolean): Promise<Result<string, string>> {
    const actor = await this.getActor();
    return await actor.resolveDispute(escrowId, favorBuyer);
  }

  async getEscrow(escrowId: bigint): Promise<EscrowAgreement | null> {
    const actor = await this.getActor();
    return await actor.getEscrow(escrowId);
  }

  async getMyEscrows(): Promise<EscrowAgreement[]> {
    const actor = await this.getActor();
    return await actor.getMyEscrows();
  }

  async getArbitrationEscrows(): Promise<EscrowAgreement[]> {
    const actor = await this.getActor();
    return await actor.getArbitrationEscrows();
  }
}

export class WorkStoreCanisterConnection {
  private actor: WorkStoreCanister | null = null;

  private async getActor(): Promise<WorkStoreCanister> {
    if (!this.actor) {
      // You'll need to import the interface factory from your generated .did.js file
      // this.actor = await createActor<WorkStoreCanister>(CANISTER_IDS.workStore, workStoreCanisterInterfaceFactory);
      throw new Error('Work store canister interface factory not implemented. Generate from .did file.');
    }
    return this.actor;
  }

  async createProject(project: Omit<WorkProject, 'id' | 'createdAt'>): Promise<Result<bigint, string>> {
    const actor = await this.getActor();
    return await actor.createProject(project);
  }

  async updateProject(id: bigint, project: Partial<WorkProject>): Promise<Result<null, string>> {
    const actor = await this.getActor();
    return await actor.updateProject(id, project);
  }

  async getProject(id: bigint): Promise<Result<WorkProject, string>> {
    const actor = await this.getActor();
    return await actor.getProject(id);
  }

  async getAllProjects(): Promise<Result<WorkProject[], string>> {
    const actor = await this.getActor();
    return await actor.getAllProjects();
  }

  async deleteProject(id: bigint): Promise<Result<null, string>> {
    const actor = await this.getActor();
    return await actor.deleteProject(id);
  }
}

// ===== SINGLETON INSTANCES =====

export const mainCanister = new MainCanisterConnection();
export const freelancerCanister = new FreelancerCanisterConnection();
export const clientCanister = new ClientCanisterConnection();
export const escrowCanister = new EscrowCanisterConnection();
export const workStoreCanister = new WorkStoreCanisterConnection();

// ===== DEMO API FUNCTIONS =====

// Demo API for testing all canister connections
export class DemoAPI {
  
  // Authentication Demo
  static async demoAuth() {
    console.log('=== AUTHENTICATION DEMO ===');
    
    try {
      // Demo signup
      const signupResult = await mainCanister.signup('demo@example.com', 'Password123!', 'freelancer');
      console.log('Signup result:', signupResult);
      
      if ('ok' in signupResult) {
        const sessionId = signupResult.ok.sessionId;
        console.log('Session created:', sessionId);
        
        // Demo session validation
        const validationResult = await mainCanister.validateUserSession(sessionId);
        console.log('Session validation:', validationResult);
        
        return { sessionId, user: signupResult.ok.user };
      }
    } catch (error) {
      console.error('Auth demo error:', error);
    }
  }

  // Freelancer Demo
  static async demoFreelancer(sessionId: string) {
    console.log('=== FREELANCER DEMO ===');
    
    const demoFreelancer: Freelancer = {
      name: 'John Doe',
      skills: ['React', 'TypeScript', 'Node.js'],
      country: 'USA',
      state: 'California',
      city: 'San Francisco',
      zipCode: '94102',
      streetAddress: '123 Main St',
      phoneNumber: '+1-555-0123',
      linkedinProfile: 'https://linkedin.com/in/johndoe'
    };

    try {
      // Create freelancer profile
      const createResult = await mainCanister.createFreelancerProfile(sessionId, demoFreelancer);
      console.log('Create freelancer result:', createResult);
      
      // Get freelancer profile
      const getResult = await mainCanister.getFreelancerProfile(sessionId);
      console.log('Get freelancer result:', getResult);
      
      // Get all freelancers
      const allResult = await mainCanister.getAllFreelancers(sessionId);
      console.log('All freelancers result:', allResult);
      
    } catch (error) {
      console.error('Freelancer demo error:', error);
    }
  }

  // Client Demo
  static async demoClient(sessionId: string) {
    console.log('=== CLIENT DEMO ===');
    
    const demoClient: Client = {
      firstName: 'Jane',
      lastName: 'Smith',
      companyName: 'Tech Corp',
      companyWebsite: 'https://techcorp.com',
      industry: 'Technology',
      businessType: 'Corporation',
      numberOfEmployees: BigInt(100),
      phoneNumber: '+1-555-0456',
      description: 'Leading technology company'
    };

    try {
      // Create client profile
      const createResult = await mainCanister.createClientProfile(sessionId, demoClient);
      console.log('Create client result:', createResult);
      
      // Get client profile
      const getResult = await mainCanister.getClientProfile(sessionId);
      console.log('Get client result:', getResult);
      
      // Get all clients
      const allResult = await mainCanister.getAllClients(sessionId);
      console.log('All clients result:', allResult);
      
    } catch (error) {
      console.error('Client demo error:', error);
    }
  }

  // Escrow Demo
  static async demoEscrow() {
    console.log('=== ESCROW DEMO ===');
    
    try {
      // Get balance
      const balance = await escrowCanister.getMyBalance();
      console.log('Current balance:', balance);
      
      // Deposit funds
      const depositResult = await escrowCanister.deposit(BigInt(1000));
      console.log('Deposit result:', depositResult);
      
      if ('ok' in depositResult) {
        // Create escrow
        const escrowArgs: CreateEscrowArgs = {
          seller: 'demo-seller-principal',
          amount: BigInt(500),
          description: 'Demo project payment'
        };
        
        const createResult = await escrowCanister.createEscrow(escrowArgs);
        console.log('Create escrow result:', createResult);
        
        if ('ok' in createResult) {
          const escrowId = createResult.ok;
          
          // Get escrow details
          const escrowDetails = await escrowCanister.getEscrow(escrowId);
          console.log('Escrow details:', escrowDetails);
          
          // Get my escrows
          const myEscrows = await escrowCanister.getMyEscrows();
          console.log('My escrows:', myEscrows);
        }
      }
      
    } catch (error) {
      console.error('Escrow demo error:', error);
    }
  }

  // Work Store Demo
  static async demoWorkStore() {
    console.log('=== WORK STORE DEMO ===');
    
    const demoProject: Omit<WorkProject, 'id' | 'createdAt'> = {
      title: 'Demo Project',
      description: 'A demo project for testing',
      clientId: 'demo-client-id',
      status: 'Open',
      budget: BigInt(1000),
      deadline: BigInt(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    };

    try {
      // Create project
      const createResult = await workStoreCanister.createProject(demoProject);
      console.log('Create project result:', createResult);
      
      if ('ok' in createResult) {
        const projectId = createResult.ok;
        
        // Get project
        const getResult = await workStoreCanister.getProject(projectId);
        console.log('Get project result:', getResult);
        
        // Get all projects
        const allResult = await workStoreCanister.getAllProjects();
        console.log('All projects result:', allResult);
      }
      
    } catch (error) {
      console.error('Work store demo error:', error);
    }
  }

  // Run all demos
  static async runAllDemos() {
    console.log('🚀 Starting ICP Canister Demos...');
    
    try {
      // Auth demo
      const authResult = await this.demoAuth();
      
      if (authResult) {
        const { sessionId } = authResult;
        
        // Freelancer demo
        await this.demoFreelancer(sessionId);
        
        // Client demo
        await this.demoClient(sessionId);
      }
      
      // Escrow demo
      await this.demoEscrow();
      
      // Work store demo
      await this.demoWorkStore();
      
      console.log('✅ All demos completed successfully!');
      
    } catch (error) {
      console.error('❌ Demo failed:', error);
    }
  }
}

// Export demo API for easy access
export const demoAPI = DemoAPI;
