import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface AdditionalCharges {
  'additionalChanges' : [] | [ChargeDetails],
  'fastDelivery' : [] | [ChargeDetails],
  'perExtraChange' : [] | [ChargeDetails],
}
export interface AddressData {
  'country' : string,
  'city' : string,
  'zipCode' : string,
  'state' : string,
  'isPublic' : boolean,
  'streetAddress' : string,
}
export type Balance = bigint;
export interface Bounty {
  'id' : string,
  'status' : BountyStatus,
  'organizer' : string,
  'title' : string,
  'participants' : Array<Participant>,
  'featured' : boolean,
  'judgesCriteria' : Array<string>,
  'mode' : BountyMode,
  'createdAt' : bigint,
  'tags' : Array<string>,
  'description' : string,
  'organizerId' : string,
  'updatedAt' : bigint,
  'deliverables' : Array<string>,
  'submissionDeadline' : [] | [bigint],
  'category' : BountyCategory,
  'registrationDeadline' : [] | [bigint],
  'maxParticipants' : [] | [bigint],
  'requirements' : Array<string>,
  'winnerIds' : Array<string>,
  'prizePool' : string,
  'timeline' : string,
}
export type BountyCategory = { 'Frontend' : null } |
  { 'Security' : null } |
  { 'SmartContracts' : null } |
  { 'UserTesting' : null } |
  { 'Documentation' : null } |
  { 'Design' : null } |
  { 'Backend' : null } |
  { 'Other' : string };
export interface BountyInput {
  'organizer' : string,
  'title' : string,
  'featured' : boolean,
  'judgesCriteria' : Array<string>,
  'mode' : BountyMode,
  'tags' : Array<string>,
  'description' : string,
  'deliverables' : Array<string>,
  'submissionDeadline' : [] | [bigint],
  'category' : BountyCategory,
  'registrationDeadline' : [] | [bigint],
  'maxParticipants' : [] | [bigint],
  'requirements' : Array<string>,
  'prizePool' : string,
  'timeline' : string,
}
export type BountyMode = { 'InPerson' : null } |
  { 'Hybrid' : null } |
  { 'Virtual' : null };
export interface BountyStats {
  'totalParticipants' : bigint,
  'totalBounties' : bigint,
  'openBounties' : bigint,
  'totalPrizePool' : string,
  'completedBounties' : bigint,
}
export type BountyStatus = { 'Open' : null } |
  { 'Closed' : null } |
  { 'InProgress' : null } |
  { 'Completed' : null };
export interface BountyUpdate {
  'status' : [] | [BountyStatus],
  'title' : [] | [string],
  'featured' : [] | [boolean],
  'judgesCriteria' : [] | [Array<string>],
  'tags' : [] | [Array<string>],
  'description' : [] | [string],
  'deliverables' : [] | [Array<string>],
  'submissionDeadline' : [] | [bigint],
  'registrationDeadline' : [] | [bigint],
  'maxParticipants' : [] | [bigint],
  'requirements' : [] | [Array<string>],
  'prizePool' : [] | [string],
  'timeline' : [] | [string],
}
export interface ChargeDetails {
  'description' : string,
  'isEnabled' : boolean,
  'price' : string,
}
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
export interface CompanyData {
  'employeeCount' : [] | [string],
  'businessType' : [] | [string],
  'companyName' : [] | [string],
  'companyWebsite' : [] | [string],
  'industry' : [] | [string],
}
export interface ConversationSummary {
  'participantA' : string,
  'participantB' : string,
  'lastActivity' : bigint,
  'lastMessage' : [] | [Message],
  'unreadCount' : bigint,
}
export interface ConversionRequest {
  'to' : TokenSymbol,
  'from' : TokenSymbol,
  'amount' : string,
}
export interface ConversionResponse {
  'rate' : number,
  'estimatedGas' : [] | [string],
  'converted' : string,
  'slippage' : number,
}
export interface CreateEscrowArgs {
  'arbitrator' : [] | [Principal],
  'description' : string,
  'deadline' : Timestamp,
  'seller' : Principal,
  'projectTitle' : string,
  'serviceId' : string,
  'amount' : Balance,
}
export type Error = { 'UserAlreadyExists' : null } |
  { 'OnlySellerCanDispute' : null } |
  { 'AlreadyApproved' : null } |
  { 'EmailRequired' : null } |
  { 'InvalidDeadline' : null } |
  { 'EscrowNotDisputed' : null } |
  { 'InvalidAmount' : null } |
  { 'InvalidEscrowAmount' : null } |
  { 'PoolNotFound' : null } |
  { 'CannotDisputeBeforeDeadline' : null } |
  { 'TransactionFailed' : null } |
  { 'EscrowNotPending' : null } |
  { 'WeakPassword' : null } |
  { 'InsufficientBalance' : null } |
  { 'RegistrationFailed' : null } |
  { 'OnlyArbitratorCanResolve' : null } |
  { 'InsufficientEscrowBalance' : null } |
  { 'EscrowNotFound' : null } |
  { 'OnlyBuyerCanApprove' : null } |
  { 'InvalidToken' : null } |
  { 'NoArbitratorAssigned' : null } |
  { 'InvalidCredentials' : null } |
  { 'Unauthorized' : null } |
  { 'InvalidPool' : null } |
  { 'InvalidRate' : null } |
  { 'SlippageTooHigh' : null } |
  { 'OnlySellerCanApprove' : null } |
  { 'OnlyBuyerCanCancel' : null } |
  { 'InvalidUserType' : null } |
  { 'InsufficientLiquidity' : null } |
  { 'TransactionNotFound' : null } |
  { 'StorageError' : string } |
  { 'InvalidEmail' : null } |
  { 'OnlyBuyerCanDispute' : null } |
  { 'AuthenticationFailed' : null } |
  { 'UserNotFound' : null } |
  { 'InvalidSession' : null };
export interface EscrowAgreement {
  'id' : EscrowId,
  'arbitrator' : [] | [Principal],
  'status' : EscrowStatus,
  'completedAt' : [] | [Timestamp],
  'netAmount' : Balance,
  'platformFee' : Balance,
  'createdAt' : Timestamp,
  'sellerApproved' : boolean,
  'description' : string,
  'deadline' : Timestamp,
  'seller' : Principal,
  'projectTitle' : string,
  'buyer' : Principal,
  'serviceId' : string,
  'amount' : Balance,
  'buyerApproved' : boolean,
}
export type EscrowId = bigint;
export type EscrowStatus = { 'Disputed' : null } |
  { 'Refunded' : null } |
  { 'Cancelled' : null } |
  { 'Completed' : null } |
  { 'Pending' : null };
export interface FinalData {
  'resume' : [] | [string],
  'linkedinProfile' : [] | [string],
}
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
export interface Hackathon {
  'id' : string,
  'status' : HackathonStatus,
  'organizer' : string,
  'title' : string,
  'participants' : Array<HackathonParticipant>,
  'featured' : boolean,
  'endDate' : bigint,
  'twitter' : [] | [string],
  'judgingCriteria' : Array<string>,
  'mode' : HackathonMode,
  'createdAt' : bigint,
  'tags' : Array<string>,
  'description' : string,
  'organizerId' : string,
  'website' : [] | [string],
  'updatedAt' : bigint,
  'imageUrl' : [] | [string],
  'maxTeamSize' : [] | [bigint],
  'deliverables' : Array<string>,
  'submissionDeadline' : bigint,
  'category' : HackathonCategory,
  'prizes' : Array<HackathonPrize>,
  'discord' : [] | [string],
  'registrationDeadline' : bigint,
  'bannerUrl' : [] | [string],
  'maxParticipants' : [] | [bigint],
  'requirements' : Array<string>,
  'winnerIds' : Array<string>,
  'location' : [] | [string],
  'prizePool' : string,
  'startDate' : bigint,
  'timeline' : string,
}
export type HackathonCategory = { 'AI' : null } |
  { 'NFT' : null } |
  { 'Frontend' : null } |
  { 'DeFi' : null } |
  { 'Security' : null } |
  { 'Infrastructure' : null } |
  { 'Web3' : null } |
  { 'SmartContracts' : null } |
  { 'Backend' : null } |
  { 'Other' : string } |
  { 'Mobile' : null };
export interface HackathonInput {
  'organizer' : string,
  'title' : string,
  'featured' : boolean,
  'endDate' : bigint,
  'twitter' : [] | [string],
  'judgingCriteria' : Array<string>,
  'mode' : HackathonMode,
  'tags' : Array<string>,
  'description' : string,
  'website' : [] | [string],
  'imageUrl' : [] | [string],
  'maxTeamSize' : [] | [bigint],
  'deliverables' : Array<string>,
  'submissionDeadline' : bigint,
  'category' : HackathonCategory,
  'prizes' : Array<HackathonPrize>,
  'discord' : [] | [string],
  'registrationDeadline' : bigint,
  'bannerUrl' : [] | [string],
  'maxParticipants' : [] | [bigint],
  'requirements' : Array<string>,
  'location' : [] | [string],
  'prizePool' : string,
  'startDate' : bigint,
  'timeline' : string,
}
export type HackathonMode = { 'InPerson' : null } |
  { 'Hybrid' : null } |
  { 'Virtual' : null };
export interface HackathonParticipant {
  'status' : HackathonParticipantStatus,
  'userEmail' : string,
  'githubRepo' : [] | [string],
  'userId' : string,
  'submittedAt' : [] | [bigint],
  'teamMembers' : Array<string>,
  'submissionDescription' : [] | [string],
  'submissionUrl' : [] | [string],
  'presentationUrl' : [] | [string],
  'demoUrl' : [] | [string],
  'registeredAt' : bigint,
}
export type HackathonParticipantStatus = { 'Withdrawn' : null } |
  { 'Winner' : null } |
  { 'Disqualified' : null } |
  { 'Submitted' : null } |
  { 'RunnerUp' : null } |
  { 'Registered' : null };
export interface HackathonPrize {
  'token' : [] | [string],
  'description' : [] | [string],
  'position' : string,
  'amount' : string,
}
export interface HackathonSearchFilters {
  'status' : [] | [HackathonStatus],
  'organizer' : [] | [string],
  'minPrizePool' : [] | [string],
  'featured' : [] | [boolean],
  'mode' : [] | [HackathonMode],
  'tags' : [] | [Array<string>],
  'category' : [] | [HackathonCategory],
  'maxParticipants' : [] | [bigint],
}
export interface HackathonStats {
  'totalHackathons' : bigint,
  'totalParticipants' : bigint,
  'activeHackathons' : bigint,
  'totalWinners' : bigint,
  'completedHackathons' : bigint,
  'totalPrizePool' : string,
}
export type HackathonStatus = { 'Ongoing' : null } |
  { 'Cancelled' : null } |
  { 'RegistrationOpen' : null } |
  { 'Completed' : null } |
  { 'Upcoming' : null };
export interface HackathonUpdate {
  'status' : [] | [HackathonStatus],
  'title' : [] | [string],
  'featured' : [] | [boolean],
  'endDate' : [] | [bigint],
  'twitter' : [] | [string],
  'judgingCriteria' : [] | [Array<string>],
  'tags' : [] | [Array<string>],
  'description' : [] | [string],
  'website' : [] | [string],
  'imageUrl' : [] | [string],
  'maxTeamSize' : [] | [bigint],
  'deliverables' : [] | [Array<string>],
  'submissionDeadline' : [] | [bigint],
  'prizes' : [] | [Array<HackathonPrize>],
  'discord' : [] | [string],
  'registrationDeadline' : [] | [bigint],
  'bannerUrl' : [] | [string],
  'maxParticipants' : [] | [bigint],
  'requirements' : [] | [Array<string>],
  'location' : [] | [string],
  'prizePool' : [] | [string],
  'startDate' : [] | [bigint],
  'timeline' : [] | [string],
}
export interface Message {
  'id' : string,
  'to' : string,
  'content' : string,
  'from' : string,
  'isRead' : boolean,
  'messageType' : MessageType,
  'isDelivered' : boolean,
  'timestamp' : bigint,
  'serverTimestamp' : bigint,
}
export type MessageType = { 'file' : null } |
  { 'text' : null } |
  { 'systemMessage' : null } |
  { 'image' : null };
export interface OnboardingRecord {
  'final' : [] | [FinalData],
  'completedAt' : [] | [bigint],
  'userType' : string,
  'createdAt' : bigint,
  'email' : string,
  'updatedAt' : bigint,
  'profileMethod' : [] | [ProfileMethod],
  'address' : [] | [AddressData],
  'companyData' : [] | [CompanyData],
  'personalInfo' : [] | [PersonalInfo],
  'skills' : Array<string>,
  'profile' : [] | [ProfileData],
  'isComplete' : boolean,
}
export interface Participant {
  'status' : ParticipantStatus,
  'userId' : string,
  'submittedAt' : [] | [bigint],
  'submissionDescription' : [] | [string],
  'submissionUrl' : [] | [string],
  'registeredAt' : bigint,
}
export type ParticipantStatus = { 'Winner' : null } |
  { 'Disqualified' : null } |
  { 'Submitted' : null } |
  { 'Registered' : null };
export interface PersonalInfo {
  'lastName' : [] | [string],
  'firstName' : [] | [string],
}
export interface PlanDetails {
  'features' : Array<string>,
  'description' : string,
  'deliveryTime' : string,
  'price' : string,
}
export interface ProfileData {
  'profilePhoto' : [] | [string],
  'phoneNumber' : [] | [string],
  'phoneVerified' : boolean,
}
export type ProfileMethod = { 'resume' : null } |
  { 'manual' : null };
export interface RequirementPlans {
  'premium' : PlanDetails,
  'advanced' : PlanDetails,
  'basic' : PlanDetails,
}
export type Result = { 'ok' : null } |
  { 'err' : Error };
export type Result_1 = { 'ok' : Balance } |
  { 'err' : Error };
export type Result_10 = { 'ok' : Array<SwapTransaction> } |
  { 'err' : Error };
export type Result_11 = {
    'ok' : { 'userType' : string, 'expiresAt' : bigint, 'email' : string }
  } |
  { 'err' : Error };
export type Result_12 = { 'ok' : Array<Hackathon> } |
  { 'err' : Error };
export type Result_13 = { 'ok' : Array<ConversationSummary> } |
  { 'err' : Error };
export type Result_14 = { 'ok' : User } |
  { 'err' : Error };
export type Result_15 = { 'ok' : Array<Bounty> } |
  { 'err' : Error };
export type Result_16 = { 'ok' : bigint } |
  { 'err' : Error };
export type Result_17 = {
    'ok' : {
      'collectedFees' : Balance,
      'totalFees' : Balance,
      'totalTransactions' : bigint,
    }
  } |
  { 'err' : Error };
export type Result_18 = {
    'ok' : {
      'freelancerRecords' : bigint,
      'completedRecords' : bigint,
      'pendingRecords' : bigint,
      'totalRecords' : bigint,
      'clientRecords' : bigint,
    }
  } |
  { 'err' : Error };
export type Result_19 = { 'ok' : Array<[string, OnboardingRecord]> } |
  { 'err' : Error };
export type Result_2 = { 'ok' : string } |
  { 'err' : Error };
export type Result_20 = { 'ok' : OnboardingRecord } |
  { 'err' : Error };
export type Result_21 = { 'ok' : Array<EscrowAgreement> } |
  { 'err' : Error };
export type Result_22 = { 'ok' : Freelancer } |
  { 'err' : Error };
export type Result_23 = { 'ok' : [] | [EscrowAgreement] } |
  { 'err' : Error };
export type Result_24 = { 'ok' : Array<Message> } |
  { 'err' : Error };
export type Result_25 = { 'ok' : Client } |
  { 'err' : Error };
export type Result_26 = { 'ok' : Array<[string, Freelancer]> } |
  { 'err' : Error };
export type Result_27 = { 'ok' : Array<[string, Client]> } |
  { 'err' : Error };
export type Result_28 = { 'ok' : Array<[string, FreelancerProfile]> } |
  { 'err' : Error };
export type Result_29 = { 'ok' : SwapTransaction } |
  { 'err' : Error };
export type Result_3 = { 'ok' : SessionInfo } |
  { 'err' : Error };
export type Result_30 = { 'ok' : EscrowId } |
  { 'err' : Error };
export type Result_31 = { 'ok' : ConversionResponse } |
  { 'err' : Error };
export type Result_32 = { 'ok' : Array<EscrowId> } |
  { 'err' : Error };
export type Result_4 = { 'ok' : Hackathon } |
  { 'err' : Error };
export type Result_5 = { 'ok' : FreelancerProfile } |
  { 'err' : Error };
export type Result_6 = { 'ok' : Bounty } |
  { 'err' : Error };
export type Result_7 = { 'ok' : { 'user' : User, 'sessionId' : string } } |
  { 'err' : Error };
export type Result_8 = { 'ok' : Message } |
  { 'err' : Error };
export interface SessionInfo {
  'userType' : string,
  'expiresAt' : bigint,
  'sessionId' : string,
}
export interface SwapTransaction {
  'id' : string,
  'to' : TokenSymbol,
  'status' : TransactionStatus,
  'userEmail' : string,
  'from' : TokenSymbol,
  'createdAt' : bigint,
  'rate' : number,
  'updatedAt' : bigint,
  'txHash' : [] | [string],
  'amount' : string,
  'converted' : string,
}
export type Timestamp = bigint;
export interface TokenInfo {
  'decimals' : number,
  'name' : string,
  'symbol' : TokenSymbol,
  'contractAddress' : [] | [string],
  'canisterId' : [] | [string],
}
export type TokenSymbol = { 'BTC' : null } |
  { 'EOS' : null } |
  { 'ETH' : null } |
  { 'ICP' : null } |
  { 'USDC' : null } |
  { 'USDT' : null };
export type TransactionStatus = { 'cancelled' : null } |
  { 'pending' : null } |
  { 'completed' : null } |
  { 'processing' : null } |
  { 'failed' : null };
export interface User {
  'userType' : UserType,
  'email' : string,
  'passwordHash' : Uint8Array | number[],
}
export type UserType = { 'client' : null } |
  { 'freelancer' : null };
export interface _SERVICE {
  'buyerApproveEscrow' : ActorMethod<[string, EscrowId], Result_2>,
  'cancelEscrow' : ActorMethod<[string, EscrowId], Result_2>,
  'changePassword' : ActorMethod<[string, string, string], Result_2>,
  'checkOverdueProjects' : ActorMethod<[string], Result_32>,
  'completeOnboarding' : ActorMethod<[string], Result>,
  'convertCurrency' : ActorMethod<[string, ConversionRequest], Result_31>,
  'createBounty' : ActorMethod<[string, BountyInput], Result_6>,
  'createClientProfile' : ActorMethod<[string, Client], Result>,
  'createEscrow' : ActorMethod<[string, CreateEscrowArgs], Result_30>,
  'createFreelancerDashboardProfile' : ActorMethod<
    [string, FreelancerProfile],
    Result_5
  >,
  'createFreelancerProfile' : ActorMethod<[string, Freelancer], Result>,
  'createHackathon' : ActorMethod<[string, HackathonInput], Result_4>,
  'createOnboardingRecord' : ActorMethod<[string, string], Result>,
  'createSwapTransaction' : ActorMethod<
    [string, TokenSymbol, TokenSymbol, string, string, number],
    Result_29
  >,
  'deleteBounty' : ActorMethod<[string, string], Result>,
  'deleteFreelancerDashboardProfile' : ActorMethod<[string], Result>,
  'deleteHackathon' : ActorMethod<[string, string], Result>,
  'deleteMessage' : ActorMethod<[string, string], Result>,
  'depositToEscrow' : ActorMethod<[string, Balance], Result_1>,
  'getActiveSessionCount' : ActorMethod<[], bigint>,
  'getAllActiveFreelancerProfiles' : ActorMethod<[string], Result_28>,
  'getAllBounties' : ActorMethod<[], Array<Bounty>>,
  'getAllClients' : ActorMethod<[string], Result_27>,
  'getAllFreelancers' : ActorMethod<[string], Result_26>,
  'getAllHackathons' : ActorMethod<[], Array<Hackathon>>,
  'getAllOnboardingRecords' : ActorMethod<[string], Result_19>,
  'getAllSupportedTokens' : ActorMethod<[], Array<[TokenSymbol, TokenInfo]>>,
  'getArbitrationEscrows' : ActorMethod<[string], Result_21>,
  'getBountiesByCategory' : ActorMethod<[BountyCategory], Array<Bounty>>,
  'getBountiesByOrganizer' : ActorMethod<[string], Result_15>,
  'getBountiesByStatus' : ActorMethod<[BountyStatus], Array<Bounty>>,
  'getBounty' : ActorMethod<[string], [] | [Bounty]>,
  'getBountyStats' : ActorMethod<[], BountyStats>,
  'getClientProfile' : ActorMethod<[string], Result_25>,
  'getConversationMessages' : ActorMethod<
    [string, string, [] | [bigint], [] | [bigint]],
    Result_24
  >,
  'getEscrow' : ActorMethod<[string, EscrowId], Result_23>,
  'getEscrowBalance' : ActorMethod<[string], Result_1>,
  'getEscrowsByService' : ActorMethod<[string, string], Result_21>,
  'getFeaturedBounties' : ActorMethod<[], Array<Bounty>>,
  'getFeaturedHackathons' : ActorMethod<[], Array<Hackathon>>,
  'getFreelancerDashboardProfile' : ActorMethod<[string], Result_5>,
  'getFreelancerProfile' : ActorMethod<[string], Result_22>,
  'getHackathon' : ActorMethod<[string], [] | [Hackathon]>,
  'getHackathonStatistics' : ActorMethod<[], HackathonStats>,
  'getHackathonsByCategory' : ActorMethod<
    [HackathonCategory],
    Array<Hackathon>
  >,
  'getHackathonsByOrganizer' : ActorMethod<[string], Result_12>,
  'getHackathonsByStatus' : ActorMethod<[HackathonStatus], Array<Hackathon>>,
  'getMyEscrows' : ActorMethod<[string], Result_21>,
  'getOnboardingRecord' : ActorMethod<[string], Result_20>,
  'getOnboardingRecordsByStatus' : ActorMethod<[string, boolean], Result_19>,
  'getOnboardingRecordsByUserType' : ActorMethod<[string, string], Result_19>,
  'getOnboardingStats' : ActorMethod<[string], Result_18>,
  'getPlatformFeeBalance' : ActorMethod<[string], Result_1>,
  'getPlatformFeeStats' : ActorMethod<[string], Result_17>,
  'getSessionInfo' : ActorMethod<[string], [] | [SessionInfo]>,
  'getSwapStatistics' : ActorMethod<
    [],
    {
      'activePools' : bigint,
      'totalLiquidity' : string,
      'totalVolume' : string,
      'totalTransactions' : bigint,
    }
  >,
  'getSwapTransaction' : ActorMethod<[string], [] | [SwapTransaction]>,
  'getSwapTransactionsByStatus' : ActorMethod<
    [TransactionStatus],
    Array<SwapTransaction>
  >,
  'getTokenInfo' : ActorMethod<[TokenSymbol], [] | [TokenInfo]>,
  'getUnreadMessageCount' : ActorMethod<[string], Result_16>,
  'getUserBounties' : ActorMethod<[string], Result_15>,
  'getUserByEmail' : ActorMethod<[string], Result_14>,
  'getUserByEmailWithSession' : ActorMethod<[string, string], Result_14>,
  'getUserConversations' : ActorMethod<[string], Result_13>,
  'getUserHackathons' : ActorMethod<[string], Result_12>,
  'getUserInfo' : ActorMethod<[string], Result_11>,
  'getUserSwapTransactions' : ActorMethod<[string], Result_10>,
  'isSessionValid' : ActorMethod<[string], boolean>,
  'login' : ActorMethod<[string, string], Result_7>,
  'loginUser' : ActorMethod<[string, string, string], Result_3>,
  'logoutUser' : ActorMethod<[string], Result>,
  'markMessageAsRead' : ActorMethod<[string, string], Result>,
  'raiseClientDispute' : ActorMethod<[string, EscrowId, string], Result_2>,
  'raiseEscrowDispute' : ActorMethod<[string, EscrowId], Result_2>,
  'raiseFreelancerDispute' : ActorMethod<[string, EscrowId, string], Result_2>,
  'registerForBounty' : ActorMethod<[string, string], Result>,
  'registerForHackathon' : ActorMethod<[string, string, Array<string>], Result>,
  'registerUser' : ActorMethod<[string, string, string], Result>,
  'resendOTP' : ActorMethod<[string], Result_2>,
  'resolveEscrowDispute' : ActorMethod<[string, EscrowId, boolean], Result_2>,
  'searchHackathons' : ActorMethod<[HackathonSearchFilters], Array<Hackathon>>,
  'sellerApproveEscrow' : ActorMethod<[string, EscrowId], Result_2>,
  'sendMessage' : ActorMethod<
    [string, string, string, MessageType, bigint],
    Result_8
  >,
  'setHackathonWinners' : ActorMethod<[string, string, Array<string>], Result>,
  'signup' : ActorMethod<[string, string, string], Result_7>,
  'submitToBounty' : ActorMethod<[string, string, string, string], Result>,
  'submitToHackathon' : ActorMethod<
    [
      string,
      string,
      string,
      string,
      [] | [string],
      [] | [string],
      [] | [string],
    ],
    Result
  >,
  'updateBounty' : ActorMethod<[string, string, BountyUpdate], Result_6>,
  'updateCanisterIds' : ActorMethod<
    [[] | [string], [] | [string], [] | [string], [] | [string], [] | [string]],
    Result
  >,
  'updateClientProfile' : ActorMethod<[string, Client], Result>,
  'updateFreelancerDashboardProfile' : ActorMethod<
    [string, FreelancerProfile],
    Result_5
  >,
  'updateFreelancerProfile' : ActorMethod<[string, Freelancer], Result>,
  'updateHackathon' : ActorMethod<[string, string, HackathonUpdate], Result_4>,
  'updateHackathonParticipantStatus' : ActorMethod<
    [string, string, string, HackathonParticipantStatus],
    Result
  >,
  'updateOnboardingStep' : ActorMethod<
    [
      string,
      [] | [ProfileMethod],
      [] | [PersonalInfo],
      [] | [Array<string>],
      [] | [AddressData],
      [] | [ProfileData],
      [] | [FinalData],
      [] | [CompanyData],
    ],
    Result
  >,
  'updateSwapTransactionStatus' : ActorMethod<
    [string, string, TransactionStatus, [] | [string]],
    Result
  >,
  'validateUserSession' : ActorMethod<[string], Result_3>,
  'verifyOTP' : ActorMethod<[string, string], Result_2>,
  'withdrawFromEscrow' : ActorMethod<[string, Balance], Result_1>,
  'withdrawFromHackathon' : ActorMethod<[string, string], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
