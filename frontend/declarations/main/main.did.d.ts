import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Client {
  'numberOfEmployees' : bigint,
  'businessType' : string,
  'description' : string,
  'companyName' : string,
  'companyWebsite' : [] | [string],
  'phoneNumber' : string,
  'lastName' : string,
  'industry' : string,
  'firstName' : string,
}
export type Error = { 'EmailRequired' : null } |
  { 'RegistrationFailed' : null } |
  { 'InvalidUserType' : null } |
  { 'StorageError' : string } |
  { 'AuthenticationFailed' : null } |
  { 'InvalidSession' : null };
export interface Freelancer {
  'country' : string,
  'city' : string,
  'name' : string,
  'zipCode' : string,
  'state' : string,
  'photo' : [] | [string],
  'phoneNumber' : string,
  'skills' : Array<string>,
  'streetAddress' : string,
  'linkedinProfile' : [] | [string],
}
export type Result = { 'ok' : SessionInfo } |
  { 'err' : Error };
export type Result_1 = { 'ok' : null } |
  { 'err' : Error };
export type Result_2 = { 'ok' : Freelancer } |
  { 'err' : Error };
export type Result_3 = { 'ok' : Client } |
  { 'err' : Error };
export type Result_4 = { 'ok' : Array<[string, Freelancer]> } |
  { 'err' : Error };
export type Result_5 = { 'ok' : Array<[string, Client]> } |
  { 'err' : Error };
export interface SessionInfo {
  'userType' : string,
  'expiresAt' : bigint,
  'sessionId' : string,
}
export interface _SERVICE {
  'createClientProfile' : ActorMethod<[string, Client], Result_1>,
  'createFreelancerProfile' : ActorMethod<[string, Freelancer], Result_1>,
  'getActiveSessionCount' : ActorMethod<[], bigint>,
  'getAllClients' : ActorMethod<[string], Result_5>,
  'getAllFreelancers' : ActorMethod<[string], Result_4>,
  'getClientProfile' : ActorMethod<[string], Result_3>,
  'getFreelancerProfile' : ActorMethod<[string], Result_2>,
  'getUserRole' : ActorMethod<[string], [] | [string]>,
  'login' : ActorMethod<[string, string], boolean>,
  'loginUser' : ActorMethod<[string, string, string], Result>,
  'logoutUser' : ActorMethod<[string], Result_1>,
  'registerUser' : ActorMethod<[string, string, string], Result_1>,
  'setUserRole' : ActorMethod<[string, string], Result_1>,
  'updateClientProfile' : ActorMethod<[string, Client], Result_1>,
  'updateFreelancerProfile' : ActorMethod<[string, Freelancer], Result_1>,
  'validateUserSession' : ActorMethod<[string], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
