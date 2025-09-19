import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface AdditionalCharges {
  'additionalChanges' : [] | [ChargeDetails],
  'fastDelivery' : [] | [ChargeDetails],
  'perExtraChange' : [] | [ChargeDetails],
}
export interface ChargeDetails {
  'description' : string,
  'isEnabled' : boolean,
  'price' : string,
}
export type Error = { 'NotFound' : null } |
  { 'TooManyImages' : null } |
  { 'InvalidPlanData' : null } |
  { 'InvalidData' : null } |
  { 'Unauthorized' : null } |
  { 'InvalidEmail' : null };
export interface FreelancerProfile {
  'subCategory' : string,
  'additionalQuestions' : Array<string>,
  'additionalCharges' : AdditionalCharges,
  'createdAt' : bigint,
  'description' : string,
  'isActive' : boolean,
  'email' : string,
  'requirementPlans' : RequirementPlans,
  'updatedAt' : bigint,
  'serviceTitle' : string,
  'portfolioImages' : Array<string>,
  'mainCategory' : string,
}
export interface PlanDetails {
  'features' : Array<string>,
  'description' : string,
  'deliveryTime' : string,
  'price' : string,
}
export interface RequirementPlans {
  'premium' : PlanDetails,
  'advanced' : PlanDetails,
  'basic' : PlanDetails,
}
export type Result = { 'ok' : FreelancerProfile } |
  { 'err' : Error };
export type Result_1 = { 'ok' : Array<[string, FreelancerProfile]> } |
  { 'err' : Error };
export type Result_2 = { 'ok' : boolean } |
  { 'err' : Error };
export type Result_3 = { 'ok' : bigint } |
  { 'err' : Error };
export type Result_4 = { 'ok' : null } |
  { 'err' : Error };
export interface _SERVICE {
  'activateProfile' : ActorMethod<[string], Result>,
  'createProfile' : ActorMethod<[string, FreelancerProfile], Result>,
  'deactivateProfile' : ActorMethod<[string], Result>,
  'deleteProfile' : ActorMethod<[string], Result_4>,
  'getActiveProfiles' : ActorMethod<[], Result_1>,
  'getActiveProfilesCount' : ActorMethod<[], Result_3>,
  'getAllProfiles' : ActorMethod<[], Result_1>,
  'getProfile' : ActorMethod<[string], Result>,
  'getProfilesByCategory' : ActorMethod<[string], Result_1>,
  'getProfilesBySubCategory' : ActorMethod<[string, string], Result_1>,
  'getTotalProfiles' : ActorMethod<[], Result_3>,
  'profileExists' : ActorMethod<[string], Result_2>,
  'searchProfilesByTitle' : ActorMethod<[string], Result_1>,
  'setMainCanister' : ActorMethod<[], undefined>,
  'updateProfile' : ActorMethod<[string, FreelancerProfile], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
