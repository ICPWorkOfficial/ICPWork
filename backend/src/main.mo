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

    // Storage canister actors - REPLACE WITH ACTUAL CANISTER IDs
    transient let freelancerStorage = actor("rdmx6-jaaaa-aaaaa-aaadq-cai") : actor {
        storeFreelancer: (Text, Freelancer) -> async Result.Result<(), {#NotFound; #InvalidSkillsCount; #Unauthorized; #InvalidEmail}>;
        updateFreelancer: (Text, Freelancer) -> async Result.Result<(), {#NotFound; #InvalidSkillsCount; #Unauthorized; #InvalidEmail}>;
        getFreelancer: (Text) -> async Result.Result<Freelancer, {#NotFound; #Unauthorized; #InvalidEmail}>;
        deleteFreelancer: (Text) -> async Result.Result<(), {#NotFound; #Unauthorized}>;
        getAllFreelancers: () -> async Result.Result<[(Text, Freelancer)], {#Unauthorized}>;
    };

    transient let clientStorage = actor("ryjl3-tyaaa-aaaaa-aaaba-cai") : actor {
        storeClient: (Text, Client) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidData; #InvalidEmail}>;
        updateClient: (Text, Client) -> async Result.Result<(), {#NotFound; #Unauthorized; #InvalidData; #InvalidEmail}>;
        getClient: (Text) -> async Result.Result<Client, {#NotFound; #Unauthorized; #InvalidEmail}>;
        deleteClient: (Text) -> async Result.Result<(), {#NotFound; #Unauthorized}>;
        getAllClients: () -> async Result.Result<[(Text, Client)], {#Unauthorized}>;
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
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?_session) {
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
        switch (sessionManager.validateSession(sessionId)) {
            case null { return #err(#InvalidSession) };
            case (?_session) {
                try {
                    let result = await clientStorage.getAllClients();
                    switch (result) {
                        case (#ok(clients)) { #ok(clients) };
                        case (#err(_err)) { 
                            #err(#StorageError("Failed to get all clients: "))
                        };
                    }
                } catch (_error) {
                    #err(#StorageError("Storage canister error"))
                }
            };
        }
    };

    // UTILITY FUNCTIONS
    public func getActiveSessionCount() : async Nat {
        sessionManager.getActiveSessionCount()
    };
}