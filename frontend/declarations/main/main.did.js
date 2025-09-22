export const idlFactory = ({ IDL }) => {
  const EscrowId = IDL.Nat;
  const Error = IDL.Variant({
    'UserAlreadyExists' : IDL.Null,
    'OnlySellerCanDispute' : IDL.Null,
    'AlreadyApproved' : IDL.Null,
    'EmailRequired' : IDL.Null,
    'InvalidDeadline' : IDL.Null,
    'EscrowNotDisputed' : IDL.Null,
    'InvalidAmount' : IDL.Null,
    'InvalidEscrowAmount' : IDL.Null,
    'PoolNotFound' : IDL.Null,
    'CannotDisputeBeforeDeadline' : IDL.Null,
    'TransactionFailed' : IDL.Null,
    'EscrowNotPending' : IDL.Null,
    'WeakPassword' : IDL.Null,
    'InsufficientBalance' : IDL.Null,
    'RegistrationFailed' : IDL.Null,
    'OnlyArbitratorCanResolve' : IDL.Null,
    'InsufficientEscrowBalance' : IDL.Null,
    'EscrowNotFound' : IDL.Null,
    'OnlyBuyerCanApprove' : IDL.Null,
    'InvalidToken' : IDL.Null,
    'NoArbitratorAssigned' : IDL.Null,
    'InvalidCredentials' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'InvalidPool' : IDL.Null,
    'InvalidRate' : IDL.Null,
    'SlippageTooHigh' : IDL.Null,
    'OnlySellerCanApprove' : IDL.Null,
    'OnlyBuyerCanCancel' : IDL.Null,
    'InvalidUserType' : IDL.Null,
    'InsufficientLiquidity' : IDL.Null,
    'TransactionNotFound' : IDL.Null,
    'StorageError' : IDL.Text,
    'InvalidEmail' : IDL.Null,
    'OnlyBuyerCanDispute' : IDL.Null,
    'AuthenticationFailed' : IDL.Null,
    'UserNotFound' : IDL.Null,
    'InvalidSession' : IDL.Null,
  });
  const Result_2 = IDL.Variant({ 'ok' : IDL.Text, 'err' : Error });
  const Result_32 = IDL.Variant({ 'ok' : IDL.Vec(EscrowId), 'err' : Error });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : Error });
  const TokenSymbol = IDL.Variant({
    'BTC' : IDL.Null,
    'EOS' : IDL.Null,
    'ETH' : IDL.Null,
    'ICP' : IDL.Null,
    'USDC' : IDL.Null,
    'USDT' : IDL.Null,
  });
  const ConversionRequest = IDL.Record({
    'to' : TokenSymbol,
    'from' : TokenSymbol,
    'amount' : IDL.Text,
  });
  const ConversionResponse = IDL.Record({
    'rate' : IDL.Float64,
    'estimatedGas' : IDL.Opt(IDL.Text),
    'converted' : IDL.Text,
    'slippage' : IDL.Float64,
  });
  const Result_31 = IDL.Variant({ 'ok' : ConversionResponse, 'err' : Error });
  const BountyMode = IDL.Variant({
    'InPerson' : IDL.Null,
    'Hybrid' : IDL.Null,
    'Virtual' : IDL.Null,
  });
  const BountyCategory = IDL.Variant({
    'Frontend' : IDL.Null,
    'Security' : IDL.Null,
    'SmartContracts' : IDL.Null,
    'UserTesting' : IDL.Null,
    'Documentation' : IDL.Null,
    'Design' : IDL.Null,
    'Backend' : IDL.Null,
    'Other' : IDL.Text,
  });
  const BountyInput = IDL.Record({
    'organizer' : IDL.Text,
    'title' : IDL.Text,
    'featured' : IDL.Bool,
    'judgesCriteria' : IDL.Vec(IDL.Text),
    'mode' : BountyMode,
    'tags' : IDL.Vec(IDL.Text),
    'description' : IDL.Text,
    'deliverables' : IDL.Vec(IDL.Text),
    'submissionDeadline' : IDL.Opt(IDL.Int),
    'category' : BountyCategory,
    'registrationDeadline' : IDL.Opt(IDL.Int),
    'maxParticipants' : IDL.Opt(IDL.Nat),
    'requirements' : IDL.Vec(IDL.Text),
    'prizePool' : IDL.Text,
    'timeline' : IDL.Text,
  });
  const BountyStatus = IDL.Variant({
    'Open' : IDL.Null,
    'Closed' : IDL.Null,
    'InProgress' : IDL.Null,
    'Completed' : IDL.Null,
  });
  const ParticipantStatus = IDL.Variant({
    'Winner' : IDL.Null,
    'Disqualified' : IDL.Null,
    'Submitted' : IDL.Null,
    'Registered' : IDL.Null,
  });
  const Participant = IDL.Record({
    'status' : ParticipantStatus,
    'userId' : IDL.Text,
    'submittedAt' : IDL.Opt(IDL.Int),
    'submissionDescription' : IDL.Opt(IDL.Text),
    'submissionUrl' : IDL.Opt(IDL.Text),
    'registeredAt' : IDL.Int,
  });
  const Bounty = IDL.Record({
    'id' : IDL.Text,
    'status' : BountyStatus,
    'organizer' : IDL.Text,
    'title' : IDL.Text,
    'participants' : IDL.Vec(Participant),
    'featured' : IDL.Bool,
    'judgesCriteria' : IDL.Vec(IDL.Text),
    'mode' : BountyMode,
    'createdAt' : IDL.Int,
    'tags' : IDL.Vec(IDL.Text),
    'description' : IDL.Text,
    'organizerId' : IDL.Text,
    'updatedAt' : IDL.Int,
    'deliverables' : IDL.Vec(IDL.Text),
    'submissionDeadline' : IDL.Opt(IDL.Int),
    'category' : BountyCategory,
    'registrationDeadline' : IDL.Opt(IDL.Int),
    'maxParticipants' : IDL.Opt(IDL.Nat),
    'requirements' : IDL.Vec(IDL.Text),
    'winnerIds' : IDL.Vec(IDL.Text),
    'prizePool' : IDL.Text,
    'timeline' : IDL.Text,
  });
  const Result_6 = IDL.Variant({ 'ok' : Bounty, 'err' : Error });
  const Client = IDL.Record({
    'numberOfEmployees' : IDL.Nat,
    'businessType' : IDL.Text,
    'description' : IDL.Text,
    'companyName' : IDL.Text,
    'companyWebsite' : IDL.Opt(IDL.Text),
    'phoneNumber' : IDL.Text,
    'lastName' : IDL.Text,
    'industry' : IDL.Text,
    'firstName' : IDL.Text,
  });
  const Timestamp = IDL.Int;
  const Balance = IDL.Nat;
  const CreateEscrowArgs = IDL.Record({
    'arbitrator' : IDL.Opt(IDL.Principal),
    'description' : IDL.Text,
    'deadline' : Timestamp,
    'seller' : IDL.Principal,
    'projectTitle' : IDL.Text,
    'serviceId' : IDL.Text,
    'amount' : Balance,
  });
  const Result_30 = IDL.Variant({ 'ok' : EscrowId, 'err' : Error });
  const ChargeDetails = IDL.Record({
    'description' : IDL.Text,
    'isEnabled' : IDL.Bool,
    'price' : IDL.Text,
  });
  const AdditionalCharges = IDL.Record({
    'additionalChanges' : IDL.Opt(ChargeDetails),
    'fastDelivery' : IDL.Opt(ChargeDetails),
    'perExtraChange' : IDL.Opt(ChargeDetails),
  });
  const PlanDetails = IDL.Record({
    'features' : IDL.Vec(IDL.Text),
    'description' : IDL.Text,
    'deliveryTime' : IDL.Text,
    'price' : IDL.Text,
  });
  const RequirementPlans = IDL.Record({
    'premium' : PlanDetails,
    'advanced' : PlanDetails,
    'basic' : PlanDetails,
  });
  const FreelancerProfile = IDL.Record({
    'subCategory' : IDL.Text,
    'additionalQuestions' : IDL.Vec(IDL.Text),
    'additionalCharges' : AdditionalCharges,
    'createdAt' : IDL.Int,
    'description' : IDL.Text,
    'isActive' : IDL.Bool,
    'email' : IDL.Text,
    'requirementPlans' : RequirementPlans,
    'updatedAt' : IDL.Int,
    'serviceTitle' : IDL.Text,
    'portfolioImages' : IDL.Vec(IDL.Text),
    'mainCategory' : IDL.Text,
  });
  const Result_5 = IDL.Variant({ 'ok' : FreelancerProfile, 'err' : Error });
  const Freelancer = IDL.Record({
    'country' : IDL.Text,
    'city' : IDL.Text,
    'name' : IDL.Text,
    'zipCode' : IDL.Text,
    'state' : IDL.Text,
    'photo' : IDL.Opt(IDL.Text),
    'phoneNumber' : IDL.Text,
    'skills' : IDL.Vec(IDL.Text),
    'streetAddress' : IDL.Text,
    'linkedinProfile' : IDL.Opt(IDL.Text),
  });
  const HackathonMode = IDL.Variant({
    'InPerson' : IDL.Null,
    'Hybrid' : IDL.Null,
    'Virtual' : IDL.Null,
  });
  const HackathonCategory = IDL.Variant({
    'AI' : IDL.Null,
    'NFT' : IDL.Null,
    'Frontend' : IDL.Null,
    'DeFi' : IDL.Null,
    'Security' : IDL.Null,
    'Infrastructure' : IDL.Null,
    'Web3' : IDL.Null,
    'SmartContracts' : IDL.Null,
    'Backend' : IDL.Null,
    'Other' : IDL.Text,
    'Mobile' : IDL.Null,
  });
  const HackathonPrize = IDL.Record({
    'token' : IDL.Opt(IDL.Text),
    'description' : IDL.Opt(IDL.Text),
    'position' : IDL.Text,
    'amount' : IDL.Text,
  });
  const HackathonInput = IDL.Record({
    'organizer' : IDL.Text,
    'title' : IDL.Text,
    'featured' : IDL.Bool,
    'endDate' : IDL.Int,
    'twitter' : IDL.Opt(IDL.Text),
    'judgingCriteria' : IDL.Vec(IDL.Text),
    'mode' : HackathonMode,
    'tags' : IDL.Vec(IDL.Text),
    'description' : IDL.Text,
    'website' : IDL.Opt(IDL.Text),
    'imageUrl' : IDL.Opt(IDL.Text),
    'maxTeamSize' : IDL.Opt(IDL.Nat),
    'deliverables' : IDL.Vec(IDL.Text),
    'submissionDeadline' : IDL.Int,
    'category' : HackathonCategory,
    'prizes' : IDL.Vec(HackathonPrize),
    'discord' : IDL.Opt(IDL.Text),
    'registrationDeadline' : IDL.Int,
    'bannerUrl' : IDL.Opt(IDL.Text),
    'maxParticipants' : IDL.Opt(IDL.Nat),
    'requirements' : IDL.Vec(IDL.Text),
    'location' : IDL.Opt(IDL.Text),
    'prizePool' : IDL.Text,
    'startDate' : IDL.Int,
    'timeline' : IDL.Text,
  });
  const HackathonStatus = IDL.Variant({
    'Ongoing' : IDL.Null,
    'Cancelled' : IDL.Null,
    'RegistrationOpen' : IDL.Null,
    'Completed' : IDL.Null,
    'Upcoming' : IDL.Null,
  });
  const HackathonParticipantStatus = IDL.Variant({
    'Withdrawn' : IDL.Null,
    'Winner' : IDL.Null,
    'Disqualified' : IDL.Null,
    'Submitted' : IDL.Null,
    'RunnerUp' : IDL.Null,
    'Registered' : IDL.Null,
  });
  const HackathonParticipant = IDL.Record({
    'status' : HackathonParticipantStatus,
    'userEmail' : IDL.Text,
    'githubRepo' : IDL.Opt(IDL.Text),
    'userId' : IDL.Text,
    'submittedAt' : IDL.Opt(IDL.Int),
    'teamMembers' : IDL.Vec(IDL.Text),
    'submissionDescription' : IDL.Opt(IDL.Text),
    'submissionUrl' : IDL.Opt(IDL.Text),
    'presentationUrl' : IDL.Opt(IDL.Text),
    'demoUrl' : IDL.Opt(IDL.Text),
    'registeredAt' : IDL.Int,
  });
  const Hackathon = IDL.Record({
    'id' : IDL.Text,
    'status' : HackathonStatus,
    'organizer' : IDL.Text,
    'title' : IDL.Text,
    'participants' : IDL.Vec(HackathonParticipant),
    'featured' : IDL.Bool,
    'endDate' : IDL.Int,
    'twitter' : IDL.Opt(IDL.Text),
    'judgingCriteria' : IDL.Vec(IDL.Text),
    'mode' : HackathonMode,
    'createdAt' : IDL.Int,
    'tags' : IDL.Vec(IDL.Text),
    'description' : IDL.Text,
    'organizerId' : IDL.Text,
    'website' : IDL.Opt(IDL.Text),
    'updatedAt' : IDL.Int,
    'imageUrl' : IDL.Opt(IDL.Text),
    'maxTeamSize' : IDL.Opt(IDL.Nat),
    'deliverables' : IDL.Vec(IDL.Text),
    'submissionDeadline' : IDL.Int,
    'category' : HackathonCategory,
    'prizes' : IDL.Vec(HackathonPrize),
    'discord' : IDL.Opt(IDL.Text),
    'registrationDeadline' : IDL.Int,
    'bannerUrl' : IDL.Opt(IDL.Text),
    'maxParticipants' : IDL.Opt(IDL.Nat),
    'requirements' : IDL.Vec(IDL.Text),
    'winnerIds' : IDL.Vec(IDL.Text),
    'location' : IDL.Opt(IDL.Text),
    'prizePool' : IDL.Text,
    'startDate' : IDL.Int,
    'timeline' : IDL.Text,
  });
  const Result_4 = IDL.Variant({ 'ok' : Hackathon, 'err' : Error });
  const TransactionStatus = IDL.Variant({
    'cancelled' : IDL.Null,
    'pending' : IDL.Null,
    'completed' : IDL.Null,
    'processing' : IDL.Null,
    'failed' : IDL.Null,
  });
  const SwapTransaction = IDL.Record({
    'id' : IDL.Text,
    'to' : TokenSymbol,
    'status' : TransactionStatus,
    'userEmail' : IDL.Text,
    'from' : TokenSymbol,
    'createdAt' : IDL.Int,
    'rate' : IDL.Float64,
    'updatedAt' : IDL.Int,
    'txHash' : IDL.Opt(IDL.Text),
    'amount' : IDL.Text,
    'converted' : IDL.Text,
  });
  const Result_29 = IDL.Variant({ 'ok' : SwapTransaction, 'err' : Error });
  const Result_1 = IDL.Variant({ 'ok' : Balance, 'err' : Error });
  const Result_28 = IDL.Variant({
    'ok' : IDL.Vec(IDL.Tuple(IDL.Text, FreelancerProfile)),
    'err' : Error,
  });
  const Result_27 = IDL.Variant({
    'ok' : IDL.Vec(IDL.Tuple(IDL.Text, Client)),
    'err' : Error,
  });
  const Result_26 = IDL.Variant({
    'ok' : IDL.Vec(IDL.Tuple(IDL.Text, Freelancer)),
    'err' : Error,
  });
  const FinalData = IDL.Record({
    'resume' : IDL.Opt(IDL.Text),
    'linkedinProfile' : IDL.Opt(IDL.Text),
  });
  const ProfileMethod = IDL.Variant({
    'resume' : IDL.Null,
    'manual' : IDL.Null,
  });
  const AddressData = IDL.Record({
    'country' : IDL.Text,
    'city' : IDL.Text,
    'zipCode' : IDL.Text,
    'state' : IDL.Text,
    'isPublic' : IDL.Bool,
    'streetAddress' : IDL.Text,
  });
  const CompanyData = IDL.Record({
    'employeeCount' : IDL.Opt(IDL.Text),
    'businessType' : IDL.Opt(IDL.Text),
    'companyName' : IDL.Opt(IDL.Text),
    'companyWebsite' : IDL.Opt(IDL.Text),
    'industry' : IDL.Opt(IDL.Text),
  });
  const PersonalInfo = IDL.Record({
    'lastName' : IDL.Opt(IDL.Text),
    'firstName' : IDL.Opt(IDL.Text),
  });
  const ProfileData = IDL.Record({
    'profilePhoto' : IDL.Opt(IDL.Text),
    'phoneNumber' : IDL.Opt(IDL.Text),
    'phoneVerified' : IDL.Bool,
  });
  const OnboardingRecord = IDL.Record({
    'final' : IDL.Opt(FinalData),
    'completedAt' : IDL.Opt(IDL.Int),
    'userType' : IDL.Text,
    'createdAt' : IDL.Int,
    'email' : IDL.Text,
    'updatedAt' : IDL.Int,
    'profileMethod' : IDL.Opt(ProfileMethod),
    'address' : IDL.Opt(AddressData),
    'companyData' : IDL.Opt(CompanyData),
    'personalInfo' : IDL.Opt(PersonalInfo),
    'skills' : IDL.Vec(IDL.Text),
    'profile' : IDL.Opt(ProfileData),
    'isComplete' : IDL.Bool,
  });
  const Result_19 = IDL.Variant({
    'ok' : IDL.Vec(IDL.Tuple(IDL.Text, OnboardingRecord)),
    'err' : Error,
  });
  const TokenInfo = IDL.Record({
    'decimals' : IDL.Nat8,
    'name' : IDL.Text,
    'symbol' : TokenSymbol,
    'contractAddress' : IDL.Opt(IDL.Text),
    'canisterId' : IDL.Opt(IDL.Text),
  });
  const EscrowStatus = IDL.Variant({
    'Disputed' : IDL.Null,
    'Refunded' : IDL.Null,
    'Cancelled' : IDL.Null,
    'Completed' : IDL.Null,
    'Pending' : IDL.Null,
  });
  const EscrowAgreement = IDL.Record({
    'id' : EscrowId,
    'arbitrator' : IDL.Opt(IDL.Principal),
    'status' : EscrowStatus,
    'completedAt' : IDL.Opt(Timestamp),
    'netAmount' : Balance,
    'platformFee' : Balance,
    'createdAt' : Timestamp,
    'sellerApproved' : IDL.Bool,
    'description' : IDL.Text,
    'deadline' : Timestamp,
    'seller' : IDL.Principal,
    'projectTitle' : IDL.Text,
    'buyer' : IDL.Principal,
    'serviceId' : IDL.Text,
    'amount' : Balance,
    'buyerApproved' : IDL.Bool,
  });
  const Result_21 = IDL.Variant({
    'ok' : IDL.Vec(EscrowAgreement),
    'err' : Error,
  });
  const Result_15 = IDL.Variant({ 'ok' : IDL.Vec(Bounty), 'err' : Error });
  const BountyStats = IDL.Record({
    'totalParticipants' : IDL.Nat,
    'totalBounties' : IDL.Nat,
    'openBounties' : IDL.Nat,
    'totalPrizePool' : IDL.Text,
    'completedBounties' : IDL.Nat,
  });
  const Result_25 = IDL.Variant({ 'ok' : Client, 'err' : Error });
  const MessageType = IDL.Variant({
    'file' : IDL.Null,
    'text' : IDL.Null,
    'systemMessage' : IDL.Null,
    'image' : IDL.Null,
  });
  const Message = IDL.Record({
    'id' : IDL.Text,
    'to' : IDL.Text,
    'content' : IDL.Text,
    'from' : IDL.Text,
    'isRead' : IDL.Bool,
    'messageType' : MessageType,
    'isDelivered' : IDL.Bool,
    'timestamp' : IDL.Int,
    'serverTimestamp' : IDL.Int,
  });
  const Result_24 = IDL.Variant({ 'ok' : IDL.Vec(Message), 'err' : Error });
  const Result_23 = IDL.Variant({
    'ok' : IDL.Opt(EscrowAgreement),
    'err' : Error,
  });
  const Result_22 = IDL.Variant({ 'ok' : Freelancer, 'err' : Error });
  const HackathonStats = IDL.Record({
    'totalHackathons' : IDL.Nat,
    'totalParticipants' : IDL.Nat,
    'activeHackathons' : IDL.Nat,
    'totalWinners' : IDL.Nat,
    'completedHackathons' : IDL.Nat,
    'totalPrizePool' : IDL.Text,
  });
  const Result_12 = IDL.Variant({ 'ok' : IDL.Vec(Hackathon), 'err' : Error });
  const Result_20 = IDL.Variant({ 'ok' : OnboardingRecord, 'err' : Error });
  const Result_18 = IDL.Variant({
    'ok' : IDL.Record({
      'freelancerRecords' : IDL.Nat,
      'completedRecords' : IDL.Nat,
      'pendingRecords' : IDL.Nat,
      'totalRecords' : IDL.Nat,
      'clientRecords' : IDL.Nat,
    }),
    'err' : Error,
  });
  const Result_17 = IDL.Variant({
    'ok' : IDL.Record({
      'collectedFees' : Balance,
      'totalFees' : Balance,
      'totalTransactions' : IDL.Nat,
    }),
    'err' : Error,
  });
  const SessionInfo = IDL.Record({
    'userType' : IDL.Text,
    'expiresAt' : IDL.Int,
    'sessionId' : IDL.Text,
  });
  const Result_16 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : Error });
  const UserType = IDL.Variant({
    'client' : IDL.Null,
    'freelancer' : IDL.Null,
  });
  const User = IDL.Record({
    'userType' : UserType,
    'email' : IDL.Text,
    'passwordHash' : IDL.Vec(IDL.Nat8),
  });
  const Result_14 = IDL.Variant({ 'ok' : User, 'err' : Error });
  const ConversationSummary = IDL.Record({
    'participantA' : IDL.Text,
    'participantB' : IDL.Text,
    'lastActivity' : IDL.Int,
    'lastMessage' : IDL.Opt(Message),
    'unreadCount' : IDL.Nat,
  });
  const Result_13 = IDL.Variant({
    'ok' : IDL.Vec(ConversationSummary),
    'err' : Error,
  });
  const Result_11 = IDL.Variant({
    'ok' : IDL.Record({
      'userType' : IDL.Text,
      'expiresAt' : IDL.Int,
      'email' : IDL.Text,
    }),
    'err' : Error,
  });
  const Result_10 = IDL.Variant({
    'ok' : IDL.Vec(SwapTransaction),
    'err' : Error,
  });
  const Result_7 = IDL.Variant({
    'ok' : IDL.Record({ 'user' : User, 'sessionId' : IDL.Text }),
    'err' : Error,
  });
  const Result_3 = IDL.Variant({ 'ok' : SessionInfo, 'err' : Error });
  const HackathonSearchFilters = IDL.Record({
    'status' : IDL.Opt(HackathonStatus),
    'organizer' : IDL.Opt(IDL.Text),
    'minPrizePool' : IDL.Opt(IDL.Text),
    'featured' : IDL.Opt(IDL.Bool),
    'mode' : IDL.Opt(HackathonMode),
    'tags' : IDL.Opt(IDL.Vec(IDL.Text)),
    'category' : IDL.Opt(HackathonCategory),
    'maxParticipants' : IDL.Opt(IDL.Nat),
  });
  const Result_8 = IDL.Variant({ 'ok' : Message, 'err' : Error });
  const BountyUpdate = IDL.Record({
    'status' : IDL.Opt(BountyStatus),
    'title' : IDL.Opt(IDL.Text),
    'featured' : IDL.Opt(IDL.Bool),
    'judgesCriteria' : IDL.Opt(IDL.Vec(IDL.Text)),
    'tags' : IDL.Opt(IDL.Vec(IDL.Text)),
    'description' : IDL.Opt(IDL.Text),
    'deliverables' : IDL.Opt(IDL.Vec(IDL.Text)),
    'submissionDeadline' : IDL.Opt(IDL.Int),
    'registrationDeadline' : IDL.Opt(IDL.Int),
    'maxParticipants' : IDL.Opt(IDL.Nat),
    'requirements' : IDL.Opt(IDL.Vec(IDL.Text)),
    'prizePool' : IDL.Opt(IDL.Text),
    'timeline' : IDL.Opt(IDL.Text),
  });
  const HackathonUpdate = IDL.Record({
    'status' : IDL.Opt(HackathonStatus),
    'title' : IDL.Opt(IDL.Text),
    'featured' : IDL.Opt(IDL.Bool),
    'endDate' : IDL.Opt(IDL.Int),
    'twitter' : IDL.Opt(IDL.Text),
    'judgingCriteria' : IDL.Opt(IDL.Vec(IDL.Text)),
    'tags' : IDL.Opt(IDL.Vec(IDL.Text)),
    'description' : IDL.Opt(IDL.Text),
    'website' : IDL.Opt(IDL.Text),
    'imageUrl' : IDL.Opt(IDL.Text),
    'maxTeamSize' : IDL.Opt(IDL.Nat),
    'deliverables' : IDL.Opt(IDL.Vec(IDL.Text)),
    'submissionDeadline' : IDL.Opt(IDL.Int),
    'prizes' : IDL.Opt(IDL.Vec(HackathonPrize)),
    'discord' : IDL.Opt(IDL.Text),
    'registrationDeadline' : IDL.Opt(IDL.Int),
    'bannerUrl' : IDL.Opt(IDL.Text),
    'maxParticipants' : IDL.Opt(IDL.Nat),
    'requirements' : IDL.Opt(IDL.Vec(IDL.Text)),
    'location' : IDL.Opt(IDL.Text),
    'prizePool' : IDL.Opt(IDL.Text),
    'startDate' : IDL.Opt(IDL.Int),
    'timeline' : IDL.Opt(IDL.Text),
  });
  return IDL.Service({
    'buyerApproveEscrow' : IDL.Func([IDL.Text, EscrowId], [Result_2], []),
    'cancelEscrow' : IDL.Func([IDL.Text, EscrowId], [Result_2], []),
    'changePassword' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [Result_2], []),
    'checkOverdueProjects' : IDL.Func([IDL.Text], [Result_32], []),
    'completeOnboarding' : IDL.Func([IDL.Text], [Result], []),
    'convertCurrency' : IDL.Func(
        [IDL.Text, ConversionRequest],
        [Result_31],
        [],
      ),
    'createBounty' : IDL.Func([IDL.Text, BountyInput], [Result_6], []),
    'createClientProfile' : IDL.Func([IDL.Text, Client], [Result], []),
    'createEscrow' : IDL.Func([IDL.Text, CreateEscrowArgs], [Result_30], []),
    'createFreelancerDashboardProfile' : IDL.Func(
        [IDL.Text, FreelancerProfile],
        [Result_5],
        [],
      ),
    'createFreelancerProfile' : IDL.Func([IDL.Text, Freelancer], [Result], []),
    'createHackathon' : IDL.Func([IDL.Text, HackathonInput], [Result_4], []),
    'createOnboardingRecord' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'createSwapTransaction' : IDL.Func(
        [IDL.Text, TokenSymbol, TokenSymbol, IDL.Text, IDL.Text, IDL.Float64],
        [Result_29],
        [],
      ),
    'deleteBounty' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'deleteFreelancerDashboardProfile' : IDL.Func([IDL.Text], [Result], []),
    'deleteHackathon' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'deleteMessage' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'depositToEscrow' : IDL.Func([IDL.Text, Balance], [Result_1], []),
    'getActiveSessionCount' : IDL.Func([], [IDL.Nat], []),
    'getAllActiveFreelancerProfiles' : IDL.Func([IDL.Text], [Result_28], []),
    'getAllBounties' : IDL.Func([], [IDL.Vec(Bounty)], []),
    'getAllClients' : IDL.Func([IDL.Text], [Result_27], []),
    'getAllFreelancers' : IDL.Func([IDL.Text], [Result_26], []),
    'getAllHackathons' : IDL.Func([], [IDL.Vec(Hackathon)], []),
    'getAllOnboardingRecords' : IDL.Func([IDL.Text], [Result_19], []),
    'getAllSupportedTokens' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(TokenSymbol, TokenInfo))],
        [],
      ),
    'getArbitrationEscrows' : IDL.Func([IDL.Text], [Result_21], []),
    'getBountiesByCategory' : IDL.Func([BountyCategory], [IDL.Vec(Bounty)], []),
    'getBountiesByOrganizer' : IDL.Func([IDL.Text], [Result_15], []),
    'getBountiesByStatus' : IDL.Func([BountyStatus], [IDL.Vec(Bounty)], []),
    'getBounty' : IDL.Func([IDL.Text], [IDL.Opt(Bounty)], []),
    'getBountyStats' : IDL.Func([], [BountyStats], []),
    'getClientProfile' : IDL.Func([IDL.Text], [Result_25], []),
    'getConversationMessages' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Opt(IDL.Nat), IDL.Opt(IDL.Nat)],
        [Result_24],
        [],
      ),
    'getEscrow' : IDL.Func([IDL.Text, EscrowId], [Result_23], []),
    'getEscrowBalance' : IDL.Func([IDL.Text], [Result_1], []),
    'getEscrowsByService' : IDL.Func([IDL.Text, IDL.Text], [Result_21], []),
    'getFeaturedBounties' : IDL.Func([], [IDL.Vec(Bounty)], []),
    'getFeaturedHackathons' : IDL.Func([], [IDL.Vec(Hackathon)], []),
    'getFreelancerDashboardProfile' : IDL.Func([IDL.Text], [Result_5], []),
    'getFreelancerProfile' : IDL.Func([IDL.Text], [Result_22], []),
    'getHackathon' : IDL.Func([IDL.Text], [IDL.Opt(Hackathon)], []),
    'getHackathonStatistics' : IDL.Func([], [HackathonStats], []),
    'getHackathonsByCategory' : IDL.Func(
        [HackathonCategory],
        [IDL.Vec(Hackathon)],
        [],
      ),
    'getHackathonsByOrganizer' : IDL.Func([IDL.Text], [Result_12], []),
    'getHackathonsByStatus' : IDL.Func(
        [HackathonStatus],
        [IDL.Vec(Hackathon)],
        [],
      ),
    'getMyEscrows' : IDL.Func([IDL.Text], [Result_21], []),
    'getOnboardingRecord' : IDL.Func([IDL.Text], [Result_20], []),
    'getOnboardingRecordsByStatus' : IDL.Func(
        [IDL.Text, IDL.Bool],
        [Result_19],
        [],
      ),
    'getOnboardingRecordsByUserType' : IDL.Func(
        [IDL.Text, IDL.Text],
        [Result_19],
        [],
      ),
    'getOnboardingStats' : IDL.Func([IDL.Text], [Result_18], []),
    'getPlatformFeeBalance' : IDL.Func([IDL.Text], [Result_1], []),
    'getPlatformFeeStats' : IDL.Func([IDL.Text], [Result_17], []),
    'getSessionInfo' : IDL.Func([IDL.Text], [IDL.Opt(SessionInfo)], []),
    'getSwapStatistics' : IDL.Func(
        [],
        [
          IDL.Record({
            'activePools' : IDL.Nat,
            'totalLiquidity' : IDL.Text,
            'totalVolume' : IDL.Text,
            'totalTransactions' : IDL.Nat,
          }),
        ],
        [],
      ),
    'getSwapTransaction' : IDL.Func([IDL.Text], [IDL.Opt(SwapTransaction)], []),
    'getSwapTransactionsByStatus' : IDL.Func(
        [TransactionStatus],
        [IDL.Vec(SwapTransaction)],
        [],
      ),
    'getTokenInfo' : IDL.Func([TokenSymbol], [IDL.Opt(TokenInfo)], []),
    'getUnreadMessageCount' : IDL.Func([IDL.Text], [Result_16], []),
    'getUserBounties' : IDL.Func([IDL.Text], [Result_15], []),
    'getUserByEmail' : IDL.Func([IDL.Text], [Result_14], []),
    'getUserByEmailWithSession' : IDL.Func(
        [IDL.Text, IDL.Text],
        [Result_14],
        [],
      ),
    'getUserConversations' : IDL.Func([IDL.Text], [Result_13], []),
    'getUserHackathons' : IDL.Func([IDL.Text], [Result_12], []),
    'getUserInfo' : IDL.Func([IDL.Text], [Result_11], []),
    'getUserSwapTransactions' : IDL.Func([IDL.Text], [Result_10], []),
    'isSessionValid' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'login' : IDL.Func([IDL.Text, IDL.Text], [Result_7], []),
    'loginUser' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [Result_3], []),
    'logoutUser' : IDL.Func([IDL.Text], [Result], []),
    'markMessageAsRead' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'raiseClientDispute' : IDL.Func(
        [IDL.Text, EscrowId, IDL.Text],
        [Result_2],
        [],
      ),
    'raiseEscrowDispute' : IDL.Func([IDL.Text, EscrowId], [Result_2], []),
    'raiseFreelancerDispute' : IDL.Func(
        [IDL.Text, EscrowId, IDL.Text],
        [Result_2],
        [],
      ),
    'registerForBounty' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'registerForHackathon' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Vec(IDL.Text)],
        [Result],
        [],
      ),
    'registerUser' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [Result], []),
    'resendOTP' : IDL.Func([IDL.Text], [Result_2], []),
    'resolveEscrowDispute' : IDL.Func(
        [IDL.Text, EscrowId, IDL.Bool],
        [Result_2],
        [],
      ),
    'searchHackathons' : IDL.Func(
        [HackathonSearchFilters],
        [IDL.Vec(Hackathon)],
        [],
      ),
    'sellerApproveEscrow' : IDL.Func([IDL.Text, EscrowId], [Result_2], []),
    'sendMessage' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, MessageType, IDL.Int],
        [Result_8],
        [],
      ),
    'setHackathonWinners' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Vec(IDL.Text)],
        [Result],
        [],
      ),
    'signup' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [Result_7], []),
    'submitToBounty' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text],
        [Result],
        [],
      ),
    'submitToHackathon' : IDL.Func(
        [
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Text),
        ],
        [Result],
        [],
      ),
    'updateBounty' : IDL.Func(
        [IDL.Text, IDL.Text, BountyUpdate],
        [Result_6],
        [],
      ),
    'updateCanisterIds' : IDL.Func(
        [
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Text),
        ],
        [Result],
        [],
      ),
    'updateClientProfile' : IDL.Func([IDL.Text, Client], [Result], []),
    'updateFreelancerDashboardProfile' : IDL.Func(
        [IDL.Text, FreelancerProfile],
        [Result_5],
        [],
      ),
    'updateFreelancerProfile' : IDL.Func([IDL.Text, Freelancer], [Result], []),
    'updateHackathon' : IDL.Func(
        [IDL.Text, IDL.Text, HackathonUpdate],
        [Result_4],
        [],
      ),
    'updateHackathonParticipantStatus' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, HackathonParticipantStatus],
        [Result],
        [],
      ),
    'updateOnboardingStep' : IDL.Func(
        [
          IDL.Text,
          IDL.Opt(ProfileMethod),
          IDL.Opt(PersonalInfo),
          IDL.Opt(IDL.Vec(IDL.Text)),
          IDL.Opt(AddressData),
          IDL.Opt(ProfileData),
          IDL.Opt(FinalData),
          IDL.Opt(CompanyData),
        ],
        [Result],
        [],
      ),
    'updateSwapTransactionStatus' : IDL.Func(
        [IDL.Text, IDL.Text, TransactionStatus, IDL.Opt(IDL.Text)],
        [Result],
        [],
      ),
    'validateUserSession' : IDL.Func([IDL.Text], [Result_3], []),
    'verifyOTP' : IDL.Func([IDL.Text, IDL.Text], [Result_2], []),
    'withdrawFromEscrow' : IDL.Func([IDL.Text, Balance], [Result_1], []),
    'withdrawFromHackathon' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
