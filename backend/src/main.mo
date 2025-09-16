import Auth "./auth";
import SessionManager "./session";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Error "mo:base/Error";

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

    // Storage canister type definitions - Use proper actor types
    type FreelancerStorage = actor {
        storeFreelancer: (Text, Freelancer) -> async Result.Result<(), {#NotFound; #InvalidSkillsCount; #Unauthorized; #InvalidEmail}>;
        updateFreelancer: (Text, Freelancer) -> async Result.Result<(), {#NotFound; #InvalidSkillsCount; #Unauthorized; #InvalidEmail}>;
        getFreelancer: (Text) -> async Result.Result<Freelancer, {#NotFound; #Unauthorized; #InvalidEmail}>;
        deleteFreelancer: (Text) -> async Result.Result<(), {#NotFound; #Unauthorized}>;
        getAllFreelancers: () -> async Result.Result<[(Text, Freelancer)], {#Unauthorized}>;
    };

    type ClientStorage = actor {
        storeClient: (Text, Client) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidData; #InvalidEmail}>;
        updateClient: (Text, Client) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidData; #InvalidEmail}>;
        getClient: (Text) -> async Result.Result<Client, {#NotFound; #Unauthorized; #InvalidEmail}>;
        deleteClient: (Text) -> async Result.Result<(), {#NotFound; #Unauthorized}>;
        getAllClients: () -> async Result.Result<[(Text, Client)], {#Unauthorized}>;
    };

    type MessageStorage = actor {
        storeMessage: (Text, Text, Text, Int, MessageType) -> async Result.Result<Message, {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
        getConversationMessages: (Text, Text, ?Nat, ?Nat) -> async Result.Result<[Message], {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
        markMessageAsRead: (Text, Text) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
        markMessageAsDelivered: (Text) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
        getUserConversations: (Text) -> async Result.Result<[ConversationSummary], {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
        getUnreadMessageCount: (Text) -> async Result.Result<Nat, {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
        deleteMessage: (Text, Text) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
        getMessage: (Text, Text) -> async Result.Result<Message, {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
    };

    type OnboardingStorage = actor {
        createOnboardingRecord: (Text, Text) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text; #InvalidUserType}>;
        updateOnboardingStep: (Text, ?ProfileMethod, ?PersonalInfo, ?[Text], ?AddressData, ?ProfileData, ?FinalData, ?CompanyData) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text}>;
        completeOnboarding: (Text) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text}>;
        getOnboardingRecord: (Text) -> async Result.Result<OnboardingRecord, {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text}>;
        getAllOnboardingRecords: () -> async Result.Result<[(Text, OnboardingRecord)], {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text}>;
        getOnboardingRecordsByStatus: (Bool) -> async Result.Result<[(Text, OnboardingRecord)], {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text}>;
        getOnboardingRecordsByUserType: (Text) -> async Result.Result<[(Text, OnboardingRecord)], {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text; #InvalidUserType}>;
        deleteOnboardingRecord: (Text) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text}>;
        getOnboardingStats: () -> async Result.Result<{totalRecords: Nat; completedRecords: Nat; pendingRecords: Nat; freelancerRecords: Nat; clientRecords: Nat}, {#NotFound; #Unauthorized; #InvalidEmail; #InvalidData; #StorageError: Text}>;
    };

    type BountiesStorage = actor {
        createBounty: (Text, BountyInput) -> async Result.Result<Bounty, Text>;
        updateBounty: (Text, Text, BountyUpdate) -> async Result.Result<Bounty, Text>;
        registerForBounty: (Text, Text) -> async Result.Result<(), Text>;
        submitToBounty: (Text, Text, Text, Text) -> async Result.Result<(), Text>;
        getBounty: (Text) -> async ?Bounty;
        getAllBounties: () -> async [Bounty];
        getBountiesByStatus: (BountyStatus) -> async [Bounty];
        getBountiesByCategory: (BountyCategory) -> async [Bounty];
        getFeaturedBounties: () -> async [Bounty];
        getBountiesByOrganizer: (Text) -> async [Bounty];
        getUserBounties: (Text) -> async [Bounty];
        getBountyStats: () -> async BountyStats;
        deleteBounty: (Text, Text) -> async Result.Result<(), Text>;
    };

    // Storage canister actors - Initialize with proper canister IDs
    private var freelancerCanisterId : Text = "rrkah-fqaaa-aaaaa-aaaaq-cai"; // Replace with actual canister ID
    private var clientCanisterId : Text = "rdmx6-jaaaa-aaaaa-aaadq-cai"; // Replace with actual canister ID
    private var messageCanisterId : Text = "rno2w-sqaaa-aaaaa-aaacq-cai"; // Replace with actual canister ID
    private var onboardingCanisterId : Text = "renrk-eyaaa-aaaaa-aaada-cai"; // Replace with actual canister ID
    private var bountiesCanisterId : Text = "ryjl3-tyaaa-aaaaa-aaaba-cai"; // Replace with actual canister ID

    private var freelancerStorage : ?FreelancerStorage = null;
    private var clientStorage : ?ClientStorage = null;
    private var messageStorage : ?MessageStorage = null;
    private var onboardingStorage : ?OnboardingStorage = null;
    private var bountiesStorage : ?BountiesStorage = null;

    // Helper function to get freelancer storage
    private func getFreelancerStorage() : FreelancerStorage {
        switch (freelancerStorage) {
            case (?storage) { storage };
            case null {
                let storage : FreelancerStorage = actor(freelancerCanisterId);
                freelancerStorage := ?storage;
                storage
            };
        }
    };

    // Helper function to get client storage
    private func getClientStorage() : ClientStorage {
        switch (clientStorage) {
            case (?storage) { storage };
            case null {
                let storage : ClientStorage = actor(clientCanisterId);
                clientStorage := ?storage;
                storage
            };
        }
    };

    // Helper function to get message storage
    private func getMessageStorage() : MessageStorage {
        switch (messageStorage) {
            case (?storage) { storage };
            case null {
                let storage : MessageStorage = actor(messageCanisterId);
                messageStorage := ?storage;
                storage
            };
        }
    };

    // Helper function to get onboarding storage
    private func getOnboardingStorage() : OnboardingStorage {
        switch (onboardingStorage) {
            case (?storage) { storage };
            case null {
                let storage : OnboardingStorage = actor(onboardingCanisterId);
                onboardingStorage := ?storage;
                storage
            };
        }
    };

    // Helper function to get bounties storage
    private func getBountiesStorage() : BountiesStorage {
        switch (bountiesStorage) {
            case (?storage) { storage };
            case null {
                let storage : BountiesStorage = actor(bountiesCanisterId);
                bountiesStorage := ?storage;
                storage
            };
        }
    };

    private var sessionEntries : [(Text, SessionManager.Session)] = [];

    // Initialize modules
    private transient let auth = Auth.Auth();
    private transient let sessionManager = SessionManager.SessionManager();

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

    // AUTHENTICATION FUNCTIONS

    // Helper function to convert UserType text to enum
    private func parseUserType(userTypeText: Text) : ?UserType {
        switch (userTypeText) {
            case ("freelancer") { ?#freelancer };
            case ("client") { ?#client };
            case _ { null };
        }
    };

    // Helper function to convert AuthError to main Error
    private func convertAuthError(authError: AuthError) : Error {
        switch (authError) {
            case (#UserAlreadyExists) { #UserAlreadyExists };
            case (#UserNotFound) { #UserNotFound };
            case (#InvalidCredentials) { #InvalidCredentials };
            case (#InvalidEmail) { #InvalidEmail };
            case (#WeakPassword) { #WeakPassword };
        }
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
        let signupResult = await signup(email, password, userType);
        switch (signupResult) {
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

    // Get user by email
    public func getUserByEmail(email: Text) : async Result.Result<User, Error> {
        switch (auth.getUserByEmail(email)) {
            case null { #err(#UserNotFound) };
            case (?user) { #ok(user) };
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
                    let storage = getFreelancerStorage();
                    let result = await storage.storeFreelancer(session.email, freelancer);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(#NotFound)) { #err(#StorageError("Freelancer not found")) };
                        case (#err(#InvalidSkillsCount)) { #err(#StorageError("Invalid skills count")) };
                        case (#err(#Unauthorized)) { #err(#StorageError("Unauthorized")) };
                        case (#err(#InvalidEmail)) { #err(#InvalidEmail) };
                    }
                } catch (error) {
                    #err(#StorageError("Storage canister error: " # Error.message(error)))
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
                    let storage = getFreelancerStorage();
                    let result = await storage.updateFreelancer(session.email, freelancer);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(#NotFound)) { #err(#StorageError("Freelancer not found")) };
                        case (#err(#InvalidSkillsCount)) { #err(#StorageError("Invalid skills count")) };
                        case (#err(#Unauthorized)) { #err(#StorageError("Unauthorized")) };
                        case (#err(#InvalidEmail)) { #err(#InvalidEmail) };
                    }
                } catch (error) {
                    #err(#StorageError("Storage canister error: " # Error.message(error)))
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
                    let storage = getFreelancerStorage();
                    let result = await storage.getFreelancer(session.email);
                    switch (result) {
                        case (#ok(freelancer)) { #ok(freelancer) };
                        case (#err(#NotFound)) { #err(#StorageError("Freelancer not found")) };
                        case (#err(#Unauthorized)) { #err(#StorageError("Unauthorized")) };
                        case (#err(#InvalidEmail)) { #err(#InvalidEmail) };
                    }
                } catch (error) {
                    #err(#StorageError("Storage canister error: " # Error.message(error)))
                }
            };
        }
    };

    // Get all freelancers (for clients to browse)
    public func getAllFreelancers(sessionId: Text) : async Result.Result<[(Text, Freelancer)], Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?_session) {
                try {
                    let storage = getFreelancerStorage();
                    let result = await storage.getAllFreelancers();
                    switch (result) {
                        case (#ok(freelancers)) { #ok(freelancers) };
                        case (#err(#Unauthorized)) { #err(#StorageError("Unauthorized")) };
                    }
                } catch (error) {
                    #err(#StorageError("Storage canister error: " # Error.message(error)))
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
                    let storage = getClientStorage();
                    let result = await storage.storeClient(session.email, client);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(#NotFound)) { #err(#StorageError("Client not found")) };
                        case (#err(#Unauthorized)) { #err(#StorageError("Unauthorized")) };
                        case (#err(#InvalidData)) { #err(#StorageError("Invalid data")) };
                        case (#err(#InvalidEmail)) { #err(#InvalidEmail) };
                    }
                } catch (error) {
                    #err(#StorageError("Storage canister error: " # Error.message(error)))
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
                    let storage = getClientStorage();
                    let result = await storage.updateClient(session.email, client);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(#NotFound)) { #err(#StorageError("Client not found")) };
                        case (#err(#Unauthorized)) { #err(#StorageError("Unauthorized")) };
                        case (#err(#InvalidData)) { #err(#StorageError("Invalid data")) };
                        case (#err(#InvalidEmail)) { #err(#InvalidEmail) };
                    }
                } catch (error) {
                    #err(#StorageError("Storage canister error: " # Error.message(error)))
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
                    let storage = getClientStorage();
                    let result = await storage.getClient(session.email);
                    switch (result) {
                        case (#ok(client)) { #ok(client) };
                        case (#err(#NotFound)) { #err(#StorageError("Client not found")) };
                        case (#err(#Unauthorized)) { #err(#StorageError("Unauthorized")) };
                        case (#err(#InvalidEmail)) { #err(#InvalidEmail) };
                    }
                } catch (error) {
                    #err(#StorageError("Storage canister error: " # Error.message(error)))
                }
            };
        }
    };

    // Get all clients
    public func getAllClients(sessionId: Text) : async Result.Result<[(Text, Client)], Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?_session) {
                try {
                    let storage = getClientStorage();
                    let result = await storage.getAllClients();
                    switch (result) {
                        case (#ok(clients)) { #ok(clients) };
                        case (#err(#Unauthorized)) { #err(#StorageError("Unauthorized")) };
                    }
                } catch (error) {
                    #err(#StorageError("Storage canister error: " # Error.message(error)))
                }
            };
        }
    };

    // UTILITY FUNCTIONS
    public func getActiveSessionCount() : async Nat {
        sessionManager.getActiveSessionCount()
    };

    // MESSAGE FUNCTIONS

    // Send a message
    public func sendMessage(sessionId: Text, to: Text, content: Text, messageType: MessageType, clientTimestamp: Int) : async Result.Result<Message, Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let storage = getMessageStorage();
                    let result = await storage.storeMessage(session.email, to, content, clientTimestamp, messageType);
                    switch (result) {
                        case (#ok(message)) { #ok(message) };
                        case (#err(#NotFound)) { #err(#StorageError("User not found")) };
                        case (#err(#Unauthorized)) { #err(#StorageError("Unauthorized")) };
                        case (#err(#InvalidMessage)) { #err(#StorageError("Invalid message")) };
                        case (#err(#InvalidEmail)) { #err(#InvalidEmail) };
                        case (#err(#StorageError(msg))) { #err(#StorageError(msg)) };
                    }
                } catch (error) {
                    #err(#StorageError("Message storage canister error: " # Error.message(error)))
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
                    let storage = getMessageStorage();
                    let result = await storage.getConversationMessages(session.email, otherUser, limit, offset);
                    switch (result) {
                        case (#ok(messages)) { #ok(messages) };
                        case (#err(#NotFound)) { #err(#StorageError("Conversation not found")) };
                        case (#err(#Unauthorized)) { #err(#StorageError("Unauthorized")) };
                        case (#err(#InvalidMessage)) { #err(#StorageError("Invalid message")) };
                        case (#err(#InvalidEmail)) { #err(#InvalidEmail) };
                        case (#err(#StorageError(msg))) { #err(#StorageError(msg)) };
                    }
                } catch (error) {
                    #err(#StorageError("Message storage canister error: " # Error.message(error)))
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
                    let storage = getMessageStorage();
                    let result = await storage.markMessageAsRead(messageId, session.email);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(#NotFound)) { #err(#StorageError("Message not found")) };
                        case (#err(#Unauthorized)) { #err(#StorageError("Unauthorized")) };
                        case (#err(#InvalidMessage)) { #err(#StorageError("Invalid message")) };
                        case (#err(#InvalidEmail)) { #err(#InvalidEmail) };
                        case (#err(#StorageError(msg))) { #err(#StorageError(msg)) };
                    }
                } catch (error) {
                    #err(#StorageError("Message storage canister error: " # Error.message(error)))
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
                    let storage = getMessageStorage();
                    let result = await storage.getUserConversations(session.email);
                    switch (result) {
                        case (#ok(conversations)) { #ok(conversations) };
                        case (#err(#NotFound)) { #err(#StorageError("User not found")) };
                        case (#err(#Unauthorized)) { #err(#StorageError("Unauthorized")) };
                        case (#err(#InvalidMessage)) { #err(#StorageError("Invalid message")) };
                        case (#err(#InvalidEmail)) { #err(#InvalidEmail) };
                        case (#err(#StorageError(msg))) { #err(#StorageError(msg)) };
                    }
                } catch (error) {
                    #err(#StorageError("Message storage canister error: " # Error.message(error)))
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
                    let storage = getMessageStorage();
                    let result = await storage.getUnreadMessageCount(session.email);
                    switch (result) {
                        case (#ok(count)) { #ok(count) };
                        case (#err(#NotFound)) { #err(#StorageError("User not found")) };
                        case (#err(#Unauthorized)) { #err(#StorageError("Unauthorized")) };
                        case (#err(#InvalidMessage)) { #err(#StorageError("Invalid message")) };
                        case (#err(#InvalidEmail)) { #err(#InvalidEmail) };
                        case (#err(#StorageError(msg))) { #err(#StorageError(msg)) };
                    }
                } catch (error) {
                    #err(#StorageError("Message storage canister error: " # Error.message(error)))
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
                    let storage = getMessageStorage();
                    let result = await storage.deleteMessage(messageId, session.email);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(#NotFound)) { #err(#StorageError("Message not found")) };
                        case (#err(#Unauthorized)) { #err(#StorageError("Unauthorized")) };
                        case (#err(#InvalidMessage)) { #err(#StorageError("Invalid message")) };
                        case (#err(#InvalidEmail)) { #err(#InvalidEmail) };
                        case (#err(#StorageError(msg))) { #err(#StorageError(msg)) };
                    }
                } catch (error) {
                    #err(#StorageError("Message storage canister error: " # Error.message(error)))
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
                    let storage = getOnboardingStorage();
                    let result = await storage.createOnboardingRecord(session.email, userType);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(#NotFound)) { #err(#StorageError("User not found")) };
                        case (#err(#Unauthorized)) { #err(#StorageError("Unauthorized")) };
                        case (#err(#InvalidEmail)) { #err(#InvalidEmail) };
                        case (#err(#InvalidData)) { #err(#StorageError("Invalid data")) };
                        case (#err(#InvalidUserType)) { #err(#InvalidUserType) };
                        case (#err(#StorageError(msg))) { #err(#StorageError(msg)) };
                    }
                } catch (error) {
                    #err(#StorageError("Onboarding storage canister error: " # Error.message(error)))
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
                    let storage = getOnboardingStorage();
                    let result = await storage.updateOnboardingStep(
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
                        case (#err(#NotFound)) { #err(#StorageError("Onboarding record not found")) };
                        case (#err(#Unauthorized)) { #err(#StorageError("Unauthorized")) };
                        case (#err(#InvalidEmail)) { #err(#InvalidEmail) };
                        case (#err(#InvalidData)) { #err(#StorageError("Invalid onboarding data")) };
                        case (#err(#StorageError(msg))) { #err(#StorageError(msg)) };
                    }
                } catch (error) {
                    #err(#StorageError("Onboarding storage canister error: " # Error.message(error)))
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
                    let storage = getOnboardingStorage();
                    let result = await storage.completeOnboarding(session.email);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(#NotFound)) { #err(#StorageError("Onboarding record not found")) };
                        case (#err(#Unauthorized)) { #err(#StorageError("Unauthorized")) };
                        case (#err(#InvalidEmail)) { #err(#InvalidEmail) };
                        case (#err(#InvalidData)) { #err(#StorageError("Invalid data")) };
                        case (#err(#StorageError(msg))) { #err(#StorageError(msg)) };
                    }
                } catch (error) {
                    #err(#StorageError("Onboarding storage canister error: " # Error.message(error)))
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
                    let storage = getOnboardingStorage();
                    let result = await storage.getOnboardingRecord(session.email);
                    switch (result) {
                        case (#ok(record)) { #ok(record) };
                        case (#err(#NotFound)) { #err(#StorageError("Onboarding record not found")) };
                        case (#err(#Unauthorized)) { #err(#StorageError("Unauthorized")) };
                        case (#err(#InvalidEmail)) { #err(#InvalidEmail) };
                        case (#err(#InvalidData)) { #err(#StorageError("Invalid data")) };
                        case (#err(#StorageError(msg))) { #err(#StorageError(msg)) };
                    }
                } catch (error) {
                    #err(#StorageError("Onboarding storage canister error: " # Error.message(error)))
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
                    let storage = getOnboardingStorage();
                    let result = await storage.getAllOnboardingRecords();
                    switch (result) {
                        case (#ok(records)) { #ok(records) };
                        case (#err(#NotFound)) { #err(#StorageError("Records not found")) };
                        case (#err(#Unauthorized)) { #err(#StorageError("Unauthorized")) };
                        case (#err(#InvalidEmail)) { #err(#InvalidEmail) };
                        case (#err(#InvalidData)) { #err(#StorageError("Invalid data")) };
                        case (#err(#StorageError(msg))) { #err(#StorageError(msg)) };
                    }
                } catch (error) {
                    #err(#StorageError("Onboarding storage canister error: " # Error.message(error)))
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
                    let storage = getOnboardingStorage();
                    let result = await storage.getOnboardingRecordsByStatus(isComplete);
                    switch (result) {
                        case (#ok(records)) { #ok(records) };
                        case (#err(#NotFound)) { #err(#StorageError("Records not found")) };
                        case (#err(#Unauthorized)) { #err(#StorageError("Unauthorized")) };
                        case (#err(#InvalidEmail)) { #err(#InvalidEmail) };
                        case (#err(#InvalidData)) { #err(#StorageError("Invalid data")) };
                        case (#err(#StorageError(msg))) { #err(#StorageError(msg)) };
                    }
                } catch (error) {
                    #err(#StorageError("Onboarding storage canister error: " # Error.message(error)))
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
                    let storage = getOnboardingStorage();
                    let result = await storage.getOnboardingRecordsByUserType(userType);
                    switch (result) {
                        case (#ok(records)) { #ok(records) };
                        case (#err(#NotFound)) { #err(#StorageError("Records not found")) };
                        case (#err(#Unauthorized)) { #err(#StorageError("Unauthorized")) };
                        case (#err(#InvalidEmail)) { #err(#InvalidEmail) };
                        case (#err(#InvalidData)) { #err(#StorageError("Invalid data")) };
                        case (#err(#InvalidUserType)) { #err(#InvalidUserType) };
                        case (#err(#StorageError(msg))) { #err(#StorageError(msg)) };
                    }
                } catch (error) {
                    #err(#StorageError("Onboarding storage canister error: " # Error.message(error)))
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
                    let storage = getOnboardingStorage();
                    let result = await storage.getOnboardingStats();
                    switch (result) {
                        case (#ok(stats)) { #ok(stats) };
                        case (#err(#NotFound)) { #err(#StorageError("Stats not found")) };
                        case (#err(#Unauthorized)) { #err(#StorageError("Unauthorized")) };
                        case (#err(#InvalidEmail)) { #err(#InvalidEmail) };
                        case (#err(#InvalidData)) { #err(#StorageError("Invalid data")) };
                        case (#err(#StorageError(msg))) { #err(#StorageError(msg)) };
                    }
                } catch (error) {
                    #err(#StorageError("Onboarding storage canister error: " # Error.message(error)))
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
                    let storage = getBountiesStorage();
                    let result = await storage.createBounty(session.email, input);
                    switch (result) {
                        case (#ok(bounty)) { #ok(bounty) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (error) {
                    #err(#StorageError("Bounties storage canister error: " # Error.message(error)))
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
                    let storage = getBountiesStorage();
                    let result = await storage.updateBounty(bountyId, session.email, update);
                    switch (result) {
                        case (#ok(bounty)) { #ok(bounty) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (error) {
                    #err(#StorageError("Bounties storage canister error: " # Error.message(error)))
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
                    let storage = getBountiesStorage();
                    let result = await storage.registerForBounty(bountyId, session.email);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (error) {
                    #err(#StorageError("Bounties storage canister error: " # Error.message(error)))
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
                    let storage = getBountiesStorage();
                    let result = await storage.submitToBounty(bountyId, session.email, submissionUrl, description);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (error) {
                    #err(#StorageError("Bounties storage canister error: " # Error.message(error)))
                }
            };
        }
    };

    // Get bounty by ID
    public func getBounty(bountyId: Text) : async ?Bounty {
        try {
            let storage = getBountiesStorage();
            await storage.getBounty(bountyId)
        } catch (error) {
            null
        }
    };

    // Get all bounties
    public func getAllBounties() : async [Bounty] {
        try {
            let storage = getBountiesStorage();
            await storage.getAllBounties()
        } catch (error) {
            []
        }
    };

    // Get bounties by status
    public func getBountiesByStatus(status: BountyStatus) : async [Bounty] {
        try {
            let storage = getBountiesStorage();
            await storage.getBountiesByStatus(status)
        } catch (error) {
            []
        }
    };

    // Get bounties by category
    public func getBountiesByCategory(category: BountyCategory) : async [Bounty] {
        try {
            let storage = getBountiesStorage();
            await storage.getBountiesByCategory(category)
        } catch (error) {
            []
        }
    };

    // Get featured bounties
    public func getFeaturedBounties() : async [Bounty] {
        try {
            let storage = getBountiesStorage();
            await storage.getFeaturedBounties()
        } catch (error) {
            []
        }
    };

    // Get bounties by organizer
    public func getBountiesByOrganizer(sessionId: Text) : async Result.Result<[Bounty], Error> {
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?session) {
                try {
                    let storage = getBountiesStorage();
                    let bounties = await storage.getBountiesByOrganizer(session.email);
                    #ok(bounties)
                } catch (error) {
                    #err(#StorageError("Bounties storage canister error: " # Error.message(error)))
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
                    let storage = getBountiesStorage();
                    let bounties = await storage.getUserBounties(session.email);
                    #ok(bounties)
                } catch (error) {
                    #err(#StorageError("Bounties storage canister error: " # Error.message(error)))
                }
            };
        }
    };

    // Get bounty statistics
    public func getBountyStats() : async BountyStats {
        try {
            let storage = getBountiesStorage();
            await storage.getBountyStats()
        } catch (error) {
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
                    let storage = getBountiesStorage();
                    let result = await storage.deleteBounty(bountyId, session.email);
                    switch (result) {
                        case (#ok()) { #ok(()) };
                        case (#err(msg)) { #err(#StorageError(msg)) };
                    }
                } catch (error) {
                    #err(#StorageError("Bounties storage canister error: " # Error.message(error)))
                }
            };
        }
    };

    // UPDATE CANISTER IDs FUNCTION (for deployment)
    public func updateCanisterIds(
        freelancerId: Text,
        clientId: Text, 
        messageId: Text,
        onboardingId: Text,
        bountiesId: Text
    ) : async () {
        freelancerCanisterId := freelancerId;
        clientCanisterId := clientId;
        messageCanisterId := messageId;
        onboardingCanisterId := onboardingId;
        bountiesCanisterId := bountiesId;
        
        // Reset storage references to use new IDs
        freelancerStorage := null;
        clientStorage := null;
        messageStorage := null;
        onboardingStorage := null;
        bountiesStorage := null;
    };
}