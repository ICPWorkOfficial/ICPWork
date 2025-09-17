import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Error = { 'NotFound' : null } |
  { 'InvalidData' : null } |
  { 'Unauthorized' : null } |
  { 'AlreadyExists' : null } |
  { 'InvalidUserType' : null } |
  { 'InvalidEmail' : null } |
  { 'InvalidPassword' : null };
export type Result = { 'ok' : User } |
  { 'err' : Error };
export type Result_1 = { 'ok' : null } |
  { 'err' : Error };
export interface User {
  'userType' : string,
  'country' : [] | [string],
  'numberOfEmployees' : [] | [bigint],
  'city' : [] | [string],
  'userId' : string,
  'createdAt' : bigint,
  'businessType' : [] | [string],
  'description' : [] | [string],
  'email' : string,
  'zipCode' : [] | [string],
  'updatedAt' : bigint,
  'state' : [] | [string],
  'companyName' : [] | [string],
  'companyWebsite' : [] | [string],
  'passwordHash' : Uint8Array | number[],
  'photo' : [] | [string],
  'phoneNumber' : [] | [string],
  'lastName' : [] | [string],
  'skills' : Array<string>,
  'streetAddress' : [] | [string],
  'linkedinProfile' : [] | [string],
  'industry' : [] | [string],
  'firstName' : [] | [string],
}
export interface _SERVICE {
  'changePassword' : ActorMethod<[string, string, string], Result_1>,
  'deleteUser' : ActorMethod<[string], Result_1>,
  'getAllUsers' : ActorMethod<[], Array<[string, User]>>,
  'getUser' : ActorMethod<[string], Result>,
  'getUserById' : ActorMethod<[string], Result>,
  'getUsersByType' : ActorMethod<[string], Array<User>>,
  'loginUser' : ActorMethod<[string, string], Result>,
  'registerUser' : ActorMethod<[string, string, string], Result>,
  'updateUserProfile' : ActorMethod<
    [
      string,
      {
        'country' : [] | [string],
        'numberOfEmployees' : [] | [bigint],
        'city' : [] | [string],
        'businessType' : [] | [string],
        'description' : [] | [string],
        'zipCode' : [] | [string],
        'state' : [] | [string],
        'companyName' : [] | [string],
        'companyWebsite' : [] | [string],
        'photo' : [] | [string],
        'phoneNumber' : [] | [string],
        'lastName' : [] | [string],
        'skills' : Array<string>,
        'streetAddress' : [] | [string],
        'linkedinProfile' : [] | [string],
        'industry' : [] | [string],
        'firstName' : [] | [string],
      },
    ],
    Result
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
