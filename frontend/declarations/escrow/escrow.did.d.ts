import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface CreateEscrowArgs {
  'beneficiary' : Principal,
  'amount' : ICP,
  'expires_at' : [] | [bigint],
  'condition' : EscrowCondition,
}
export type EscrowCondition = { 'TimeDelay' : bigint } |
  { 'ManualApproval' : Principal } |
  { 'MultiSig' : Array<Principal> } |
  { 'External' : string };
export interface EscrowDetails {
  'id' : EscrowId,
  'status' : EscrowStatus,
  'depositor' : Principal,
  'beneficiary' : Principal,
  'created_at' : bigint,
  'amount' : ICP,
  'expires_at' : [] | [bigint],
  'approvals' : Array<Principal>,
  'condition' : EscrowCondition,
}
export type EscrowId = bigint;
export type EscrowStatus = { 'Active' : null } |
  { 'Cancelled' : null } |
  { 'Completed' : null } |
  { 'Expired' : null };
export type ICP = bigint;
export type Result = { 'ok' : null } |
  { 'err' : string };
export type Result_1 = { 'ok' : EscrowId } |
  { 'err' : string };
export interface _SERVICE {
  'approveRelease' : ActorMethod<[EscrowId], Result>,
  'cancelEscrow' : ActorMethod<[EscrowId], Result>,
  'cleanupExpiredEscrows' : ActorMethod<[], bigint>,
  'createEscrow' : ActorMethod<[CreateEscrowArgs], Result_1>,
  'getActiveEscrows' : ActorMethod<[], Array<EscrowDetails>>,
  'getEscrow' : ActorMethod<[EscrowId], [] | [EscrowDetails]>,
  'getEscrowsForPrincipal' : ActorMethod<[Principal], Array<EscrowDetails>>,
  'getTotalHeld' : ActorMethod<[], ICP>,
  'releaseTimedEscrow' : ActorMethod<[EscrowId], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
