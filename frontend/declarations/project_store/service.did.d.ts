import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Error = { 'NotFound' : null } |
  { 'InvalidData' : null } |
  { 'ApplicationNotFound' : null } |
  { 'Unauthorized' : null } |
  { 'InvalidEmail' : null } |
  { 'ProjectNotFound' : null };
export interface Project {
  'id' : string,
  'status' : ProjectStatus,
  'title' : string,
  'createdAt' : bigint,
  'clientEmail' : string,
  'description' : string,
  'updatedAt' : bigint,
  'category' : string,
  'requirements' : string,
  'applications' : Array<string>,
  'budget' : string,
  'skills' : Array<string>,
  'timeline' : string,
}
export interface ProjectApplication {
  'id' : string,
  'status' : { 'Rejected' : null } |
    { 'Accepted' : null } |
    { 'Pending' : null },
  'createdAt' : bigint,
  'bidAmount' : string,
  'freelancerEmail' : string,
  'projectId' : string,
  'proposal' : string,
  'whyFit' : string,
  'estimatedTime' : string,
}
export type ProjectStatus = { 'Open' : null } |
  { 'Cancelled' : null } |
  { 'InProgress' : null } |
  { 'Completed' : null };
export type Result = { 'ok' : Project } |
  { 'err' : Error };
export type Result_1 = { 'ok' : ProjectApplication } |
  { 'err' : Error };
export type Result_2 = { 'ok' : Array<[string, Project]> } |
  { 'err' : Error };
export type Result_3 = {
    'ok' : {
      'inProgressProjects' : bigint,
      'totalProjects' : bigint,
      'openProjects' : bigint,
      'completedProjects' : bigint,
      'totalApplications' : bigint,
    }
  } |
  { 'err' : Error };
export type Result_4 = { 'ok' : Array<ProjectApplication> } |
  { 'err' : Error };
export type Result_5 = { 'ok' : null } |
  { 'err' : Error };
export interface _SERVICE {
  'applyToProject' : ActorMethod<
    [string, string, string, string, string, string],
    Result_1
  >,
  'createProject' : ActorMethod<
    [string, string, string, string, string, string, Array<string>, string],
    Result
  >,
  'deleteProject' : ActorMethod<[string], Result_5>,
  'getAllProjects' : ActorMethod<[], Result_2>,
  'getFreelancerApplications' : ActorMethod<[string], Result_4>,
  'getOpenProjects' : ActorMethod<[], Result_2>,
  'getProject' : ActorMethod<[string], Result>,
  'getProjectApplications' : ActorMethod<[string], Result_4>,
  'getProjectStats' : ActorMethod<[], Result_3>,
  'getProjectsByClient' : ActorMethod<[string], Result_2>,
  'updateApplicationStatus' : ActorMethod<
    [string, { 'Rejected' : null } | { 'Accepted' : null }],
    Result_1
  >,
  'updateProjectStatus' : ActorMethod<[string, ProjectStatus], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
