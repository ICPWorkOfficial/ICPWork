import { ClientProfile, FreelancerProfile, UserType } from '@/types/icp';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

// IDL Factory types (you'll need to generate these from your .did files)
const authIdl = ({ IDL }: any) => {
  const UserType = IDL.Variant({ 'FREELANCER': IDL.Null, 'CLIENT': IDL.Null });
  const AuthUser = IDL.Record({
    'id': IDL.Text,
    'email': IDL.Text,
    'username': IDL.Text,
    'passwordHash': IDL.Text,
    'userType': UserType,
    'isVerified': IDL.Bool,
    'otp': IDL.Opt(IDL.Text),
    'otpExpiry': IDL.Opt(IDL.Int),
  });
  const AuthRequest = IDL.Record({
    'email': IDL.Text,
    'password': IDL.Text,
  });
  const OTPRequest = IDL.Record({
    'userId': IDL.Text,
    'otp': IDL.Text,
  });
  const PasswordChangeRequest = IDL.Record({
    'userId': IDL.Text,
    'otp': IDL.Text,
    'newPassword': IDL.Text,
  });
  const AuthResult = IDL.Variant({ 'ok': AuthUser, 'err': IDL.Text });
  const GenericResult = IDL.Variant({ 'ok': IDL.Text, 'err': IDL.Text });

  return IDL.Service({
    'register': IDL.Func([IDL.Text, IDL.Text, IDL.Text, UserType], [AuthResult], []),
    'login': IDL.Func([AuthRequest], [AuthResult], []),
    'verifyOTP': IDL.Func([OTPRequest], [GenericResult], []),
    'resendOTP': IDL.Func([IDL.Text], [GenericResult], []),
    'changePassword': IDL.Func([PasswordChangeRequest], [GenericResult], []),
    'getUser': IDL.Func([IDL.Text], [IDL.Opt(AuthUser)], ['query']),
    'getUserByEmail': IDL.Func([IDL.Text], [IDL.Opt(AuthUser)], ['query']),
  });
};

const freelancerIdl = ({ IDL }: any) => {
  const Address = IDL.Record({
    'country': IDL.Text,
    'state': IDL.Text,
    'city': IDL.Text,
    'localAddress': IDL.Text,
  });
  const FreelancerProfile = IDL.Record({
    'userId': IDL.Text,
    'firstName': IDL.Text,
    'lastName': IDL.Text,
    'profilePhotoUrl': IDL.Text,
    'resumeUrl': IDL.Text,
    'skills': IDL.Vec(IDL.Text),
    'address': Address,
  });
  const ProfileResult = IDL.Variant({ 'ok': FreelancerProfile, 'err': IDL.Text });
  const GenericResult = IDL.Variant({ 'ok': IDL.Text, 'err': IDL.Text });

  return IDL.Service({
    'createProfile': IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Vec(IDL.Text), Address], [ProfileResult], []),
    'updateProfile': IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Vec(IDL.Text), Address], [ProfileResult], []),
    'getProfile': IDL.Func([IDL.Text], [IDL.Opt(FreelancerProfile)], ['query']),
    'deleteProfile': IDL.Func([IDL.Text], [GenericResult], []),
    'searchBySkill': IDL.Func([IDL.Text], [IDL.Vec(FreelancerProfile)], ['query']),
    'searchByLocation': IDL.Func([IDL.Text, IDL.Opt(IDL.Text)], [IDL.Vec(FreelancerProfile)], ['query']),
    'getAllProfiles': IDL.Func([], [IDL.Vec(FreelancerProfile)], ['query']),
  });
};

const clientIdl = ({ IDL }: any) => {
  const Address = IDL.Record({
    'country': IDL.Text,
    'state': IDL.Text,
    'city': IDL.Text,
    'localAddress': IDL.Text,
  });
  const ClientProfile = IDL.Record({
    'userId': IDL.Text,
    'organizationName': IDL.Text,
    'website': IDL.Text,
    'firstName': IDL.Text,
    'lastName': IDL.Text,
    'address': Address,
    'phoneNumber': IDL.Text,
    'description': IDL.Text,
  });
  const ProfileResult = IDL.Variant({ 'ok': ClientProfile, 'err': IDL.Text });
  const GenericResult = IDL.Variant({ 'ok': IDL.Text, 'err': IDL.Text });

  return IDL.Service({
    'createProfile': IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, Address, IDL.Text, IDL.Text], [ProfileResult], []),
    'updateProfile': IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, Address, IDL.Text, IDL.Text], [ProfileResult], []),
    'getProfile': IDL.Func([IDL.Text], [IDL.Opt(ClientProfile)], ['query']),
    'deleteProfile': IDL.Func([IDL.Text], [GenericResult], []),
    'searchByOrganization': IDL.Func([IDL.Text], [IDL.Vec(ClientProfile)], ['query']),
    'searchByLocation': IDL.Func([IDL.Text, IDL.Opt(IDL.Text)], [IDL.Vec(ClientProfile)], ['query']),
    'searchByDescription': IDL.Func([IDL.Text], [IDL.Vec(ClientProfile)], ['query']),
    'getAllProfiles': IDL.Func([], [IDL.Vec(ClientProfile)], ['query']),
  });
};

class ICPAgent {
  private agent: HttpAgent;
  private authActor: any;
  private freelancerActor: any;
  private clientActor: any;

  constructor() {
    this.agent = new HttpAgent({
      host: process.env.NEXT_PUBLIC_IC_HOST || 'https://ic0.app',
    });

    // In development, fetch root key
    if (process.env.NODE_ENV === 'development') {
      this.agent.fetchRootKey();
    }

    // Replace with your actual canister IDs
    this.authActor = Actor.createActor(authIdl, {
      agent: this.agent,
      canisterId: process.env.NEXT_PUBLIC_AUTH_CANISTER_ID!,
    });

    this.freelancerActor = Actor.createActor(freelancerIdl, {
      agent: this.agent,
      canisterId: process.env.NEXT_PUBLIC_FREELANCER_CANISTER_ID!,
    });

    this.clientActor = Actor.createActor(clientIdl, {
      agent: this.agent,
      canisterId: process.env.NEXT_PUBLIC_CLIENT_CANISTER_ID!,
    });
  }

  // Auth methods
  async register(email: string, username: string, password: string, userType: UserType) {
    const type = userType === 'FREELANCER' ? { 'FREELANCER': null } : { 'CLIENT': null };
    return await this.authActor.register(email, username, password, type);
  }

  async login(email: string, password: string) {
    return await this.authActor.login({ email, password });
  }

  async verifyOTP(userId: string, otp: string) {
    return await this.authActor.verifyOTP({ userId, otp });
  }

  async resendOTP(userId: string) {
    return await this.authActor.resendOTP(userId);
  }

  async changePassword(userId: string, otp: string, newPassword: string) {
    return await this.authActor.changePassword({ userId, otp, newPassword });
  }

  async getUser(userId: string) {
    return await this.authActor.getUser(userId);
  }

  async getUserByEmail(email: string) {
    return await this.authActor.getUserByEmail(email);
  }

  // Freelancer methods
  async createFreelancerProfile(profile: Omit<FreelancerProfile, 'userId'> & { userId: string }) {
    const { userId, firstName, lastName, profilePhotoUrl, resumeUrl, skills, address } = profile;
    return await this.freelancerActor.createProfile(userId, firstName, lastName, profilePhotoUrl, resumeUrl, skills, address);
  }

  async updateFreelancerProfile(profile: FreelancerProfile) {
    const { userId, firstName, lastName, profilePhotoUrl, resumeUrl, skills, address } = profile;
    return await this.freelancerActor.updateProfile(userId, firstName, lastName, profilePhotoUrl, resumeUrl, skills, address);
  }

  async getFreelancerProfile(userId: string) {
    return await this.freelancerActor.getProfile(userId);
  }

  async deleteFreelancerProfile(userId: string) {
    return await this.freelancerActor.deleteProfile(userId);
  }

  async searchFreelancersBySkill(skill: string) {
    return await this.freelancerActor.searchBySkill(skill);
  }

  async searchFreelancersByLocation(country: string, state?: string) {
    return await this.freelancerActor.searchByLocation(country, state ? [state] : []);
  }

  async getAllFreelancers() {
    return await this.freelancerActor.getAllProfiles();
  }

  // Client methods
  async createClientProfile(profile: Omit<ClientProfile, 'userId'> & { userId: string }) {
    const { userId, organizationName, website, firstName, lastName, address, phoneNumber, description } = profile;
    return await this.clientActor.createProfile(userId, organizationName, website, firstName, lastName, address, phoneNumber, description);
  }

  async updateClientProfile(profile: ClientProfile) {
    const { userId, organizationName, website, firstName, lastName, address, phoneNumber, description } = profile;
    return await this.clientActor.updateProfile(userId, organizationName, website, firstName, lastName, address, phoneNumber, description);
  }

  async getClientProfile(userId: string) {
    return await this.clientActor.getProfile(userId);
  }

  async deleteClientProfile(userId: string) {
    return await this.clientActor.deleteProfile(userId);
  }

  async searchClientsByOrganization(orgName: string) {
    return await this.clientActor.searchByOrganization(orgName);
  }

  async searchClientsByLocation(country: string, state?: string) {
    return await this.clientActor.searchByLocation(country, state ? [state] : []);
  }

  async searchClientsByDescription(keyword: string) {
    return await this.clientActor.searchByDescription(keyword);
  }

  async getAllClients() {
    return await this.clientActor.getAllProfiles();
  }
}

export const icpAgent = new ICPAgent();
