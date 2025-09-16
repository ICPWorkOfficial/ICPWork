import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Option "mo:base/Option";

persistent actor OnboardingStorage {
    
    // Define the onboarding data types based on frontend structure
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
        profilePhoto: ?Text; // Base64 encoded or URL
        phoneNumber: ?Text;
        phoneVerified: Bool;
    };

    public type FinalData = {
        resume: ?Text; // Base64 encoded or URL
        linkedinProfile: ?Text;
    };

    // Company-specific data for clients
    public type CompanyData = {
        companyName: ?Text;
        companyWebsite: ?Text;
        industry: ?Text;
        businessType: ?Text;
        employeeCount: ?Text;
    };

    // Complete onboarding record
    public type OnboardingRecord = {
        email: Text;
        userType: Text; // "freelancer" or "client"
        profileMethod: ?ProfileMethod;
        personalInfo: ?PersonalInfo;
        skills: [Text]; // For freelancers
        address: ?AddressData; // For freelancers
        profile: ?ProfileData;
        final: ?FinalData;
        companyData: ?CompanyData; // For clients
        isComplete: Bool;
        createdAt: Int;
        updatedAt: Int;
        completedAt: ?Int;
    };

    // Error types
    public type Error = {
        #NotFound;
        #Unauthorized;
        #InvalidEmail;
        #InvalidData;
        #StorageError: Text;
        #InvalidUserType;
    };

    // Main canister principal - will be set during initialization
    private transient var mainCanisterPrincipal : ?Principal = null;

    // Stable storage for upgrades
    private var onboardingEntries : [(Text, OnboardingRecord)] = [];
    private transient var onboardingRecords = HashMap.HashMap<Text, OnboardingRecord>(10, Text.equal, Text.hash);

    // System functions for upgrades
    system func preupgrade() {
        onboardingEntries := Iter.toArray(onboardingRecords.entries());
    };

    system func postupgrade() {
        onboardingRecords := HashMap.fromIter<Text, OnboardingRecord>(
            onboardingEntries.vals(), 
            onboardingEntries.size(), 
            Text.equal, 
            Text.hash
        );
        onboardingEntries := [];
    };

    // Set main canister principal (called during initialization)
    public shared(msg) func setMainCanister() : async () {
        mainCanisterPrincipal := ?msg.caller;
    };

    // Access control modifier
    private func onlyMainCanister(caller: Principal) : Bool {
        switch (mainCanisterPrincipal) {
            case null false;
            case (?principal) Principal.equal(caller, principal);
        }
    };

    // Validate email format (basic validation)
    private func isValidEmail(email: Text) : Bool {
        let emailPattern = "@";
        Text.contains(email, #text emailPattern) and Text.size(email) > 5
    };

    // Validate skills array (max 10 skills for flexibility)
    private func validateSkills(skills: [Text]) : Bool {
        skills.size() <= 10
    };

    // Create new onboarding record - ONLY callable by main canister
    public shared(msg) func createOnboardingRecord(email: Text, userType: Text) : async Result.Result<(), Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        // Validate email
        if (not isValidEmail(email)) {
            return #err(#InvalidEmail);
        };

        // Validate user type
        if (userType != "freelancer" and userType != "client") {
            return #err(#InvalidUserType);
        };

        let now = Time.now();
        let newRecord : OnboardingRecord = {
            email = email;
            userType = userType;
            profileMethod = null;
            personalInfo = null;
            skills = [];
            address = null;
            profile = null;
            final = null;
            companyData = null;
            isComplete = false;
            createdAt = now;
            updatedAt = now;
            completedAt = null;
        };

        onboardingRecords.put(email, newRecord);
        #ok(())
    };

    // Update onboarding step data - ONLY callable by main canister
    public shared(msg) func updateOnboardingStep(
        email: Text, 
        profileMethod: ?ProfileMethod,
        personalInfo: ?PersonalInfo,
        skills: ?[Text],
        address: ?AddressData,
        profile: ?ProfileData,
        final: ?FinalData,
        companyData: ?CompanyData
    ) : async Result.Result<(), Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        switch (onboardingRecords.get(email)) {
            case null { #err(#NotFound) };
            case (?existingRecord) {
                // Validate skills if provided
                switch (skills) {
                    case (?skillsArray) {
                        if (not validateSkills(skillsArray)) {
                            return #err(#InvalidData);
                        };
                    };
                    case null {};
                };

                let updatedRecord : OnboardingRecord = {
                    email = existingRecord.email;
                    userType = existingRecord.userType;
                    profileMethod = switch (profileMethod) { case null existingRecord.profileMethod; case (?pm) ?pm };
                    personalInfo = switch (personalInfo) { case null existingRecord.personalInfo; case (?pi) ?pi };
                    skills = switch (skills) { case null existingRecord.skills; case (?s) s };
                    address = switch (address) { case null existingRecord.address; case (?a) ?a };
                    profile = switch (profile) { case null existingRecord.profile; case (?p) ?p };
                    final = switch (final) { case null existingRecord.final; case (?f) ?f };
                    companyData = switch (companyData) { case null existingRecord.companyData; case (?cd) ?cd };
                    isComplete = existingRecord.isComplete;
                    createdAt = existingRecord.createdAt;
                    updatedAt = Time.now();
                    completedAt = existingRecord.completedAt;
                };

                onboardingRecords.put(email, updatedRecord);
                #ok(())
            };
        }
    };

    // Mark onboarding as complete - ONLY callable by main canister
    public shared(msg) func completeOnboarding(email: Text) : async Result.Result<(), Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        switch (onboardingRecords.get(email)) {
            case null { #err(#NotFound) };
            case (?existingRecord) {
                let completedRecord : OnboardingRecord = {
                    email = existingRecord.email;
                    userType = existingRecord.userType;
                    profileMethod = existingRecord.profileMethod;
                    personalInfo = existingRecord.personalInfo;
                    skills = existingRecord.skills;
                    address = existingRecord.address;
                    profile = existingRecord.profile;
                    final = existingRecord.final;
                    companyData = existingRecord.companyData;
                    isComplete = true;
                    createdAt = existingRecord.createdAt;
                    updatedAt = Time.now();
                    completedAt = ?Time.now();
                };

                onboardingRecords.put(email, completedRecord);
                #ok(())
            };
        }
    };

    // Get onboarding record - ONLY callable by main canister
    public shared(msg) func getOnboardingRecord(email: Text) : async Result.Result<OnboardingRecord, Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        switch (onboardingRecords.get(email)) {
            case null { #err(#NotFound) };
            case (?record) { #ok(record) };
        }
    };

    // Get all onboarding records - ONLY callable by main canister
    public shared(msg) func getAllOnboardingRecords() : async Result.Result<[(Text, OnboardingRecord)], Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        let records = Iter.toArray(onboardingRecords.entries());
        #ok(records)
    };

    // Get onboarding records by completion status - ONLY callable by main canister
    public shared(msg) func getOnboardingRecordsByStatus(isComplete: Bool) : async Result.Result<[(Text, OnboardingRecord)], Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        let allRecords = Iter.toArray(onboardingRecords.entries());
        let filteredRecords = Array.filter<(Text, OnboardingRecord)>(allRecords, func((email, record)) {
            record.isComplete == isComplete
        });
        
        #ok(filteredRecords)
    };

    // Get onboarding records by user type - ONLY callable by main canister
    public shared(msg) func getOnboardingRecordsByUserType(userType: Text) : async Result.Result<[(Text, OnboardingRecord)], Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        if (userType != "freelancer" and userType != "client") {
            return #err(#InvalidUserType);
        };

        let allRecords = Iter.toArray(onboardingRecords.entries());
        let filteredRecords = Array.filter<(Text, OnboardingRecord)>(allRecords, func((email, record)) {
            record.userType == userType
        });
        
        #ok(filteredRecords)
    };

    // Delete onboarding record - ONLY callable by main canister
    public shared(msg) func deleteOnboardingRecord(email: Text) : async Result.Result<(), Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        switch (onboardingRecords.remove(email)) {
            case null { #err(#NotFound) };
            case (?_record) { #ok(()) };
        }
    };

    // Get onboarding statistics - ONLY callable by main canister
    public shared(msg) func getOnboardingStats() : async Result.Result<{
        totalRecords: Nat;
        completedRecords: Nat;
        pendingRecords: Nat;
        freelancerRecords: Nat;
        clientRecords: Nat;
    }, Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        let allRecords = Iter.toArray(onboardingRecords.entries());
        var completedCount = 0;
        var freelancerCount = 0;
        var clientCount = 0;

        for ((email, record) in allRecords.vals()) {
            if (record.isComplete) {
                completedCount += 1;
            };
            if (record.userType == "freelancer") {
                freelancerCount += 1;
            } else if (record.userType == "client") {
                clientCount += 1;
            };
        };

        let totalCount = allRecords.size();
        let pendingCount = if (totalCount > completedCount) totalCount - completedCount else 0;

        #ok({
            totalRecords = totalCount;
            completedRecords = completedCount;
            pendingRecords = pendingCount;
            freelancerRecords = freelancerCount;
            clientRecords = clientCount;
        })
    };
}