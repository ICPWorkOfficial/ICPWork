import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Error = { 'InvalidSkillsCount' : null } |
  { 'NotFound' : null } |
  { 'Unauthorized' : null } |
  { 'InvalidEmail' : null };
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
export type Result = { 'ok' : null } |
  { 'err' : Error };
export type Result_1 = { 'ok' : bigint } |
  { 'err' : Error };
export type Result_2 = { 'ok' : Freelancer } |
  { 'err' : Error };
export type Result_3 = { 'ok' : Array<[string, Freelancer]> } |
  { 'err' : Error };
export type Result_4 = { 'ok' : boolean } |
  { 'err' : Error };
export interface _SERVICE {
  'deleteFreelancer' : ActorMethod<[string], Result>,
  'freelancerExists' : ActorMethod<[string], Result_4>,
  'getAllFreelancers' : ActorMethod<[], Result_3>,
  'getFreelancer' : ActorMethod<[string], Result_2>,
  'getTotalFreelancers' : ActorMethod<[], Result_1>,
  'storeFreelancer' : ActorMethod<[string, Freelancer], Result>,
  'updateFreelancer' : ActorMethod<[string, Freelancer], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
