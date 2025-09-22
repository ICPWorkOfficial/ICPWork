import Auth "./auth";
import SessionManager "./session";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Principal "mo:base/Principal";

persistent actor Main {
    
    // Import types from modules
    type SessionInfo = SessionManager.SessionInfo;
    type User = Auth.User;
    type UserType = Auth.UserType;
    type AuthError = Auth.AuthError;
    
    // Import storage canister types
    public type Freelancer = {
        name: Text;
        skills: [Text];
        country: Text;
        state: Text;
        city: Text;
        zipCode: Text;
        streetAddress: Text;
        photo: ?Text;
        phoneNumber: Text;
        linkedinProfile: ?Text;
    };

    public type Client = {
        firstName: Text;
        lastName: Text;
        companyName: Text;
        companyWebsite: ?Text;
        industry: Text;
        businessType: Text;
        numberOfEmployees: Nat;
        phoneNumber: Text;
        description: Text;
    };

    public type Error = {
        #AuthenticationFailed;
        #RegistrationFailed;
        #StorageError: Text;
        #InvalidUserType;
        #EmailRequired;
        #InvalidSession;
        #UserAlreadyExists;
        #UserNotFound;
        #InvalidCredentials;
        #InvalidEmail;
        #WeakPassword;
        #InvalidToken;
        #InsufficientBalance;
        #InsufficientLiquidity;
        #InvalidAmount;
        #TransactionNotFound;
        #PoolNotFound;
        #Unauthorized;
        #InvalidRate;
        #SlippageTooHigh;
        #TransactionFailed;
        #InvalidPool;
        #EscrowNotFound;
        #EscrowNotPending;
        #InvalidEscrowAmount;
        #InsufficientEscrowBalance;
        #InvalidDeadline;
        #NoArbitratorAssigned;
        #AlreadyApproved;
        #OnlyBuyerCanApprove;
        #OnlySellerCanApprove;
        #OnlyBuyerCanCancel;
        #OnlyBuyerCanDispute;
        #OnlySellerCanDispute;
        #OnlyArbitratorCanResolve;
        #EscrowNotDisputed;
        #CannotDisputeBeforeDeadline;
    };

    // Escrow types
    public type EscrowId = Nat;
    public type Balance = Nat;
    public type Timestamp = Int;
    
    public type EscrowStatus = {
        #Pending;
        #Completed;
        #Disputed;
        #Cancelled;
        #Refunded;
    };
    
    public type EscrowAgreement = {
        id: EscrowId;
        buyer: Principal;
        seller: Principal;
        arbitrator: ?Principal;
        amount: Balance;
        platformFee: Balance; // 5% of the amount
        netAmount: Balance; // Amount after platform fee deduction
        description: Text;
        status: EscrowStatus;
        createdAt: Timestamp;
        deadline: Timestamp; // Project deadline
        completedAt: ?Timestamp;
        buyerApproved: Bool;
        sellerApproved: Bool;
        serviceId: Text; // Reference to the service
        projectTitle: Text;
    };
    
    public type CreateEscrowArgs = {
        seller: Principal;
        arbitrator: ?Principal;
        amount: Balance;
        description: Text;
        deadline: Timestamp; // Project deadline in nanoseconds
        serviceId: Text;
        projectTitle: Text;
    };

    // Message types
    public type Message = {
        id: Text;
        from: Text;
        to: Text;
        content: Text;
        timestamp: Int;
        serverTimestamp: Int;
        messageType: MessageType;
        isRead: Bool;
        isDelivered: Bool;
    };

    public type MessageType = {
        #text;
        #file;
        #image;
        #systemMessage;
    };

    public type ConversationSummary = {
        participantA: Text;
        participantB: Text;
        lastMessage: ?Message;
        unreadCount: Nat;
        lastActivity: Int;
    };

    // Onboarding data types
    public type ProfileMethod = {
        #resume;
        #manual;
    };

    public type PersonalInfo = {
        firstName: ?Text;
        lastName: ?Text;
    };

    public type AddressData = {
        country: Text;
        state: Text;
        city: Text;
        zipCode: Text;
        streetAddress: Text;
        isPublic: Bool;
    };

    public type ProfileData = {
        profilePhoto: ?Text;
        phoneNumber: ?Text;
        phoneVerified: Bool;
    };

    public type FinalData = {
        resume: ?Text;
        linkedinProfile: ?Text;
    };

    public type CompanyData = {
        companyName: ?Text;
        companyWebsite: ?Text;
        industry: ?Text;
        businessType: ?Text;
        employeeCount: ?Text;
    };

    public type OnboardingRecord = {
        email: Text;
        userType: Text;
        profileMethod: ?ProfileMethod;
        personalInfo: ?PersonalInfo;
        skills: [Text];
        address: ?AddressData;
        profile: ?ProfileData;
        final: ?FinalData;
        companyData: ?CompanyData;
        isComplete: Bool;
        createdAt: Int;
        updatedAt: Int;
        completedAt: ?Int;
    };

    // Storage canister actors - Transient with lazy initialization
    private transient var freelancerStorage : ?{
        storeFreelancer: shared (Text, Freelancer) -> async Result.Result<(), {#NotFound; #InvalidSkillsCount; #Unauthorized; #InvalidEmail}>;
        updateFreelancer: shared (Text, Freelancer) -> async Result.Result<(), {#NotFound; #InvalidSkillsCount; #Unauthorized; #InvalidEmail}>;
        getFreelancer: shared Text -> async Result.Result<Freelancer, {#NotFound; #Unauthorized; #InvalidEmail}>;
        deleteFreelancer: shared Text -> async Result.Result<(), {#NotFound; #Unauthorized}>;
        getAllFreelancers: shared () -> async Result.Result<[(Text, Freelancer)], {#Unauthorized}>;
    } = null;

    private transient var clientStorage : ?{
        storeClient: shared (Text, Client) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidData; #InvalidEmail}>;
        updateClient: shared (Text, Client) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidData; #InvalidEmail}>;
        getClient: shared (Text) -> async Result.Result<Client, {#NotFound; #Unauthorized; #InvalidEmail}>;
        deleteClient: shared (Text) -> async Result.Result<(), {#NotFound; #Unauthorized}>;
        getAllClients: shared () -> async Result.Result<[(Text, Client)], {#Unauthorized}>;
    } = null;

    private transient var messageStorage : ?{
        storeMessage: shared (Text, Text, Text, Int, MessageType) -> async Result.Result<Message, {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
        getConversationMessages: shared (Text, Text, ?Nat, ?Nat) -> async Result.Result<[Message], {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
        markMessageAsRead: shared (Text, Text) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
        markMessageAsDelivered: shared (Text) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
        getUserConversations: shared (Text) -> async Result.Result<[ConversationSummary], {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
        getUnreadMessageCount: shared (Text) -> async Result.Result<Nat, {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
        deleteMessage: shared (Text, Text) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
        getMessage: shared (Text, Text) -> async Result.Result<Message, {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
    } = null;

    private transient var onboardingStorage : ?{
        createOnboardingRecord: shared (Text, Text) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text; #InvalidUserType}>;
        updateOnboardingStep: shared (Text, ?ProfileMethod, ?PersonalInfo, ?[Text], ?AddressData, ?ProfileData, ?FinalData, ?CompanyData) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text}>;
        completeOnboarding: shared (Text) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text}>;
        getOnboardingRecord: shared (Text) -> async Result.Result<OnboardingRecord, {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text}>;
        getAllOnboardingRecords: shared () -> async Result.Result<[(Text, OnboardingRecord)], {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text}>;
        getOnboardingRecordsByStatus: shared (Bool) -> async Result.Result<[(Text, OnboardingRecord)], {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text}>;
        getOnboardingRecordsByUserType: shared (Text) -> async Result.Result<[(Text, OnboardingRecord)], {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text; #InvalidUserType}>;
        deleteOnboardingRecord: shared (Text) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text}>;
        getOnboardingStats: shared () -> async Result.Result<{totalRecords: Nat; completedRecords: Nat; pendingRecords: Nat; freelancerRecords: Nat; clientRecords: Nat}, {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text}>;
    } = null;

    // Bounties data types
    public type BountyStatus = {
        #Open;
        #Closed;
        #InProgress;
        #Completed;
    };

    public type BountyMode = {
        #Virtual;
        #InPerson;
        #Hybrid;
    };

    public type BountyCategory = {
        #SmartContracts;
        #Frontend;
        #Backend;
        #Documentation;
        #UserTesting;
        #Design;
        #Security;
        #Other : Text;
    };

    public type ParticipantStatus = {
        #Registered;
        #Submitted;
        #Winner;
        #Disqualified;
    };

    public type Participant = {
        userId: Text;
        registeredAt: Int;
        status: ParticipantStatus;
        submissionUrl: ?Text;
        submissionDescription: ?Text;
        submittedAt: ?Int;
    };

    public type Bounty = {
        id: Text;
        title: Text;
        description: Text;
        organizer: Text;
        organizerId: Text;
        mode: BountyMode;
        prizePool: Text;
        timeline: Text;
        registrationDeadline: ?Int;
        submissionDeadline: ?Int;
        tags: [Text];
        category: BountyCategory;
        status: BountyStatus;
        featured: Bool;
        requirements: [Text];
        deliverables: [Text];
        judgesCriteria: [Text];
        maxParticipants: ?Nat;
        createdAt: Int;
        updatedAt: Int;
        participants: [Participant];
        winnerIds: [Text];
    };

    public type BountyInput = {
        title: Text;
        description: Text;
        organizer: Text;
        mode: BountyMode;
        prizePool: Text;
        timeline: Text;
        registrationDeadline: ?Int;
        submissionDeadline: ?Int;
        tags: [Text];
        category: BountyCategory;
        featured: Bool;
        requirements: [Text];
        deliverables: [Text];
        judgesCriteria: [Text];
        maxParticipants: ?Nat;
    };

    public type BountyUpdate = {
        title: ?Text;
        description: ?Text;
        prizePool: ?Text;
        timeline: ?Text;
        registrationDeadline: ?Int;
        submissionDeadline: ?Int;
        tags: ?[Text];
        status: ?BountyStatus;
        featured: ?Bool;
        requirements: ?[Text];
        deliverables: ?[Text];
        judgesCriteria: ?[Text];
        maxParticipants: ?Nat;
    };

    public type BountyStats = {
        totalBounties: Nat;
        openBounties: Nat;
        completedBounties: Nat;
        totalPrizePool: Text;
        totalParticipants: Nat;
    };

    // ICPSwap types
    public type TokenSymbol = {
        #ICP;
        #ETH;
        #BTC;
        #EOS;
        #USDC;
        #USDT;
    };
    
    public type TokenInfo = {
        symbol: TokenSymbol;
        name: Text;
        decimals: Nat8;
        canisterId: ?Text;
        contractAddress: ?Text;
    };
    
    public type SwapTransaction = {
        id: Text;
        from: TokenSymbol;
        to: TokenSymbol;
        amount: Text;
        converted: Text;
        rate: Float;
        userEmail: Text;
        status: TransactionStatus;
        createdAt: Int;
        updatedAt: Int;
        txHash: ?Text;
    };
    
    public type TransactionStatus = {
        #pending;
        #processing;
        #completed;
        #failed;
        #cancelled;
    };
    
    public type ConversionRequest = {
        from: TokenSymbol;
        to: TokenSymbol;
        amount: Text;
    };
    
    public type ConversionResponse = {
        rate: Float;
        converted: Text;
        slippage: Float;
        estimatedGas: ?Text;
    };
    
    public type LiquidityPool = {
        id: Text;
        tokenA: TokenSymbol;
        tokenB: TokenSymbol;
        reserveA: Text;
        reserveB: Text;
        totalSupply: Text;
        fee: Float;
        createdAt: Int;
        isActive: Bool;
    };
    
    public type PoolPosition = {
        id: Text;
        poolId: Text;
        userEmail: Text;
        liquidity: Text;
        tokenAAmount: Text;
        tokenBAmount: Text;
        createdAt: Int;
    };
    
    public type SwapQuote = {
        inputAmount: Text;
        outputAmount: Text;
        priceImpact: Float;
        route: [TokenSymbol];
        minimumReceived: Text;
        fee: Text;
    };

    // Hackathon types
    public type HackathonStatus = {
        #RegistrationOpen;
        #Upcoming;
        #Ongoing;
        #Completed;
        #Cancelled;
    };

    public type HackathonMode = {
        #Virtual;
        #InPerson;
        #Hybrid;
    };

    public type HackathonCategory = {
        #Web3;
        #DeFi;
        #NFT;
        #SmartContracts;
        #Frontend;
        #Backend;
        #Mobile;
        #AI;
        #Security;
        #Infrastructure;
        #Other : Text;
    };

    public type HackathonParticipantStatus = {
        #Registered;
        #Submitted;
        #Winner;
        #RunnerUp;
        #Disqualified;
        #Withdrawn;
    };

    public type HackathonParticipant = {
        userId: Text;
        userEmail: Text;
        registeredAt: Int;
        status: HackathonParticipantStatus;
        submissionUrl: ?Text;
        submissionDescription: ?Text;
        submittedAt: ?Int;
        teamMembers: [Text];
        githubRepo: ?Text;
        demoUrl: ?Text;
        presentationUrl: ?Text;
    };

    public type HackathonPrize = {
        position: Text;
        amount: Text;
        description: ?Text;
        token: ?Text;
    };

    public type Hackathon = {
        id: Text;
        title: Text;
        description: Text;
        organizer: Text;
        organizerId: Text;
        mode: HackathonMode;
        prizePool: Text;
        prizes: [HackathonPrize];
        timeline: Text;
        startDate: Int;
        endDate: Int;
        registrationDeadline: Int;
        submissionDeadline: Int;
        tags: [Text];
        category: HackathonCategory;
        status: HackathonStatus;
        featured: Bool;
        requirements: [Text];
        deliverables: [Text];
        judgingCriteria: [Text];
        maxParticipants: ?Nat;
        maxTeamSize: ?Nat;
        createdAt: Int;
        updatedAt: Int;
        participants: [HackathonParticipant];
        winnerIds: [Text];
        location: ?Text;
        website: ?Text;
        discord: ?Text;
        twitter: ?Text;
        imageUrl: ?Text;
        bannerUrl: ?Text;
    };

    public type HackathonInput = {
        title: Text;
        description: Text;
        organizer: Text;
        mode: HackathonMode;
        prizePool: Text;
        prizes: [HackathonPrize];
        timeline: Text;
        startDate: Int;
        endDate: Int;
        registrationDeadline: Int;
        submissionDeadline: Int;
        tags: [Text];
        category: HackathonCategory;
        featured: Bool;
        requirements: [Text];
        deliverables: [Text];
        judgingCriteria: [Text];
        maxParticipants: ?Nat;
        maxTeamSize: ?Nat;
        location: ?Text;
        website: ?Text;
        discord: ?Text;
        twitter: ?Text;
        imageUrl: ?Text;
        bannerUrl: ?Text;
    };

    public type HackathonUpdate = {
        title: ?Text;
        description: ?Text;
        prizePool: ?Text;
        prizes: ?[HackathonPrize];
        timeline: ?Text;
        startDate: ?Int;
        endDate: ?Int;
        registrationDeadline: ?Int;
        submissionDeadline: ?Int;
        tags: ?[Text];
        status: ?HackathonStatus;
        featured: ?Bool;
        requirements: ?[Text];
        deliverables: ?[Text];
        judgingCriteria: ?[Text];
        maxParticipants: ?Nat;
        maxTeamSize: ?Nat;
        location: ?Text;
        website: ?Text;
        discord: ?Text;
        twitter: ?Text;
        imageUrl: ?Text;
        bannerUrl: ?Text;
    };

    public type HackathonStats = {
        totalHackathons: Nat;
        activeHackathons: Nat;
        completedHackathons: Nat;
        totalPrizePool: Text;
        totalParticipants: Nat;
        totalWinners: Nat;
    };

    public type HackathonSearchFilters = {
        status: ?HackathonStatus;
        category: ?HackathonCategory;
        mode: ?HackathonMode;
        featured: ?Bool;
        organizer: ?Text;
        tags: ?[Text];
        minPrizePool: ?Text;
        maxParticipants: ?Nat;
    };

    // Freelancer Dashboard types
    public type FreelancerProfile = {
        email: Text;
        serviceTitle: Text;
        mainCategory: Text;
        subCategory: Text;
        description: Text;
        requirementPlans: RequirementPlans;
        additionalCharges: AdditionalCharges;
        portfolioImages: [Text];
        additionalQuestions: [Text];
        createdAt: Int;
        updatedAt: Int;
        isActive: Bool;
    };

    public type RequirementPlans = {
        basic: PlanDetails;
        advanced: PlanDetails;
        premium: PlanDetails;
    };

    public type PlanDetails = {
        price: Text;
        description: Text;
        features: [Text];
        deliveryTime: Text;
    };

    public type AdditionalCharges = {
        fastDelivery: ?ChargeDetails;
        additionalChanges: ?ChargeDetails;
        perExtraChange: ?ChargeDetails;
    };

    public type ChargeDetails = {
        price: Text;
        description: Text;
        isEnabled: Bool;
    };

    private transient var bountiesStorage : ?{
        createBounty: shared (Text, BountyInput) -> async Result.Result<Bounty, Text>;
        updateBounty: shared (Text, Text, BountyUpdate) -> async Result.Result<Bounty, Text>;
        registerForBounty: shared (Text, Text) -> async Result.Result<(), Text>;
        submitToBounty: shared (Text, Text, Text, Text) -> async Result.Result<(), Text>;
        getBounty: shared (Text) -> async ?Bounty;
        getAllBounties: shared () -> async [Bounty];
        getBountiesByStatus: shared (BountyStatus) -> async [Bounty];
        getBountiesByCategory: shared (BountyCategory) -> async [Bounty];
        getFeaturedBounties: shared () -> async [Bounty];
        getBountiesByOrganizer: shared (Text) -> async [Bounty];
        getUserBounties: shared (Text) -> async [Bounty];
        getBountyStats: shared () -> async BountyStats;
        deleteBounty: shared (Text, Text) -> async Result.Result<(), Text>;
    } = null;

    private transient var freelancerDashboardStorage : ?{
        createProfile: shared (Text, FreelancerProfile) -> async Result.Result<FreelancerProfile, {#NotFound; #InvalidData; #Unauthorized; #InvalidEmail; #TooManyImages; #InvalidPlanData}>;
        updateProfile: shared (Text, FreelancerProfile) -> async Result.Result<FreelancerProfile, {#NotFound; #InvalidData; #Unauthorized; #InvalidEmail; #TooManyImages; #InvalidPlanData}>;
        getProfile: shared (Text) -> async Result.Result<FreelancerProfile, {#NotFound; #Unauthorized; #InvalidEmail}>;
        getAllProfiles: shared () -> async Result.Result<[(Text, FreelancerProfile)], {#Unauthorized}>;
        getActiveProfiles: shared () -> async Result.Result<[(Text, FreelancerProfile)], {#Unauthorized}>;
        getProfilesByCategory: shared (Text) -> async Result.Result<[(Text, FreelancerProfile)], {#Unauthorized}>;
        getProfilesBySubCategory: shared (Text, Text) -> async Result.Result<[(Text, FreelancerProfile)], {#Unauthorized}>;
        deleteProfile: shared (Text) -> async Result.Result<(), {#NotFound; #Unauthorized}>;
        deactivateProfile: shared (Text) -> async Result.Result<FreelancerProfile, {#NotFound; #Unauthorized}>;
        activateProfile: shared (Text) -> async Result.Result<FreelancerProfile, {#NotFound; #Unauthorized}>;
        profileExists: shared (Text) -> async Result.Result<Bool, {#Unauthorized}>;
        getTotalProfiles: shared () -> async Result.Result<Nat, {#Unauthorized}>;
        getActiveProfilesCount: shared () -> async Result.Result<Nat, {#Unauthorized}>;
        searchProfilesByTitle: shared (Text) -> async Result.Result<[(Text, FreelancerProfile)], {#Unauthorized}>;
    } = null;

    private transient var icpswapStorage : ?{
        convertCurrency: shared (ConversionRequest) -> async Result.Result<ConversionResponse, {#InvalidToken; #InsufficientBalance; #InsufficientLiquidity; #InvalidAmount; #InvalidRate; #SlippageTooHigh}>;
        createTransaction: shared (TokenSymbol, TokenSymbol, Text, Text, Float, Text) -> async Result.Result<SwapTransaction, {#InvalidToken; #InsufficientBalance; #InsufficientLiquidity; #InvalidAmount; #TransactionNotFound; #PoolNotFound; #Unauthorized; #InvalidRate; #SlippageTooHigh; #TransactionFailed; #InvalidPool}>;
        getTransaction: shared (Text) -> async ?SwapTransaction;
        getUserTransactions: shared (Text) -> async [SwapTransaction];
        updateTransactionStatus: shared (Text, TransactionStatus, ?Text) -> async Result.Result<(), {#InvalidToken; #InsufficientBalance; #InsufficientLiquidity; #InvalidAmount; #TransactionNotFound; #PoolNotFound; #Unauthorized; #InvalidRate; #SlippageTooHigh; #TransactionFailed; #InvalidPool}>;
        getTransactionsByStatus: shared (TransactionStatus) -> async [SwapTransaction];
        getSwapStats: shared () -> async {totalTransactions: Nat; totalVolume: Text; activePools: Nat; totalLiquidity: Text};
        getAllTokens: shared () -> async [(TokenSymbol, TokenInfo)];
        getTokenInfo: shared (TokenSymbol) -> async ?TokenInfo;
    } = null;

    private transient var hackathonStorage : ?{
        createHackathon: shared (Text, HackathonInput) -> async Result.Result<Hackathon, Text>;
        updateHackathon: shared (Text, Text, HackathonUpdate) -> async Result.Result<Hackathon, Text>;
        deleteHackathon: shared (Text, Text) -> async Result.Result<(), Text>;
        registerForHackathon: shared (Text, Text, [Text]) -> async Result.Result<(), Text>;
        submitToHackathon: shared (Text, Text, Text, Text, ?Text, ?Text, ?Text) -> async Result.Result<(), Text>;
        withdrawFromHackathon: shared (Text, Text) -> async Result.Result<(), Text>;
        getHackathon: shared (Text) -> async ?Hackathon;
        getAllHackathons: shared () -> async [Hackathon];
        getHackathonsByStatus: shared (HackathonStatus) -> async [Hackathon];
        getHackathonsByCategory: shared (HackathonCategory) -> async [Hackathon];
        getFeaturedHackathons: shared () -> async [Hackathon];
        getHackathonsByOrganizer: shared (Text) -> async [Hackathon];
        getUserHackathons: shared (Text) -> async [Hackathon];
        searchHackathons: shared (HackathonSearchFilters) -> async [Hackathon];
        getHackathonStats: shared () -> async HackathonStats;
        updateParticipantStatus: shared (Text, Text, HackathonParticipantStatus, Text) -> async Result.Result<(), Text>;
        setWinners: shared (Text, [Text], Text) -> async Result.Result<(), Text>;
    } = null;

    private transient var escrowStorage : ?{
        deposit: shared (Balance) -> async Result.Result<Balance, Text>;
        withdraw: shared (Balance) -> async Result.Result<Balance, Text>;
        getMyBalance: shared () -> async Balance;
        createEscrow: shared (CreateEscrowArgs) -> async Result.Result<EscrowId, Text>;
        buyerApprove: shared (EscrowId) -> async Result.Result<Text, Text>;
        sellerApprove: shared (EscrowId) -> async Result.Result<Text, Text>;
        cancelEscrow: shared (EscrowId) -> async Result.Result<Text, Text>;
        raiseDispute: shared (EscrowId) -> async Result.Result<Text, Text>;
        resolveDispute: shared (EscrowId, Bool) -> async Result.Result<Text, Text>;
        raiseClientDispute: shared (EscrowId, Text) -> async Result.Result<Text, Text>;
        raiseFreelancerDispute: shared (EscrowId, Text) -> async Result.Result<Text, Text>;
        getEscrow: shared (EscrowId) -> async ?EscrowAgreement;
        getMyEscrows: shared () -> async [EscrowAgreement];
        getArbitrationEscrows: shared () -> async [EscrowAgreement];
        getPlatformFeeBalance: shared () -> async Balance;
        getPlatformFeeStats: shared () -> async { totalFees: Balance; totalTransactions: Nat; collectedFees: Balance; };
        getEscrowsByService: shared (Text) -> async [EscrowAgreement];
        checkOverdueProjects: shared () -> async Result.Result<[EscrowId], Text>;
    } = null;


    // Initialize modules
    transient let auth = Auth.Auth();
    transient let sessionManager = SessionManager.SessionManager();

    // Stable storage for upgrades
    private var sessionEntries : [(Text, SessionManager.Session)] = [];

    // System functions for upgrades
    system func preupgrade() {
        auth.preupgrade();
        sessionEntries := sessionManager.preupgrade();
    };

    system func postupgrade() {
        auth.postupgrade();
        sessionManager.postupgrade(sessionEntries);
        sessionEntries := [];
    };

    // Helper functions for lazy actor initialization
    private func getFreelancerStorage() : {
        storeFreelancer: shared (Text, Freelancer) -> async Result.Result<(), {#NotFound; #InvalidSkillsCount; #Unauthorized; #InvalidEmail}>;
        updateFreelancer: shared (Text, Freelancer) -> async Result.Result<(), {#NotFound; #InvalidSkillsCount; #Unauthorized; #InvalidEmail}>;
        getFreelancer: shared (Text) -> async Result.Result<Freelancer, {#NotFound; #Unauthorized; #InvalidEmail}>;
        deleteFreelancer: shared (Text) -> async Result.Result<(), {#NotFound; #Unauthorized}>;
        getAllFreelancers: shared () -> async Result.Result<[(Text, Freelancer)], {#Unauthorized}>;
    } {
        switch (freelancerStorage) {
            case null {
                let actor_ref = actor("freelancer_data") : actor {
                    storeFreelancer: (Text, Freelancer) -> async Result.Result<(), {#NotFound; #InvalidSkillsCount; #Unauthorized; #InvalidEmail}>;
                    updateFreelancer: (Text, Freelancer) -> async Result.Result<(), {#NotFound; #InvalidSkillsCount; #Unauthorized; #InvalidEmail}>;
                    getFreelancer: (Text) -> async Result.Result<Freelancer, {#NotFound; #Unauthorized; #InvalidEmail}>;
                    deleteFreelancer: (Text) -> async Result.Result<(), {#NotFound; #Unauthorized}>;
                    getAllFreelancers: () -> async Result.Result<[(Text, Freelancer)], {#Unauthorized}>;
                };
                let storage = {
                    storeFreelancer = actor_ref.storeFreelancer;
                    updateFreelancer = actor_ref.updateFreelancer;
                    getFreelancer = actor_ref.getFreelancer;
                    deleteFreelancer = actor_ref.deleteFreelancer;
                    getAllFreelancers = actor_ref.getAllFreelancers;
                };
                freelancerStorage := ?storage;
                storage
            };
            case (?storage) storage;
        }
    };

    private func getClientStorage() : {
        storeClient: shared (Text, Client) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidData; #InvalidEmail}>;
        updateClient: shared (Text, Client) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidData; #InvalidEmail}>;
        getClient: shared (Text) -> async Result.Result<Client, {#NotFound; #Unauthorized; #InvalidEmail}>;
        deleteClient: shared (Text) -> async Result.Result<(), {#NotFound; #Unauthorized}>;
        getAllClients: shared () -> async Result.Result<[(Text, Client)], {#Unauthorized}>;
    } {
        switch (clientStorage) {
            case null {
                let actor_ref = actor("client_data") : actor {
                    storeClient: (Text, Client) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidData; #InvalidEmail}>;
                    updateClient: (Text, Client) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidData; #InvalidEmail}>;
                    getClient: (Text) -> async Result.Result<Client, {#NotFound; #Unauthorized; #InvalidEmail}>;
                    deleteClient: (Text) -> async Result.Result<(), {#NotFound; #Unauthorized}>;
                    getAllClients: () -> async Result.Result<[(Text, Client)], {#Unauthorized}>;
                };
                let storage = {
                    storeClient = actor_ref.storeClient;
                    updateClient = actor_ref.updateClient;
                    getClient = actor_ref.getClient;
                    deleteClient = actor_ref.deleteClient;
                    getAllClients = actor_ref.getAllClients;
                };
                clientStorage := ?storage;
                storage
            };
            case (?storage) storage;
        }
    };

    private func getMessageStorage() : {
        storeMessage: shared (Text, Text, Text, Int, MessageType) -> async Result.Result<Message, {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
        getConversationMessages: shared (Text, Text, ?Nat, ?Nat) -> async Result.Result<[Message], {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
        markMessageAsRead: shared (Text, Text) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
        markMessageAsDelivered: shared (Text) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
        getUserConversations: shared (Text) -> async Result.Result<[ConversationSummary], {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
        getUnreadMessageCount: shared (Text) -> async Result.Result<Nat, {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
        deleteMessage: shared (Text, Text) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
        getMessage: shared (Text, Text) -> async Result.Result<Message, {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
    } {
        switch (messageStorage) {
            case null {
                let actor_ref = actor("message_store") : actor {
                    storeMessage: shared (Text, Text, Text, Int, MessageType) -> async Result.Result<Message, {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
                    getConversationMessages: shared (Text, Text, ?Nat, ?Nat) -> async Result.Result<[Message], {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
                    markMessageAsRead: shared (Text, Text) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
                    markMessageAsDelivered: shared (Text) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
                    getUserConversations: shared (Text) -> async Result.Result<[ConversationSummary], {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
                    getUnreadMessageCount: shared (Text) -> async Result.Result<Nat, {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
                    deleteMessage: shared (Text, Text) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
                    getMessage: shared (Text, Text) -> async Result.Result<Message, {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
                };
                let storage = {
                    storeMessage = actor_ref.storeMessage;
                    getConversationMessages = actor_ref.getConversationMessages;
                    markMessageAsRead = actor_ref.markMessageAsRead;
                    markMessageAsDelivered = actor_ref.markMessageAsDelivered;
                    getUserConversations = actor_ref.getUserConversations;
                    getUnreadMessageCount = actor_ref.getUnreadMessageCount;
                    deleteMessage = actor_ref.deleteMessage;
                    getMessage = actor_ref.getMessage;
                };
                messageStorage := ?storage;
                storage
            };
            case (?storage) storage;
        }
    };

    private func getOnboardingStorage() : {
        createOnboardingRecord: shared (Text, Text) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text; #InvalidUserType}>;
        updateOnboardingStep: shared (Text, ?ProfileMethod, ?PersonalInfo, ?[Text], ?AddressData, ?ProfileData, ?FinalData, ?CompanyData) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text}>;
        completeOnboarding: shared (Text) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text}>;
        getOnboardingRecord: shared (Text) -> async Result.Result<OnboardingRecord, {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text}>;
        getAllOnboardingRecords: shared () -> async Result.Result<[(Text, OnboardingRecord)], {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text}>;
        getOnboardingRecordsByStatus: shared (Bool) -> async Result.Result<[(Text, OnboardingRecord)], {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text}>;
        getOnboardingRecordsByUserType: shared (Text) -> async Result.Result<[(Text, OnboardingRecord)], {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text; #InvalidUserType}>;
        deleteOnboardingRecord: shared (Text) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text}>;
        getOnboardingStats: shared () -> async Result.Result<{totalRecords: Nat; completedRecords: Nat; pendingRecords: Nat; freelancerRecords: Nat; clientRecords: Nat}, {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text}>;
    } {
        switch (onboardingStorage) {
            case null {
                let actor_ref = actor("onboarding_store") : actor {
                    createOnboardingRecord: shared (Text, Text) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text; #InvalidUserType}>;
                    updateOnboardingStep: shared (Text, ?ProfileMethod, ?PersonalInfo, ?[Text], ?AddressData, ?ProfileData, ?FinalData, ?CompanyData) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text}>;
                    completeOnboarding: shared (Text) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text}>;
                    getOnboardingRecord: shared (Text) -> async Result.Result<OnboardingRecord, {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text}>;
                    getAllOnboardingRecords: shared () -> async Result.Result<[(Text, OnboardingRecord)], {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text}>;
                    getOnboardingRecordsByStatus: shared (Bool) -> async Result.Result<[(Text, OnboardingRecord)], {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text}>;
                    getOnboardingRecordsByUserType: shared (Text) -> async Result.Result<[(Text, OnboardingRecord)], {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text; #InvalidUserType}>;
                    deleteOnboardingRecord: shared (Text) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text}>;
                    getOnboardingStats: shared () -> async Result.Result<{totalRecords: Nat; completedRecords: Nat; pendingRecords: Nat; freelancerRecords: Nat; clientRecords: Nat}, {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text}>;
                };
                let storage = {
                    createOnboardingRecord = actor_ref.createOnboardingRecord;
                    updateOnboardingStep = actor_ref.updateOnboardingStep;
                    completeOnboarding = actor_ref.completeOnboarding;
                    getOnboardingRecord = actor_ref.getOnboardingRecord;
                    getAllOnboardingRecords = actor_ref.getAllOnboardingRecords;
                    getOnboardingRecordsByStatus = actor_ref.getOnboardingRecordsByStatus;
                    getOnboardingRecordsByUserType = actor_ref.getOnboardingRecordsByUserType;
                    deleteOnboardingRecord = actor_ref.deleteOnboardingRecord;
                    getOnboardingStats = actor_ref.getOnboardingStats;
                };
                onboardingStorage := ?storage;
                storage
            };
            case (?storage) storage;
        }
    };

    private func getBountiesStorage() : {
        createBounty: shared (Text, BountyInput) -> async Result.Result<Bounty, Text>;
        updateBounty: shared (Text, Text, BountyUpdate) -> async Result.Result<Bounty, Text>;
        registerForBounty: shared (Text, Text) -> async Result.Result<(), Text>;
        submitToBounty: shared (Text, Text, Text, Text) -> async Result.Result<(), Text>;
        getBounty: shared (Text) -> async ?Bounty;
        getAllBounties: shared () -> async [Bounty];
        getBountiesByStatus: shared (BountyStatus) -> async [Bounty];
        getBountiesByCategory: shared (BountyCategory) -> async [Bounty];
        getFeaturedBounties: shared () -> async [Bounty];
        getBountiesByOrganizer: shared (Text) -> async [Bounty];
        getUserBounties: shared (Text) -> async [Bounty];
        getBountyStats: shared () -> async BountyStats;
        deleteBounty: shared (Text, Text) -> async Result.Result<(), Text>;
    } {
        switch (bountiesStorage) {
            case null {
                let actor_ref = actor("bounties_store") : actor {
                    createBounty: shared (Text, BountyInput) -> async Result.Result<Bounty, Text>;
                    updateBounty: shared (Text, Text, BountyUpdate) -> async Result.Result<Bounty, Text>;
                    registerForBounty: shared (Text, Text) -> async Result.Result<(), Text>;
                    submitToBounty: shared (Text, Text, Text, Text) -> async Result.Result<(), Text>;
                    getBounty: shared (Text) -> async ?Bounty;
                    getAllBounties: shared () -> async [Bounty];
                    getBountiesByStatus: shared (BountyStatus) -> async [Bounty];
                    getBountiesByCategory: shared (BountyCategory) -> async [Bounty];
                    getFeaturedBounties: shared () -> async [Bounty];
                    getBountiesByOrganizer: shared (Text) -> async [Bounty];
                    getUserBounties: shared (Text) -> async [Bounty];
                    getBountyStats: shared () -> async BountyStats;
                    deleteBounty: shared (Text, Text) -> async Result.Result<(), Text>;
                };
                let storage = {
                    createBounty = actor_ref.createBounty;
                    updateBounty = actor_ref.updateBounty;
                    registerForBounty = actor_ref.registerForBounty;
                    submitToBounty = actor_ref.submitToBounty;
                    getBounty = actor_ref.getBounty;
                    getAllBounties = actor_ref.getAllBounties;
                    getBountiesByStatus = actor_ref.getBountiesByStatus;
                    getBountiesByCategory = actor_ref.getBountiesByCategory;
                    getFeaturedBounties = actor_ref.getFeaturedBounties;
                    getBountiesByOrganizer = actor_ref.getBountiesByOrganizer;
                    getUserBounties = actor_ref.getUserBounties;
                    getBountyStats = actor_ref.getBountyStats;
                    deleteBounty = actor_ref.deleteBounty;
                };
                bountiesStorage := ?storage;
                storage
            };
            case (?storage) storage;
        }
    };

    private func getFreelancerDashboardStorage() : {
        createProfile: shared (Text, FreelancerProfile) -> async Result.Result<FreelancerProfile, {#NotFound; #InvalidData; #Unauthorized; #InvalidEmail; #TooManyImages; #InvalidPlanData}>;
        updateProfile: shared (Text, FreelancerProfile) -> async Result.Result<FreelancerProfile, {#NotFound; #InvalidData; #Unauthorized; #InvalidEmail; #TooManyImages; #InvalidPlanData}>;
        getProfile: shared (Text) -> async Result.Result<FreelancerProfile, {#NotFound; #Unauthorized; #InvalidEmail}>;
        getAllProfiles: shared () -> async Result.Result<[(Text, FreelancerProfile)], {#Unauthorized}>;
        getActiveProfiles: shared () -> async Result.Result<[(Text, FreelancerProfile)], {#Unauthorized}>;
        getProfilesByCategory: shared (Text) -> async Result.Result<[(Text, FreelancerProfile)], {#Unauthorized}>;
        getProfilesBySubCategory: shared (Text, Text) -> async Result.Result<[(Text, FreelancerProfile)], {#Unauthorized}>;
        deleteProfile: shared (Text) -> async Result.Result<(), {#NotFound; #Unauthorized}>;
        deactivateProfile: shared (Text) -> async Result.Result<FreelancerProfile, {#NotFound; #Unauthorized}>;
        activateProfile: shared (Text) -> async Result.Result<FreelancerProfile, {#NotFound; #Unauthorized}>;
        profileExists: shared (Text) -> async Result.Result<Bool, {#Unauthorized}>;
        getTotalProfiles: shared () -> async Result.Result<Nat, {#Unauthorized}>;
        getActiveProfilesCount: shared () -> async Result.Result<Nat, {#Unauthorized}>;
        searchProfilesByTitle: shared (Text) -> async Result.Result<[(Text, FreelancerProfile)], {#Unauthorized}>;
    } {
        switch (freelancerDashboardStorage) {
            case null {
                let actor_ref = actor("freelancer_dashboard") : actor {
                    createProfile: shared (Text, FreelancerProfile) -> async Result.Result<FreelancerProfile, {#NotFound; #InvalidData; #Unauthorized; #InvalidEmail; #TooManyImages; #InvalidPlanData}>;
                    updateProfile: shared (Text, FreelancerProfile) -> async Result.Result<FreelancerProfile, {#NotFound; #InvalidData; #Unauthorized; #InvalidEmail; #TooManyImages; #InvalidPlanData}>;
                    getProfile: shared (Text) -> async Result.Result<FreelancerProfile, {#NotFound; #Unauthorized; #InvalidEmail}>;
                    getAllProfiles: shared () -> async Result.Result<[(Text, FreelancerProfile)], {#Unauthorized}>;
                    getActiveProfiles: shared () -> async Result.Result<[(Text, FreelancerProfile)], {#Unauthorized}>;
                    getProfilesByCategory: shared (Text) -> async Result.Result<[(Text, FreelancerProfile)], {#Unauthorized}>;
                    getProfilesBySubCategory: shared (Text, Text) -> async Result.Result<[(Text, FreelancerProfile)], {#Unauthorized}>;
                    deleteProfile: shared (Text) -> async Result.Result<(), {#NotFound; #Unauthorized}>;
                    deactivateProfile: shared (Text) -> async Result.Result<FreelancerProfile, {#NotFound; #Unauthorized}>;
                    activateProfile: shared (Text) -> async Result.Result<FreelancerProfile, {#NotFound; #Unauthorized}>;
                    profileExists: shared (Text) -> async Result.Result<Bool, {#Unauthorized}>;
                    getTotalProfiles: shared () -> async Result.Result<Nat, {#Unauthorized}>;
                    getActiveProfilesCount: shared () -> async Result.Result<Nat, {#Unauthorized}>;
                    searchProfilesByTitle: shared (Text) -> async Result.Result<[(Text, FreelancerProfile)], {#Unauthorized}>;
                };
                let storage = {
                    createProfile = actor_ref.createProfile;
                    updateProfile = actor_ref.updateProfile;
                    getProfile = actor_ref.getProfile;
                    getAllProfiles = actor_ref.getAllProfiles;
                    getActiveProfiles = actor_ref.getActiveProfiles;
                    getProfilesByCategory = actor_ref.getProfilesByCategory;
                    getProfilesBySubCategory = actor_ref.getProfilesBySubCategory;
                    deleteProfile = actor_ref.deleteProfile;
                    deactivateProfile = actor_ref.deactivateProfile;
                    activateProfile = actor_ref.activateProfile;
                    profileExists = actor_ref.profileExists;
                    getTotalProfiles = actor_ref.getTotalProfiles;
                    getActiveProfilesCount = actor_ref.getActiveProfilesCount;
                    searchProfilesByTitle = actor_ref.searchProfilesByTitle;
                };
                freelancerDashboardStorage := ?storage;
                storage
            };
            case (?storage) storage;
        }
    };

    private func getICPSwapStorage() : {
        convertCurrency: shared (ConversionRequest) -> async Result.Result<ConversionResponse, {#InvalidToken; #InsufficientBalance; #InsufficientLiquidity; #InvalidAmount; #InvalidRate; #SlippageTooHigh}>;
        createTransaction: shared (TokenSymbol, TokenSymbol, Text, Text, Float, Text) -> async Result.Result<SwapTransaction, {#InvalidToken; #InsufficientBalance; #InsufficientLiquidity; #InvalidAmount; #TransactionNotFound; #PoolNotFound; #Unauthorized; #InvalidRate; #SlippageTooHigh; #TransactionFailed; #InvalidPool}>;
        getTransaction: shared (Text) -> async ?SwapTransaction;
        getUserTransactions: shared (Text) -> async [SwapTransaction];
        updateTransactionStatus: shared (Text, TransactionStatus, ?Text) -> async Result.Result<(), {#InvalidToken; #InsufficientBalance; #InsufficientLiquidity; #InvalidAmount; #TransactionNotFound; #PoolNotFound; #Unauthorized; #InvalidRate; #SlippageTooHigh; #TransactionFailed; #InvalidPool}>;
        getTransactionsByStatus: shared (TransactionStatus) -> async [SwapTransaction];
        getSwapStats: shared () -> async {totalTransactions: Nat; totalVolume: Text; activePools: Nat; totalLiquidity: Text};
        getAllTokens: shared () -> async [(TokenSymbol, TokenInfo)];
        getTokenInfo: shared (TokenSymbol) -> async ?TokenInfo;
    } {
        switch (icpswapStorage) {
            case null {
                let actor_ref = actor("icpswap") : actor {
                    convertCurrency: shared (ConversionRequest) -> async Result.Result<ConversionResponse, {#InvalidToken; #InsufficientBalance; #InsufficientLiquidity; #InvalidAmount; #InvalidRate; #SlippageTooHigh}>;
                    createTransaction: shared (TokenSymbol, TokenSymbol, Text, Text, Float, Text) -> async Result.Result<SwapTransaction, {#InvalidToken; #InsufficientBalance; #InsufficientLiquidity; #InvalidAmount; #TransactionNotFound; #PoolNotFound; #Unauthorized; #InvalidRate; #SlippageTooHigh; #TransactionFailed; #InvalidPool}>;
                    getTransaction: shared (Text) -> async ?SwapTransaction;
                    getUserTransactions: shared (Text) -> async [SwapTransaction];
                    updateTransactionStatus: shared (Text, TransactionStatus, ?Text) -> async Result.Result<(), {#InvalidToken; #InsufficientBalance; #InsufficientLiquidity; #InvalidAmount; #TransactionNotFound; #PoolNotFound; #Unauthorized; #InvalidRate; #SlippageTooHigh; #TransactionFailed; #InvalidPool}>;
                    getTransactionsByStatus: shared (TransactionStatus) -> async [SwapTransaction];
                    getSwapStats: shared () -> async {totalTransactions: Nat; totalVolume: Text; activePools: Nat; totalLiquidity: Text};
                    getAllTokens: shared () -> async [(TokenSymbol, TokenInfo)];
                    getTokenInfo: shared (TokenSymbol) -> async ?TokenInfo;
                };
                let storage = {
                    convertCurrency = actor_ref.convertCurrency;
                    createTransaction = actor_ref.createTransaction;
                    getTransaction = actor_ref.getTransaction;
                    getUserTransactions = actor_ref.getUserTransactions;
                    updateTransactionStatus = actor_ref.updateTransactionStatus;
                    getTransactionsByStatus = actor_ref.getTransactionsByStatus;
                    getSwapStats = actor_ref.getSwapStats;
                    getAllTokens = actor_ref.getAllTokens;
                    getTokenInfo = actor_ref.getTokenInfo;
                };
                icpswapStorage := ?storage;
                storage
            };
            case (?storage) storage;
        }
    };

    private func getHackathonStorage() : {
        createHackathon: shared (Text, HackathonInput) -> async Result.Result<Hackathon, Text>;
        updateHackathon: shared (Text, Text, HackathonUpdate) -> async Result.Result<Hackathon, Text>;
        deleteHackathon: shared (Text, Text) -> async Result.Result<(), Text>;
        registerForHackathon: shared (Text, Text, [Text]) -> async Result.Result<(), Text>;
        submitToHackathon: shared (Text, Text, Text, Text, ?Text, ?Text, ?Text) -> async Result.Result<(), Text>;
        withdrawFromHackathon: shared (Text, Text) -> async Result.Result<(), Text>;
        getHackathon: shared (Text) -> async ?Hackathon;
        getAllHackathons: shared () -> async [Hackathon];
        getHackathonsByStatus: shared (HackathonStatus) -> async [Hackathon];
        getHackathonsByCategory: shared (HackathonCategory) -> async [Hackathon];
        getFeaturedHackathons: shared () -> async [Hackathon];
        getHackathonsByOrganizer: shared (Text) -> async [Hackathon];
        getUserHackathons: shared (Text) -> async [Hackathon];
        searchHackathons: shared (HackathonSearchFilters) -> async [Hackathon];
        getHackathonStats: shared () -> async HackathonStats;
        updateParticipantStatus: shared (Text, Text, HackathonParticipantStatus, Text) -> async Result.Result<(), Text>;
        setWinners: shared (Text, [Text], Text) -> async Result.Result<(), Text>;
    } {
        switch (hackathonStorage) {
            case null {
                let actor_ref = actor("hackathon_store") : actor {
                    createHackathon: shared (Text, HackathonInput) -> async Result.Result<Hackathon, Text>;
                    updateHackathon: shared (Text, Text, HackathonUpdate) -> async Result.Result<Hackathon, Text>;
                    deleteHackathon: shared (Text, Text) -> async Result.Result<(), Text>;
                    registerForHackathon: shared (Text, Text, [Text]) -> async Result.Result<(), Text>;
                    submitToHackathon: shared (Text, Text, Text, Text, ?Text, ?Text, ?Text) -> async Result.Result<(), Text>;
                    withdrawFromHackathon: shared (Text, Text) -> async Result.Result<(), Text>;
                    getHackathon: shared (Text) -> async ?Hackathon;
                    getAllHackathons: shared () -> async [Hackathon];
                    getHackathonsByStatus: shared (HackathonStatus) -> async [Hackathon];
                    getHackathonsByCategory: shared (HackathonCategory) -> async [Hackathon];
                    getFeaturedHackathons: shared () -> async [Hackathon];
                    getHackathonsByOrganizer: shared (Text) -> async [Hackathon];
                    getUserHackathons: shared (Text) -> async [Hackathon];
                    searchHackathons: shared (HackathonSearchFilters) -> async [Hackathon];
                    getHackathonStats: shared () -> async HackathonStats;
                    updateParticipantStatus: shared (Text, Text, HackathonParticipantStatus, Text) -> async Result.Result<(), Text>;
                    setWinners: shared (Text, [Text], Text) -> async Result.Result<(), Text>;
                };
                let storage = {
                    createHackathon = actor_ref.createHackathon;
                    updateHackathon = actor_ref.updateHackathon;
                    deleteHackathon = actor_ref.deleteHackathon;
                    registerForHackathon = actor_ref.registerForHackathon;
                    submitToHackathon = actor_ref.submitToHackathon;
                    withdrawFromHackathon = actor_ref.withdrawFromHackathon;
                    getHackathon = actor_ref.getHackathon;
                    getAllHackathons = actor_ref.getAllHackathons;
                    getHackathonsByStatus = actor_ref.getHackathonsByStatus;
                    getHackathonsByCategory = actor_ref.getHackathonsByCategory;
                    getFeaturedHackathons = actor_ref.getFeaturedHackathons;
                    getHackathonsByOrganizer = actor_ref.getHackathonsByOrganizer;
                    getUserHackathons = actor_ref.getUserHackathons;
                    searchHackathons = actor_ref.searchHackathons;
                    getHackathonStats = actor_ref.getHackathonStats;
                    updateParticipantStatus = actor_ref.updateParticipantStatus;
                    setWinners = actor_ref.setWinners;
                };
                hackathonStorage := ?storage;
                storage
            };
            case (?storage) storage;
        }
    };

    // Escrow storage initialization
    private func getEscrowStorage() : {
        deposit: shared (Balance) -> async Result.Result<Balance, Text>;
        withdraw: shared (Balance) -> async Result.Result<Balance, Text>;
        getMyBalance: shared () -> async Balance;
        createEscrow: shared (CreateEscrowArgs) -> async Result.Result<EscrowId, Text>;
        buyerApprove: shared (EscrowId) -> async Result.Result<Text, Text>;
        sellerApprove: shared (EscrowId) -> async Result.Result<Text, Text>;
        cancelEscrow: shared (EscrowId) -> async Result.Result<Text, Text>;
        raiseDispute: shared (EscrowId) -> async Result.Result<Text, Text>;
        resolveDispute: shared (EscrowId, Bool) -> async Result.Result<Text, Text>;
        raiseClientDispute: shared (EscrowId, Text) -> async Result.Result<Text, Text>;
        raiseFreelancerDispute: shared (EscrowId, Text) -> async Result.Result<Text, Text>;
        getEscrow: shared (EscrowId) -> async ?EscrowAgreement;
        getMyEscrows: shared () -> async [EscrowAgreement];
        getArbitrationEscrows: shared () -> async [EscrowAgreement];
        getPlatformFeeBalance: shared () -> async Balance;
        getPlatformFeeStats: shared () -> async { totalFees: Balance; totalTransactions: Nat; collectedFees: Balance; };
        getEscrowsByService: shared (Text) -> async [EscrowAgreement];
        checkOverdueProjects: shared () -> async Result.Result<[EscrowId], Text>;
    } {
        switch (escrowStorage) {
            case null {
                let actor_ref = actor("escrow") : actor {
                    deposit: shared (Balance) -> async Result.Result<Balance, Text>;
                    withdraw: shared (Balance) -> async Result.Result<Balance, Text>;
                    getMyBalance: shared () -> async Balance;
                    createEscrow: shared (CreateEscrowArgs) -> async Result.Result<EscrowId, Text>;
                    buyerApprove: shared (EscrowId) -> async Result.Result<Text, Text>;
                    sellerApprove: shared (EscrowId) -> async Result.Result<Text, Text>;
                    cancelEscrow: shared (EscrowId) -> async Result.Result<Text, Text>;
                    raiseDispute: shared (EscrowId) -> async Result.Result<Text, Text>;
                    resolveDispute: shared (EscrowId, Bool) -> async Result.Result<Text, Text>;
                    raiseClientDispute: shared (EscrowId, Text) -> async Result.Result<Text, Text>;
                    raiseFreelancerDispute: shared (EscrowId, Text) -> async Result.Result<Text, Text>;
                    getEscrow: shared (EscrowId) -> async ?EscrowAgreement;
                    getMyEscrows: shared () -> async [EscrowAgreement];
                    getArbitrationEscrows: shared () -> async [EscrowAgreement];
                    getPlatformFeeBalance: shared () -> async Balance;
                    getPlatformFeeStats: shared () -> async { totalFees: Balance; totalTransactions: Nat; collectedFees: Balance; };
                    getEscrowsByService: shared (Text) -> async [EscrowAgreement];
                    checkOverdueProjects: shared () -> async Result.Result<[EscrowId], Text>;
                };
                let storage = {
                    deposit = actor_ref.deposit;
                    withdraw = actor_ref.withdraw;
                    getMyBalance = actor_ref.getMyBalance;
                    createEscrow = actor_ref.createEscrow;
                    buyerApprove = actor_ref.buyerApprove;
                    sellerApprove = actor_ref.sellerApprove;
                    cancelEscrow = actor_ref.cancelEscrow;
                    raiseDispute = actor_ref.raiseDispute;
                    resolveDispute = actor_ref.resolveDispute;
                    raiseClientDispute = actor_ref.raiseClientDispute;
                    raiseFreelancerDispute = actor_ref.raiseFreelancerDispute;
                    getEscrow = actor_ref.getEscrow;
                    getMyEscrows = actor_ref.getMyEscrows;
                    getArbitrationEscrows = actor_ref.getArbitrationEscrows;
                    getPlatformFeeBalance = actor_ref.getPlatformFeeBalance;
                    getPlatformFeeStats = actor_ref.getPlatformFeeStats;
                    getEscrowsByService = actor_ref.getEscrowsByService;
                    checkOverdueProjects = actor_ref.checkOverdueProjects;
                };
                escrowStorage := ?storage;
                storage
            };
            case (?storage) storage;
        }
    };

    // AUTHENTICATION FUNCTIONS

    // Helper function to convert UserType text to enum
    func parseUserType(userTypeText: Text) : ?UserType {
        switch (userTypeText) {
            case ("freelancer") { ?#freelancer };
            case ("client") { ?#client };
            case _ { null };
        }
    };

    // Helper function to convert AuthError to main Error
    func convertAuthError(authError: AuthError) : Error {
        switch (authError) {
            case (#UserAlreadyExists) { #UserAlreadyExists };
            case (#UserNotFound) { #UserNotFound };
            case (#InvalidCredentials) { #InvalidCredentials };
            case (#InvalidEmail) { #InvalidEmail };
            case (#WeakPassword) { #WeakPassword };
        }
    };

    // Helper function to validate session and get user info
    func validateSessionAndGetUser(sessionId: Text) : ?SessionManager.Session {
        sessionManager.validateSession(sessionId)
    };

    // Helper function to check if user type matches expected type
    func _validateUserType(session: SessionManager.Session, expectedType: Text) : Bool {
        session.userType == expectedType
    };

    // Signup new user
    public func signup(email: Text, password: Text, userType: Text) : async Result.Result<{sessionId: Text; user: User}, Error> {
        if (Text.size(email) == 0) {
            return #err(#EmailRequired);
        };

        switch (parseUserType(userType)) {
            case null { return #err(#InvalidUserType); };
            case (?userTypeEnum) {
                switch (auth.signup(email, password, userTypeEnum)) {
                    case (#err(authError)) { 
                        #err(convertAuthError(authError))
                    };
                    case (#ok(user)) {
                        let sessionId = await sessionManager.createSession(email, userType);
                        #ok({sessionId = sessionId; user = user})
                    };
                }
            };
        }
    };

    // Login user and create session
    public func login(email: Text, password: Text) : async Result.Result<{sessionId: Text; user: User}, Error> {
        if (Text.size(email) == 0) {
            return #err(#EmailRequired);
        };

        switch (auth.login(email, password)) {
            case (#err(authError)) { 
                #err(convertAuthError(authError))
            };
            case (#ok(user)) {
                let userTypeText = switch (user.userType) {
                    case (#freelancer) { "freelancer" };
                    case (#client) { "client" };
                };
                let sessionId = await sessionManager.createSession(email, userTypeText);
                #ok({sessionId = sessionId; user = user})
            };
        }
    };

    // Register new user (legacy function for backward compatibility)
    public func registerUser(userType: Text, email: Text, password: Text) : async Result.Result<(), Error> {
        switch (await signup(email, password, userType)) {
            case (#ok(_)) { #ok(()) };
            case (#err(error)) { #err(error) };
        }
    };

    // Login user and create session (legacy function for backward compatibility)
    public func loginUser(userType: Text, email: Text, password: Text) : async Result.Result<SessionInfo, Error> {
        if (Text.size(email) == 0) {
            return #err(#EmailRequired);
        };

        if (userType != "client" and userType != "freelancer") {
            return #err(#InvalidUserType);
        };

        switch (auth.login(email, password)) {
            case (#err(authError)) { 
                #err(convertAuthError(authError))
            };
            case (#ok(_user)) {
                let sessionId = await sessionManager.createSession(email, userType);
                
                switch (sessionManager.getSessionInfo(sessionId)) {
                    case null { #err(#InvalidSession) };
                    case (?sessionInfo) { #ok(sessionInfo) };
                }
            };
        }
    };


    // Verify OTP (placeholder - implement based on your OTP system)
    public func verifyOTP(_userId: Text, _otp: Text) : async Result.Result<Text, Error> {
        // This is a placeholder implementation
        // You would need to implement actual OTP verification logic
        #ok("OTP verified successfully")
    };

    // Resend OTP (placeholder - implement based on your OTP system)
    public func resendOTP(_userId: Text) : async Result.Result<Text, Error> {
        // This is a placeholder implementation
        // You would need to implement actual OTP resending logic
        #ok("OTP sent successfully")
    };

    // Change password (placeholder - implement based on your OTP system)
    public func changePassword(_userId: Text, _otp: Text, _newPassword: Text) : async Result.Result<Text, Error> {
        // This is a placeholder implementation
        // You would need to implement actual password change with OTP verification
        #ok("Password changed successfully")
    };
    public func logoutUser(sessionId: Text) : async Result.Result<(), Error> {
        if (sessionManager.removeSession(sessionId)) {
            #ok(())
        } else {
            #err(#InvalidSession)
        }
    };

    // Validate session
    public func validateUserSession(sessionId: Text) : async Result.Result<SessionInfo, Error> {
        switch (sessionManager.getSessionInfo(sessionId)) {
            case null { #err(#InvalidSession) };
            case (?sessionInfo) { #ok(sessionInfo) };
        }
    };

    // FREELANCER FUNCTIONS

    // Create freelancer profile
    public func createFreelancerProfile(sessionId: Text, freelancer: Freelancer) : async Result.Result<(), Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                if (session.userType != "freelancer") {
                    return #err(#InvalidUserType);
                };

                try {
                    let result = await getFreelancerStorage().storeFreelancer(session.email, freelancer);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(_err)) { 
                            #err(#StorageError("Failed to store freelancer: "))
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("Storage canister error"))
                }
            };
        }
    };

    // Update freelancer profile
    public func updateFreelancerProfile(sessionId: Text, freelancer: Freelancer) : async Result.Result<(), Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                if (session.userType != "freelancer") {
                    return #err(#InvalidUserType);
                };

                try {
                    let result = await getFreelancerStorage().updateFreelancer(session.email, freelancer);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (_err) { 
                            #err(#StorageError("Failed to update freelancer"))
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("Storage canister error"))
                }
            };
        }
    };

    // Get freelancer profile
    public func getFreelancerProfile(sessionId: Text) : async Result.Result<Freelancer, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                if (session.userType != "freelancer") {
                    return #err(#InvalidUserType);
                };

                try {
                    let result = await getFreelancerStorage().getFreelancer(session.email);
                    switch (result) {
                        case (#ok(freelancer)) { #ok(freelancer) };
                        case (#err(_err)) { 
                            #err(#StorageError("Failed to get freelancer"))
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("Storage canister error"))
                }
            };
        }
    };

    // Get all freelancers (for clients to browse)
    public func getAllFreelancers(sessionId: Text) : async Result.Result<[(Text, Freelancer)], Error> {
        switch (validateSessionAndGetUser(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                // Add admin check here if needed
                try {
                    let result = await getFreelancerStorage().getAllFreelancers();
                    switch (result) {
                        case (#ok(freelancers)) { #ok(freelancers) };
                        case (#err(_err)) { 
                            #err(#StorageError("Failed to get all freelancers"))
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("Storage canister error"))
                }
            };
        }
    };

    // CLIENT FUNCTIONS

    // Create client profile
    public func createClientProfile(sessionId: Text, client: Client) : async Result.Result<(), Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                if (session.userType != "client") {
                    return #err(#InvalidUserType);
                };

                try {
                    let result = await getClientStorage().storeClient(session.email, client);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(_err)) { 
                            #err(#StorageError("Failed to store client"))
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("Storage canister error"))
                }
            };
        }
    };

    // Update client profile
    public func updateClientProfile(sessionId: Text, client: Client) : async Result.Result<(), Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                if (session.userType != "client") {
                    return #err(#InvalidUserType);
                };

                try {
                    let result = await getClientStorage().updateClient(session.email, client);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(_err)) { 
                            #err(#StorageError("Failed to update client"))
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("Storage canister error"))
                }
            };
        }
    };

    // Get client profile
    public func getClientProfile(sessionId: Text) : async Result.Result<Client, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                if (session.userType != "client") {
                    return #err(#InvalidUserType);
                };

                try {
                    let result = await getClientStorage().getClient(session.email);
                    switch (result) {
                        case (#ok(client)) { #ok(client) };
                        case (#err(_err)) { 
                            #err(#StorageError("Failed to get client: "))
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("Storage canister error"))
                }
            };
        }
    };

    // Get all clients
    public func getAllClients(sessionId: Text) : async Result.Result<[(Text, Client)], Error> {
        switch (validateSessionAndGetUser(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                // Add admin check here if needed
                try {
                    let result = await getClientStorage().getAllClients();
                    switch (result) {
                        case (#ok(clients)) { #ok(clients) };
                        case (#err(_err)) { 
                            #err(#StorageError("Failed to get all clients"))
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("Storage canister error"))
                }
            };
        }
    };

    // UTILITY FUNCTIONS
    
    // Get active session count
    public func getActiveSessionCount() : async Nat {
        sessionManager.getActiveSessionCount()
    };

    // Get user info from session
    public func getUserInfo(sessionId: Text) : async Result.Result<{email: Text; userType: Text; expiresAt: Int}, Error> {
        switch (validateSessionAndGetUser(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                #ok({
                    email = session.email;
                    userType = session.userType;
                    expiresAt = session.expiresAt;
                })
            };
        }
    };

    // Get session info
    public func getSessionInfo(sessionId: Text) : async ?SessionInfo {
        sessionManager.getSessionInfo(sessionId)
    };

    // Check if session is valid
    public func isSessionValid(sessionId: Text) : async Bool {
        switch (validateSessionAndGetUser(sessionId)) {
            case null { false };
            case (?_) { true };
        }
    };

    // Get user by email (backward compatible)
    public func getUserByEmail(email: Text) : async Result.Result<User, Error> {
        switch (auth.getUserByEmail(email)) {
            case null { #err(#UserNotFound) };
            case (?user) { #ok(user) };
        }
    };

    // Get user by email with session validation (admin function)
    public func getUserByEmailWithSession(sessionId: Text, email: Text) : async Result.Result<User, Error> {
        switch (validateSessionAndGetUser(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                // Add admin check here if needed
                switch (auth.getUserByEmail(email)) {
                    case null { #err(#UserNotFound) };
                    case (?user) { #ok(user) };
                }
            };
        }
    };


    // ADMIN FUNCTIONS

    // Update canister IDs (admin function)
    public func updateCanisterIds(
        _freelancerId: ?Text,
        _clientId: ?Text,
        _messageId: ?Text,
        _onboardingId: ?Text,
        _bountiesId: ?Text
    ) : async Result.Result<(), Error> {
        // This function allows updating canister IDs after deployment
        // For now, we'll just return success since we're using hardcoded names
        // In the future, this could be used to update the actor references dynamically
        #ok(())
    };

    // MESSAGE FUNCTIONS

    // Send a message
    public func sendMessage(sessionId: Text, to: Text, content: Text, messageType: MessageType, clientTimestamp: Int) : async Result.Result<Message, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getMessageStorage().storeMessage(session.email, to, content, clientTimestamp, messageType);
                    switch (result) {
                        case (#ok(message)) { #ok(message) };
                        case (#err(msgError)) { 
                            switch (msgError) {
                                case (#InvalidEmail) { #err(#InvalidEmail) };
                                case (#InvalidMessage) { #err(#StorageError("Invalid message")) };
                                case (#StorageError(msg)) { #err(#StorageError(msg)) };
                                case _ { #err(#StorageError("Failed to send message")) };
                            }
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("Message storage canister error"))
                }
            };
        }
    };

    // Get conversation messages
    public func getConversationMessages(sessionId: Text, otherUser: Text, limit: ?Nat, offset: ?Nat) : async Result.Result<[Message], Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getMessageStorage().getConversationMessages(session.email, otherUser, limit, offset);
                    switch (result) {
                        case (#ok(messages)) { #ok(messages) };
                        case (#err(msgError)) { 
                            switch (msgError) {
                                case (#InvalidEmail) { #err(#InvalidEmail) };
                                case (#StorageError(msg)) { #err(#StorageError(msg)) };
                                case _ { #err(#StorageError("Failed to get messages")) };
                            }
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("Message storage canister error"))
                }
            };
        }
    };

    // Mark message as read
    public func markMessageAsRead(sessionId: Text, messageId: Text) : async Result.Result<(), Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getMessageStorage().markMessageAsRead(messageId, session.email);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(msgError)) { 
                            switch (msgError) {
                                case (#NotFound) { #err(#StorageError("Message not found")) };
                                case (#Unauthorized) { #err(#StorageError("Unauthorized")) };
                                case (#InvalidEmail) { #err(#InvalidEmail) };
                                case (#StorageError(msg)) { #err(#StorageError(msg)) };
                                case _ { #err(#StorageError("Failed to mark message as read")) };
                            }
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("Message storage canister error"))
                }
            };
        }
    };

    // Get user conversations
    public func getUserConversations(sessionId: Text) : async Result.Result<[ConversationSummary], Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getMessageStorage().getUserConversations(session.email);
                    switch (result) {
                        case (#ok(conversations)) { #ok(conversations) };
                        case (#err(msgError)) { 
                            switch (msgError) {
                                case (#InvalidEmail) { #err(#InvalidEmail) };
                                case (#StorageError(msg)) { #err(#StorageError(msg)) };
                                case _ { #err(#StorageError("Failed to get conversations")) };
                            }
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("Message storage canister error"))
                }
            };
        }
    };

    // Get unread message count
    public func getUnreadMessageCount(sessionId: Text) : async Result.Result<Nat, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getMessageStorage().getUnreadMessageCount(session.email);
                    switch (result) {
                        case (#ok(count)) { #ok(count) };
                        case (#err(msgError)) { 
                            switch (msgError) {
                                case (#InvalidEmail) { #err(#InvalidEmail) };
                                case (#StorageError(msg)) { #err(#StorageError(msg)) };
                                case _ { #err(#StorageError("Failed to get unread count")) };
                            }
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("Message storage canister error"))
                }
            };
        }
    };

    // Delete a message
    public func deleteMessage(sessionId: Text, messageId: Text) : async Result.Result<(), Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getMessageStorage().deleteMessage(messageId, session.email);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(msgError)) { 
                            switch (msgError) {
                                case (#NotFound) { #err(#StorageError("Message not found")) };
                                case (#Unauthorized) { #err(#StorageError("Unauthorized")) };
                                case (#InvalidEmail) { #err(#InvalidEmail) };
                                case (#StorageError(msg)) { #err(#StorageError(msg)) };
                                case _ { #err(#StorageError("Failed to delete message")) };
                            }
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("Message storage canister error"))
                }
            };
        }
    };

    // ===== ONBOARDING FUNCTIONS =====

    // Create onboarding record
    public func createOnboardingRecord(sessionId: Text, userType: Text) : async Result.Result<(), Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getOnboardingStorage().createOnboardingRecord(session.email, userType);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(onboardingError)) { 
                            switch (onboardingError) {
                                case (#InvalidEmail) { #err(#InvalidEmail) };
                                case (#InvalidUserType) { #err(#InvalidUserType) };
                                case (#StorageError(msg)) { #err(#StorageError(msg)) };
                                case _ { #err(#StorageError("Failed to create onboarding record")) };
                            }
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("Onboarding storage canister error"))
                }
            };
        }
    };

    // Update onboarding step
    public func updateOnboardingStep(
        sessionId: Text,
        profileMethod: ?ProfileMethod,
        personalInfo: ?PersonalInfo,
        skills: ?[Text],
        address: ?AddressData,
        profile: ?ProfileData,
        final: ?FinalData,
        companyData: ?CompanyData
    ) : async Result.Result<(), Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getOnboardingStorage().updateOnboardingStep(
                        session.email, 
                        profileMethod, 
                        personalInfo, 
                        skills, 
                        address, 
                        profile, 
                        final, 
                        companyData
                    );
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(onboardingError)) { 
                            switch (onboardingError) {
                                case (#NotFound) { #err(#StorageError("Onboarding record not found")) };
                                case (#InvalidEmail) { #err(#InvalidEmail) };
                                case (#InvalidData) { #err(#StorageError("Invalid onboarding data")) };
                                case (#StorageError(msg)) { #err(#StorageError(msg)) };
                                case _ { #err(#StorageError("Failed to update onboarding step")) };
                            }
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("Onboarding storage canister error"))
                }
            };
        }
    };

    // Complete onboarding
    public func completeOnboarding(sessionId: Text) : async Result.Result<(), Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getOnboardingStorage().completeOnboarding(session.email);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(onboardingError)) { 
                            switch (onboardingError) {
                                case (#NotFound) { #err(#StorageError("Onboarding record not found")) };
                                case (#InvalidEmail) { #err(#InvalidEmail) };
                                case (#StorageError(msg)) { #err(#StorageError(msg)) };
                                case _ { #err(#StorageError("Failed to complete onboarding")) };
                            }
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("Onboarding storage canister error"))
                }
            };
        }
    };

    // Get onboarding record
    public func getOnboardingRecord(sessionId: Text) : async Result.Result<OnboardingRecord, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getOnboardingStorage().getOnboardingRecord(session.email);
                    switch (result) {
                        case (#ok(record)) { #ok(record) };
                        case (#err(onboardingError)) { 
                            switch (onboardingError) {
                                case (#NotFound) { #err(#StorageError("Onboarding record not found")) };
                                case (#InvalidEmail) { #err(#InvalidEmail) };
                                case (#StorageError(msg)) { #err(#StorageError(msg)) };
                                case _ { #err(#StorageError("Failed to get onboarding record")) };
                            }
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("Onboarding storage canister error"))
                }
            };
        }
    };

    // Get all onboarding records (admin function)
    public func getAllOnboardingRecords(sessionId: Text) : async Result.Result<[(Text, OnboardingRecord)], Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getOnboardingStorage().getAllOnboardingRecords();
                    switch (result) {
                        case (#ok(records)) { #ok(records) };
                        case (#err(onboardingError)) { 
                            switch (onboardingError) {
                                case (#StorageError(msg)) { #err(#StorageError(msg)) };
                                case _ { #err(#StorageError("Failed to get all onboarding records")) };
                            }
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("Onboarding storage canister error"))
                }
            };
        }
    };

    // Get onboarding records by status
    public func getOnboardingRecordsByStatus(sessionId: Text, isComplete: Bool) : async Result.Result<[(Text, OnboardingRecord)], Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getOnboardingStorage().getOnboardingRecordsByStatus(isComplete);
                    switch (result) {
                        case (#ok(records)) { #ok(records) };
                        case (#err(onboardingError)) { 
                            switch (onboardingError) {
                                case (#StorageError(msg)) { #err(#StorageError(msg)) };
                                case _ { #err(#StorageError("Failed to get onboarding records by status")) };
                            }
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("Onboarding storage canister error"))
                }
            };
        }
    };

    // Get onboarding records by user type
    public func getOnboardingRecordsByUserType(sessionId: Text, userType: Text) : async Result.Result<[(Text, OnboardingRecord)], Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getOnboardingStorage().getOnboardingRecordsByUserType(userType);
                    switch (result) {
                        case (#ok(records)) { #ok(records) };
                        case (#err(onboardingError)) { 
                            switch (onboardingError) {
                                case (#InvalidUserType) { #err(#InvalidUserType) };
                                case (#StorageError(msg)) { #err(#StorageError(msg)) };
                                case _ { #err(#StorageError("Failed to get onboarding records by user type")) };
                            }
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("Onboarding storage canister error"))
                }
            };
        }
    };

    // Get onboarding statistics
    public func getOnboardingStats(sessionId: Text) : async Result.Result<{
        totalRecords: Nat;
        completedRecords: Nat;
        pendingRecords: Nat;
        freelancerRecords: Nat;
        clientRecords: Nat;
    }, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getOnboardingStorage().getOnboardingStats();
                    switch (result) {
                        case (#ok(stats)) { #ok(stats) };
                        case (#err(onboardingError)) { 
                            switch (onboardingError) {
                                case (#StorageError(msg)) { #err(#StorageError(msg)) };
                                case _ { #err(#StorageError("Failed to get onboarding statistics")) };
                            }
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("Onboarding storage canister error"))
                }
            };
        }
    };

    // BOUNTIES FUNCTIONS

    // Create a new bounty
    public func createBounty(sessionId: Text, input: BountyInput) : async Result.Result<Bounty, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getBountiesStorage().createBounty(session.email, input);
                    switch (result) {
                        case (#ok(bounty)) { #ok(bounty) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (_error) {
                    #err(#StorageError("Bounties storage canister error"))
                }
            };
        }
    };

    // Update an existing bounty
    public func updateBounty(sessionId: Text, bountyId: Text, update: BountyUpdate) : async Result.Result<Bounty, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getBountiesStorage().updateBounty(bountyId, session.email, update);
                    switch (result) {
                        case (#ok(bounty)) { #ok(bounty) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (_error) {
                    #err(#StorageError("Bounties storage canister error"))
                }
            };
        }
    };

    // Register for a bounty
    public func registerForBounty(sessionId: Text, bountyId: Text) : async Result.Result<(), Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getBountiesStorage().registerForBounty(bountyId, session.email);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (_error) {
                    #err(#StorageError("Bounties storage canister error"))
                }
            };
        }
    };

    // Submit to a bounty
    public func submitToBounty(sessionId: Text, bountyId: Text, submissionUrl: Text, description: Text) : async Result.Result<(), Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getBountiesStorage().submitToBounty(bountyId, session.email, submissionUrl, description);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (_error) {
                    #err(#StorageError("Bounties storage canister error"))
                }
            };
        }
    };

    // Get bounty by ID
    public func getBounty(bountyId: Text) : async ?Bounty {
        try {
            await getBountiesStorage().getBounty(bountyId)
        } catch (_error) {
            null
        }
    };

    // Get all bounties
    public func getAllBounties() : async [Bounty] {
        try {
            await getBountiesStorage().getAllBounties()
        } catch (_error) {
            []
        }
    };

    // Get bounties by status
    public func getBountiesByStatus(status: BountyStatus) : async [Bounty] {
        try {
            await getBountiesStorage().getBountiesByStatus(status)
        } catch (_error) {
            []
        }
    };

    // Get bounties by category
    public func getBountiesByCategory(category: BountyCategory) : async [Bounty] {
        try {
            await getBountiesStorage().getBountiesByCategory(category)
        } catch (_error) {
            []
        }
    };

    // Get featured bounties
    public func getFeaturedBounties() : async [Bounty] {
        try {
            await getBountiesStorage().getFeaturedBounties()
        } catch (_error) {
            []
        }
    };

    // Get bounties by organizer
    public func getBountiesByOrganizer(sessionId: Text) : async Result.Result<[Bounty], Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let bounties = await getBountiesStorage().getBountiesByOrganizer(session.email);
                    #ok(bounties)
                } catch (_error) {
                    #err(#StorageError("Bounties storage canister error"))
                }
            };
        }
    };

    // Get user's registered bounties
    public func getUserBounties(sessionId: Text) : async Result.Result<[Bounty], Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let bounties = await getBountiesStorage().getUserBounties(session.email);
                    #ok(bounties)
                } catch (_error) {
                    #err(#StorageError("Bounties storage canister error"))
                }
            };
        }
    };

    // Get bounty statistics
    public func getBountyStats() : async BountyStats {
        try {
            await getBountiesStorage().getBountyStats()
        } catch (_error) {
            {
                totalBounties = 0;
                openBounties = 0;
                completedBounties = 0;
                totalPrizePool = "$0";
                totalParticipants = 0;
            }
        }
    };

    // Delete bounty (organizer only)
    public func deleteBounty(sessionId: Text, bountyId: Text) : async Result.Result<(), Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getBountiesStorage().deleteBounty(bountyId, session.email);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (_error) {
                    #err(#StorageError("Bounties storage canister error"))
                }
            };
        }
    };

    // FREELANCER DASHBOARD FUNCTIONS

    // Create freelancer dashboard profile
    public func createFreelancerDashboardProfile(sessionId: Text, profile: FreelancerProfile) : async Result.Result<FreelancerProfile, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                if (session.userType != "freelancer") {
                    return #err(#InvalidUserType);
                };

                try {
                    let result = await getFreelancerDashboardStorage().createProfile(session.email, profile);
                    switch (result) {
                        case (#ok(createdProfile)) { #ok(createdProfile) };
                        case (#err(dashboardError)) { 
                            switch (dashboardError) {
                                case (#InvalidData) { #err(#StorageError("Invalid profile data")) };
                                case (#TooManyImages) { #err(#StorageError("Too many portfolio images (max 5)")) };
                                case (#InvalidPlanData) { #err(#StorageError("Invalid plan data")) };
                                case _ { #err(#StorageError("Failed to create freelancer profile")) };
                            }
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("Freelancer dashboard storage canister error"))
                }
            };
        }
    };

    // Update freelancer dashboard profile
    public func updateFreelancerDashboardProfile(sessionId: Text, profile: FreelancerProfile) : async Result.Result<FreelancerProfile, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                if (session.userType != "freelancer") {
                    return #err(#InvalidUserType);
                };

                try {
                    let result = await getFreelancerDashboardStorage().updateProfile(session.email, profile);
                    switch (result) {
                        case (#ok(updatedProfile)) { #ok(updatedProfile) };
                        case (#err(dashboardError)) { 
                            switch (dashboardError) {
                                case (#NotFound) { #err(#StorageError("Profile not found")) };
                                case (#InvalidData) { #err(#StorageError("Invalid profile data")) };
                                case (#TooManyImages) { #err(#StorageError("Too many portfolio images (max 5)")) };
                                case (#InvalidPlanData) { #err(#StorageError("Invalid plan data")) };
                                case _ { #err(#StorageError("Failed to update freelancer profile")) };
                            }
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("Freelancer dashboard storage canister error"))
                }
            };
        }
    };

    // Get freelancer dashboard profile
    public func getFreelancerDashboardProfile(sessionId: Text) : async Result.Result<FreelancerProfile, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                if (session.userType != "freelancer") {
                    return #err(#InvalidUserType);
                };

                try {
                    let result = await getFreelancerDashboardStorage().getProfile(session.email);
                    switch (result) {
                        case (#ok(profile)) { #ok(profile) };
                        case (#err(dashboardError)) { 
                            switch (dashboardError) {
                                case (#NotFound) { #err(#StorageError("Profile not found")) };
                                case _ { #err(#StorageError("Failed to get freelancer profile")) };
                            }
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("Freelancer dashboard storage canister error"))
                }
            };
        }
    };

    // Get all active freelancer profiles (for clients to browse)
    public func getAllActiveFreelancerProfiles(sessionId: Text) : async Result.Result<[(Text, FreelancerProfile)], Error> {
        switch (validateSessionAndGetUser(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getFreelancerDashboardStorage().getActiveProfiles();
                    switch (result) {
                        case (#ok(profiles)) { #ok(profiles) };
                        case (#err(_dashboardError)) { 
                            #err(#StorageError("Failed to get active freelancer profiles"))
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("Freelancer dashboard storage canister error"))
                }
            };
        }
    };

    // Delete freelancer dashboard profile
    public func deleteFreelancerDashboardProfile(sessionId: Text) : async Result.Result<(), Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                if (session.userType != "freelancer") {
                    return #err(#InvalidUserType);
                };

                try {
                    let result = await getFreelancerDashboardStorage().deleteProfile(session.email);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(dashboardError)) { 
                            switch (dashboardError) {
                                case (#NotFound) { #err(#StorageError("Profile not found")) };
                                case _ { #err(#StorageError("Failed to delete freelancer profile")) };
                            }
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("Freelancer dashboard storage canister error"))
                }
            };
        }
    };

    // ===== ICPSWAP FUNCTIONS =====

    // Convert currency
    public func convertCurrency(sessionId: Text, request: ConversionRequest): async Result.Result<ConversionResponse, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getICPSwapStorage().convertCurrency(request);
                    switch (result) {
                        case (#ok(response)) { #ok(response) };
                        case (#err(swapError)) { 
                            switch (swapError) {
                                case (#InvalidToken) { #err(#InvalidToken) };
                                case (#InsufficientBalance) { #err(#InsufficientBalance) };
                                case (#InsufficientLiquidity) { #err(#InsufficientLiquidity) };
                                case (#InvalidAmount) { #err(#InvalidAmount) };
                                case (#InvalidRate) { #err(#InvalidRate) };
                                case (#SlippageTooHigh) { #err(#SlippageTooHigh) };
                            }
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("ICPSwap canister error"))
                }
            };
        }
    };

    // Create swap transaction
    public func createSwapTransaction(
        sessionId: Text,
        from: TokenSymbol,
        to: TokenSymbol,
        amount: Text,
        converted: Text,
        rate: Float
    ): async Result.Result<SwapTransaction, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getICPSwapStorage().createTransaction(from, to, amount, converted, rate, session.email);
                    switch (result) {
                        case (#ok(transaction)) { #ok(transaction) };
                        case (#err(swapError)) { 
                            switch (swapError) {
                                case (#InvalidToken) { #err(#InvalidToken) };
                                case (#InsufficientBalance) { #err(#InsufficientBalance) };
                                case (#InsufficientLiquidity) { #err(#InsufficientLiquidity) };
                                case (#InvalidAmount) { #err(#InvalidAmount) };
                                case (#TransactionNotFound) { #err(#TransactionNotFound) };
                                case (#PoolNotFound) { #err(#PoolNotFound) };
                                case (#Unauthorized) { #err(#Unauthorized) };
                                case (#InvalidRate) { #err(#InvalidRate) };
                                case (#SlippageTooHigh) { #err(#SlippageTooHigh) };
                                case (#TransactionFailed) { #err(#TransactionFailed) };
                                case (#InvalidPool) { #err(#InvalidPool) };
                            }
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("ICPSwap canister error"))
                }
            };
        }
    };

    // Get transaction by ID
    public func getSwapTransaction(id: Text): async ?SwapTransaction {
        try {
            await getICPSwapStorage().getTransaction(id)
        } catch (_error) {
            null
        }
    };

    // Get user transactions
    public func getUserSwapTransactions(sessionId: Text): async Result.Result<[SwapTransaction], Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let transactions = await getICPSwapStorage().getUserTransactions(session.email);
                    #ok(transactions)
                } catch (_error) {
                    #err(#StorageError("ICPSwap canister error"))
                }
            };
        }
    };

    // Update transaction status
    public func updateSwapTransactionStatus(
        sessionId: Text,
        id: Text,
        status: TransactionStatus,
        txHash: ?Text
    ): async Result.Result<(), Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getICPSwapStorage().updateTransactionStatus(id, status, txHash);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(swapError)) { 
                            switch (swapError) {
                                case (#InvalidToken) { #err(#InvalidToken) };
                                case (#InsufficientBalance) { #err(#InsufficientBalance) };
                                case (#InsufficientLiquidity) { #err(#InsufficientLiquidity) };
                                case (#InvalidAmount) { #err(#InvalidAmount) };
                                case (#TransactionNotFound) { #err(#TransactionNotFound) };
                                case (#PoolNotFound) { #err(#PoolNotFound) };
                                case (#Unauthorized) { #err(#Unauthorized) };
                                case (#InvalidRate) { #err(#InvalidRate) };
                                case (#SlippageTooHigh) { #err(#SlippageTooHigh) };
                                case (#TransactionFailed) { #err(#TransactionFailed) };
                                case (#InvalidPool) { #err(#InvalidPool) };
                            }
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("ICPSwap canister error"))
                }
            };
        }
    };

    // Get transactions by status
    public func getSwapTransactionsByStatus(status: TransactionStatus): async [SwapTransaction] {
        try {
            await getICPSwapStorage().getTransactionsByStatus(status)
        } catch (_error) {
            []
        }
    };

    // Get swap statistics
    public func getSwapStatistics(): async {
        totalTransactions: Nat;
        totalVolume: Text;
        activePools: Nat;
        totalLiquidity: Text;
    } {
        try {
            await getICPSwapStorage().getSwapStats()
        } catch (_error) {
            {
                totalTransactions = 0;
                totalVolume = "0";
                activePools = 0;
                totalLiquidity = "0";
            }
        }
    };

    // Get all supported tokens
    public func getAllSupportedTokens(): async [(TokenSymbol, TokenInfo)] {
        try {
            await getICPSwapStorage().getAllTokens()
        } catch (_error) {
            []
        }
    };

    // Get token info
    public func getTokenInfo(symbol: TokenSymbol): async ?TokenInfo {
        try {
            await getICPSwapStorage().getTokenInfo(symbol)
        } catch (_error) {
            null
        }
    };

    // ===== HACKATHON FUNCTIONS =====

    // Create hackathon
    public func createHackathon(sessionId: Text, input: HackathonInput): async Result.Result<Hackathon, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getHackathonStorage().createHackathon(session.email, input);
                    switch (result) {
                        case (#ok(hackathon)) { #ok(hackathon) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (_error) {
                    #err(#StorageError("Hackathon canister error"))
                }
            };
        }
    };

    // Update hackathon
    public func updateHackathon(sessionId: Text, hackathonId: Text, update: HackathonUpdate): async Result.Result<Hackathon, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getHackathonStorage().updateHackathon(hackathonId, session.email, update);
                    switch (result) {
                        case (#ok(hackathon)) { #ok(hackathon) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (_error) {
                    #err(#StorageError("Hackathon canister error"))
                }
            };
        }
    };

    // Delete hackathon
    public func deleteHackathon(sessionId: Text, hackathonId: Text): async Result.Result<(), Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getHackathonStorage().deleteHackathon(hackathonId, session.email);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (_error) {
                    #err(#StorageError("Hackathon canister error"))
                }
            };
        }
    };

    // Register for hackathon
    public func registerForHackathon(sessionId: Text, hackathonId: Text, teamMembers: [Text]): async Result.Result<(), Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getHackathonStorage().registerForHackathon(hackathonId, session.email, teamMembers);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (_error) {
                    #err(#StorageError("Hackathon canister error"))
                }
            };
        }
    };

    // Submit to hackathon
    public func submitToHackathon(sessionId: Text, hackathonId: Text, submissionUrl: Text, description: Text, githubRepo: ?Text, demoUrl: ?Text, presentationUrl: ?Text): async Result.Result<(), Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getHackathonStorage().submitToHackathon(hackathonId, session.email, submissionUrl, description, githubRepo, demoUrl, presentationUrl);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (_error) {
                    #err(#StorageError("Hackathon canister error"))
                }
            };
        }
    };

    // Withdraw from hackathon
    public func withdrawFromHackathon(sessionId: Text, hackathonId: Text): async Result.Result<(), Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getHackathonStorage().withdrawFromHackathon(hackathonId, session.email);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (_error) {
                    #err(#StorageError("Hackathon canister error"))
                }
            };
        }
    };

    // Get hackathon by ID
    public func getHackathon(hackathonId: Text): async ?Hackathon {
        try {
            await getHackathonStorage().getHackathon(hackathonId)
        } catch (_error) {
            null
        }
    };

    // Get all hackathons
    public func getAllHackathons(): async [Hackathon] {
        try {
            await getHackathonStorage().getAllHackathons()
        } catch (_error) {
            []
        }
    };

    // Get hackathons by status
    public func getHackathonsByStatus(status: HackathonStatus): async [Hackathon] {
        try {
            await getHackathonStorage().getHackathonsByStatus(status)
        } catch (_error) {
            []
        }
    };

    // Get hackathons by category
    public func getHackathonsByCategory(category: HackathonCategory): async [Hackathon] {
        try {
            await getHackathonStorage().getHackathonsByCategory(category)
        } catch (_error) {
            []
        }
    };

    // Get featured hackathons
    public func getFeaturedHackathons(): async [Hackathon] {
        try {
            await getHackathonStorage().getFeaturedHackathons()
        } catch (_error) {
            []
        }
    };

    // Get hackathons by organizer
    public func getHackathonsByOrganizer(sessionId: Text): async Result.Result<[Hackathon], Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let hackathons = await getHackathonStorage().getHackathonsByOrganizer(session.email);
                    #ok(hackathons)
                } catch (_error) {
                    #err(#StorageError("Hackathon canister error"))
                }
            };
        }
    };

    // Get user's hackathons
    public func getUserHackathons(sessionId: Text): async Result.Result<[Hackathon], Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let hackathons = await getHackathonStorage().getUserHackathons(session.email);
                    #ok(hackathons)
                } catch (_error) {
                    #err(#StorageError("Hackathon canister error"))
                }
            };
        }
    };

    // Search hackathons
    public func searchHackathons(filters: HackathonSearchFilters): async [Hackathon] {
        try {
            await getHackathonStorage().searchHackathons(filters)
        } catch (_error) {
            []
        }
    };

    // Get hackathon statistics
    public func getHackathonStatistics(): async HackathonStats {
        try {
            await getHackathonStorage().getHackathonStats()
        } catch (_error) {
            {
                totalHackathons = 0;
                activeHackathons = 0;
                completedHackathons = 0;
                totalPrizePool = "$0";
                totalParticipants = 0;
                totalWinners = 0;
            }
        }
    };

    // Update participant status (organizer only)
    public func updateHackathonParticipantStatus(sessionId: Text, hackathonId: Text, userEmail: Text, status: HackathonParticipantStatus): async Result.Result<(), Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getHackathonStorage().updateParticipantStatus(hackathonId, userEmail, status, session.email);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (_error) {
                    #err(#StorageError("Hackathon canister error"))
                }
            };
        }
    };

    // Set winners (organizer only)
    public func setHackathonWinners(sessionId: Text, hackathonId: Text, winnerIds: [Text]): async Result.Result<(), Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let result = await getHackathonStorage().setWinners(hackathonId, winnerIds, session.email);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (_error) {
                    #err(#StorageError("Hackathon canister error"))
                }
            };
        }
    };

    // ESCROW FUNCTIONS

    // Deposit funds to escrow account
    public func depositToEscrow(sessionId: Text, amount: Balance): async Result.Result<Balance, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?_session) {
                try {
                    let result = await getEscrowStorage().deposit(amount);
                    switch (result) {
                        case (#ok(balance)) { #ok(balance) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (_error) {
                    #err(#StorageError("Escrow canister error"))
                }
            };
        }
    };

    // Withdraw funds from escrow account
    public func withdrawFromEscrow(sessionId: Text, amount: Balance): async Result.Result<Balance, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?_session) {
                try {
                    let result = await getEscrowStorage().withdraw(amount);
                    switch (result) {
                        case (#ok(balance)) { #ok(balance) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (_error) {
                    #err(#StorageError("Escrow canister error"))
                }
            };
        }
    };

    // Get user's escrow balance
    public func getEscrowBalance(sessionId: Text): async Result.Result<Balance, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?_session) {
                try {
                    let balance = await getEscrowStorage().getMyBalance();
                    #ok(balance)
                } catch (_error) {
                    #err(#StorageError("Escrow canister error"))
                }
            };
        }
    };

    // Create new escrow agreement
    public func createEscrow(sessionId: Text, args: CreateEscrowArgs): async Result.Result<EscrowId, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?_session) {
                try {
                    let result = await getEscrowStorage().createEscrow(args);
                    switch (result) {
                        case (#ok(escrowId)) { #ok(escrowId) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (_error) {
                    #err(#StorageError("Escrow canister error"))
                }
            };
        }
    };

    // Buyer approves escrow
    public func buyerApproveEscrow(sessionId: Text, escrowId: EscrowId): async Result.Result<Text, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?_session) {
                try {
                    let result = await getEscrowStorage().buyerApprove(escrowId);
                    switch (result) {
                        case (#ok(msg)) { #ok(msg) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (_error) {
                    #err(#StorageError("Escrow canister error"))
                }
            };
        }
    };

    // Seller approves escrow
    public func sellerApproveEscrow(sessionId: Text, escrowId: EscrowId): async Result.Result<Text, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?_session) {
                try {
                    let result = await getEscrowStorage().sellerApprove(escrowId);
                    switch (result) {
                        case (#ok(msg)) { #ok(msg) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (_error) {
                    #err(#StorageError("Escrow canister error"))
                }
            };
        }
    };

    // Cancel escrow
    public func cancelEscrow(sessionId: Text, escrowId: EscrowId): async Result.Result<Text, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?_session) {
                try {
                    let result = await getEscrowStorage().cancelEscrow(escrowId);
                    switch (result) {
                        case (#ok(msg)) { #ok(msg) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (_error) {
                    #err(#StorageError("Escrow canister error"))
                }
            };
        }
    };

    // Raise dispute
    public func raiseEscrowDispute(sessionId: Text, escrowId: EscrowId): async Result.Result<Text, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?_session) {
                try {
                    let result = await getEscrowStorage().raiseDispute(escrowId);
                    switch (result) {
                        case (#ok(msg)) { #ok(msg) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (_error) {
                    #err(#StorageError("Escrow canister error"))
                }
            };
        }
    };

    // Resolve dispute
    public func resolveEscrowDispute(sessionId: Text, escrowId: EscrowId, favorBuyer: Bool): async Result.Result<Text, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?_session) {
                try {
                    let result = await getEscrowStorage().resolveDispute(escrowId, favorBuyer);
                    switch (result) {
                        case (#ok(msg)) { #ok(msg) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (_error) {
                    #err(#StorageError("Escrow canister error"))
                }
            };
        }
    };

    // Raise client dispute
    public func raiseClientDispute(sessionId: Text, escrowId: EscrowId, reason: Text): async Result.Result<Text, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?_session) {
                try {
                    let result = await getEscrowStorage().raiseClientDispute(escrowId, reason);
                    switch (result) {
                        case (#ok(msg)) { #ok(msg) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (_error) {
                    #err(#StorageError("Escrow canister error"))
                }
            };
        }
    };

    // Raise freelancer dispute
    public func raiseFreelancerDispute(sessionId: Text, escrowId: EscrowId, reason: Text): async Result.Result<Text, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?_session) {
                try {
                    let result = await getEscrowStorage().raiseFreelancerDispute(escrowId, reason);
                    switch (result) {
                        case (#ok(msg)) { #ok(msg) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (_error) {
                    #err(#StorageError("Escrow canister error"))
                }
            };
        }
    };

    // Get escrow details
    public func getEscrow(sessionId: Text, escrowId: EscrowId): async Result.Result<?EscrowAgreement, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?_session) {
                try {
                    let escrow = await getEscrowStorage().getEscrow(escrowId);
                    #ok(escrow)
                } catch (_error) {
                    #err(#StorageError("Escrow canister error"))
                }
            };
        }
    };

    // Get user's escrows
    public func getMyEscrows(sessionId: Text): async Result.Result<[EscrowAgreement], Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?_session) {
                try {
                    let escrows = await getEscrowStorage().getMyEscrows();
                    #ok(escrows)
                } catch (_error) {
                    #err(#StorageError("Escrow canister error"))
                }
            };
        }
    };

    // Get arbitration escrows
    public func getArbitrationEscrows(sessionId: Text): async Result.Result<[EscrowAgreement], Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?_session) {
                try {
                    let escrows = await getEscrowStorage().getArbitrationEscrows();
                    #ok(escrows)
                } catch (_error) {
                    #err(#StorageError("Escrow canister error"))
                }
            };
        }
    };

    // Get platform fee balance (admin function)
    public func getPlatformFeeBalance(sessionId: Text): async Result.Result<Balance, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?_session) {
                try {
                    let balance = await getEscrowStorage().getPlatformFeeBalance();
                    #ok(balance)
                } catch (_error) {
                    #err(#StorageError("Escrow canister error"))
                }
            };
        }
    };

    // Get platform fee statistics (admin function)
    public func getPlatformFeeStats(sessionId: Text): async Result.Result<{ totalFees: Balance; totalTransactions: Nat; collectedFees: Balance; }, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?_session) {
                try {
                    let stats = await getEscrowStorage().getPlatformFeeStats();
                    #ok(stats)
                } catch (_error) {
                    #err(#StorageError("Escrow canister error"))
                }
            };
        }
    };

    // Get escrows by service ID
    public func getEscrowsByService(sessionId: Text, serviceId: Text): async Result.Result<[EscrowAgreement], Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?_session) {
                try {
                    let escrows = await getEscrowStorage().getEscrowsByService(serviceId);
                    #ok(escrows)
                } catch (_error) {
                    #err(#StorageError("Escrow canister error"))
                }
            };
        }
    };

    // Check overdue projects (admin function)
    public func checkOverdueProjects(sessionId: Text): async Result.Result<[EscrowId], Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?_session) {
                try {
                    let result = await getEscrowStorage().checkOverdueProjects();
                    switch (result) {
                        case (#ok(escrowIds)) { #ok(escrowIds) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (_error) {
                    #err(#StorageError("Escrow canister error"))
                }
            };
        }
    };
}
