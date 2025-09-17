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
export type Error = { 'NotFound' : null } |
  { 'InvalidData' : null } |
  { 'Unauthorized' : null } |
  { 'AlreadyExists' : null };
export type Result = { 'ok' : null } |
  { 'err' : Error };
export type Result_1 = { 'ok' : Client } |
  { 'err' : Error };
export interface _SERVICE {
  'deleteClient' : ActorMethod<[], Result>,
  'getAllClients' : ActorMethod<[], Array<[Principal, Client]>>,
  'getClient' : ActorMethod<[Principal], Result_1>,
  'getMyProfile' : ActorMethod<[], Result_1>,
  'storeClient' : ActorMethod<[Client], Result>,
  'updateClient' : ActorMethod<[Client], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
