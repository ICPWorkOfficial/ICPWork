import Auth "./auth";
import SessionManager "./session";
import Text "mo:base/Text";
import Result "mo:base/Result";

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
            case (?_session) {
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
            case (?_session) {
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
            case (?_session) {
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
            case (?_session) {
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
            case (?_session) {
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
            case (?_session) {
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
            case (?_session) {
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
            case (?_session) {
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
}
