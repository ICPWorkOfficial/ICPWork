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

    // Storage canister actors - Use proper canister names
    transient let freelancerStorage = actor("umunu-kh777-77774-qaaca-cai") : actor {
        storeFreelancer: (Text, Freelancer) -> async Result.Result<(), {#NotFound; #InvalidSkillsCount; #Unauthorized; #InvalidEmail}>;
        updateFreelancer: (Text, Freelancer) -> async Result.Result<(), {#NotFound; #InvalidSkillsCount; #Unauthorized; #InvalidEmail}>;
        getFreelancer: (Text) -> async Result.Result<Freelancer, {#NotFound; #Unauthorized; #InvalidEmail}>;
        deleteFreelancer: (Text) -> async Result.Result<(), {#NotFound; #Unauthorized}>;
        getAllFreelancers: () -> async Result.Result<[(Text, Freelancer)], {#Unauthorized}>;
    };

    transient let clientStorage = actor("u6s2n-gx777-77774-qaaba-cai") : actor {
        storeClient: (Text, Client) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidData; #InvalidEmail}>;
        updateClient: (Text, Client) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidData; #InvalidEmail}>;
        getClient: (Text) -> async Result.Result<Client, {#NotFound; #Unauthorized; #InvalidEmail}>;
        deleteClient: (Text) -> async Result.Result<(), {#NotFound; #Unauthorized}>;
        getAllClients: () -> async Result.Result<[(Text, Client)], {#Unauthorized}>;
    };

    transient let messageStorage = actor("ucwa4-rx777-77774-qaada-cai") : actor {
        storeMessage: (Text, Text, Text, Int, MessageType) -> async Result.Result<Message, {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
        getConversationMessages: (Text, Text, ?Nat, ?Nat) -> async Result.Result<[Message], {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
        markMessageAsRead: (Text, Text) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
        markMessageAsDelivered: (Text) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
        getUserConversations: (Text) -> async Result.Result<[ConversationSummary], {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
        getUnreadMessageCount: (Text) -> async Result.Result<Nat, {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
        deleteMessage: (Text, Text) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
        getMessage: (Text, Text) -> async Result.Result<Message, {#NotFound; #Unauthorized; #InvalidMessage; #InvalidEmail; #StorageError: Text}>;
    };

    transient let onboardingStorage = actor("ufxgi-4p777-77774-qaadq-cai") : actor {
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

    transient let bountiesStorage = actor("uxrrr-q7777-77774-qaaaq-cai") : actor {
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
    func validateUserType(session: SessionManager.Session, expectedType: Text) : Bool {
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

    // Get user by email
    public func getUserByEmail(email: Text) : async Result.Result<User, Error> {
        switch (auth.getUserByEmail(email)) {
            case null { #err(#UserNotFound) };
            case (?user) { #ok(user) };
        }
    };


    // Logout user
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
                    let result = await freelancerStorage.storeFreelancer(session.email, freelancer);
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
                    let result = await freelancerStorage.updateFreelancer(session.email, freelancer);
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
                    let result = await freelancerStorage.getFreelancer(session.email);
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
                    let result = await freelancerStorage.getAllFreelancers();
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
                    let result = await clientStorage.storeClient(session.email, client);
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
                    let result = await clientStorage.updateClient(session.email, client);
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
                    let result = await clientStorage.getClient(session.email);
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
                    let result = await clientStorage.getAllClients();
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

    // Get user role by email
    public func getUserRole(email: Text) : async ?Text {
        // This is a simple implementation - in a real app you'd store roles in a database
        // For now, we'll return null (unknown role)
        null
    };

    // Set user role (for registration)
    public func setUserRole(email: Text, role: Text) : async Result.Result<(), Error> {
        if (role != "client" and role != "freelancer") {
            return #err(#InvalidUserType);
        };
        // In a real app, you'd store this in a database
        #ok(())
    };
}
