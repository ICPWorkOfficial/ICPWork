import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";

persistent actor FreelancerStorage {
    
    // Define the Freelancer type
    public type Freelancer = {
        name: Text;
        skills: [Text]; // Maximum 5 skills
        country: Text;
        state: Text;
        city: Text;
        zipCode: Text;
        streetAddress: Text;
        photo: ?Text; // Optional photo URL or base64 string
        phoneNumber: Text;
        linkedinProfile: ?Text; // Optional LinkedIn profile URL
    };

    // Error types
    public type Error = {
        #NotFound;
        #InvalidSkillsCount;
        #Unauthorized;
        #InvalidEmail;
    };

    // Main canister principal - will be set during initialization
    private transient var mainCanisterPrincipal : ?Principal = null;

    // Stable storage for upgrades
    private var freelancersEntries : [(Text, Freelancer)] = [];
    private transient var freelancers = HashMap.HashMap<Text, Freelancer>(10, Text.equal, Text.hash);

    // System functions for upgrades
    system func preupgrade() {
        freelancersEntries := Iter.toArray(freelancers.entries());
    };

    system func postupgrade() {
        freelancers := HashMap.fromIter<Text, Freelancer>(
            freelancersEntries.vals(), 
            freelancersEntries.size(), 
            Text.equal, 
            Text.hash
        );
        freelancersEntries := [];
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

    // Validate skills array (max 5 skills)
    private func validateSkills(skills: [Text]) : Bool {
        skills.size() <= 5 and skills.size() > 0
    };

    // Store freelancer profile - ONLY callable by main canister
    public shared(msg) func storeFreelancer(email: Text, freelancer: Freelancer) : async Result.Result<(), Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        // Validate skills count
        if (not validateSkills(freelancer.skills)) {
            return #err(#InvalidSkillsCount);
        };

        // Store the freelancer with email as key
        freelancers.put(email, freelancer);
        #ok(())
    };

    // Update freelancer profile - ONLY callable by main canister
    public shared(msg) func updateFreelancer(email: Text, freelancer: Freelancer) : async Result.Result<(), Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };
        
        // Check if freelancer exists
        switch (freelancers.get(email)) {
            case null { #err(#NotFound) };
            case (?_existing) {
                // Validate skills count
                if (not validateSkills(freelancer.skills)) {
                    return #err(#InvalidSkillsCount);
                };
                
                // Update the freelancer
                freelancers.put(email, freelancer);
                #ok(())
            };
        }
    };

    // Get freelancer by email - ONLY callable by main canister
    public shared(msg) func getFreelancer(email: Text) : async Result.Result<Freelancer, Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        switch (freelancers.get(email)) {
            case null { #err(#NotFound) };
            case (?freelancer) { #ok(freelancer) };
        }
    };

    // Delete freelancer profile - ONLY callable by main canister
    public shared(msg) func deleteFreelancer(email: Text) : async Result.Result<(), Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        switch (freelancers.remove(email)) {
            case null { #err(#NotFound) };
            case (?_removed) { #ok(()) };
        }
    };

    // Get all freelancers - ONLY callable by main canister
    public shared(msg) func getAllFreelancers() : async Result.Result<[(Text, Freelancer)], Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        #ok(Iter.toArray(freelancers.entries()))
    };

    // Check if freelancer exists - ONLY callable by main canister
    public shared(msg) func freelancerExists(email: Text) : async Result.Result<Bool, Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        switch (freelancers.get(email)) {
            case null { #ok(false) };
            case (?_freelancer) { #ok(true) };
        }
    };

    // Get total freelancers count - ONLY callable by main canister
    public shared(msg) func getTotalFreelancers() : async Result.Result<Nat, Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        #ok(freelancers.size())
    };
}