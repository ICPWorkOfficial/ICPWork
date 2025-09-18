import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Time "mo:base/Time";

persistent actor FreelancerDashboard {
    
    // Define the FreelancerProfile type
    public type FreelancerProfile = {
        email: Text;
        serviceTitle: Text;
        mainCategory: Text;
        subCategory: Text;
        description: Text;
        requirementPlans: RequirementPlans;
        additionalCharges: AdditionalCharges;
        portfolioImages: [Text]; // Array of up to 5 image URLs
        additionalQuestions: [Text];
        createdAt: Int;
        updatedAt: Int;
        isActive: Bool;
    };

    // Requirement plans structure
    public type RequirementPlans = {
        basic: PlanDetails;
        advanced: PlanDetails;
        premium: PlanDetails;
    };

    // Plan details structure
    public type PlanDetails = {
        price: Text;
        description: Text;
        features: [Text];
        deliveryTime: Text; // e.g., "3 days", "1 week"
    };

    // Additional charges structure
    public type AdditionalCharges = {
        fastDelivery: ?ChargeDetails;
        additionalChanges: ?ChargeDetails;
        perExtraChange: ?ChargeDetails;
    };

    // Charge details structure
    public type ChargeDetails = {
        price: Text;
        description: Text;
        isEnabled: Bool;
    };

    // Error types
    public type Error = {
        #NotFound;
        #InvalidData;
        #Unauthorized;
        #InvalidEmail;
        #TooManyImages;
        #InvalidPlanData;
    };

    // Main canister principal - will be set during initialization
    private transient var mainCanisterPrincipal : ?Principal = null;

    // Stable storage for upgrades
    private var profilesEntries : [(Text, FreelancerProfile)] = [];
    private transient var profiles = HashMap.HashMap<Text, FreelancerProfile>(10, Text.equal, Text.hash);

    // System functions for upgrades
    system func preupgrade() {
        profilesEntries := Iter.toArray(profiles.entries());
    };

    system func postupgrade() {
        profiles := HashMap.fromIter<Text, FreelancerProfile>(
            profilesEntries.vals(), 
            profilesEntries.size(), 
            Text.equal, 
            Text.hash
        );
        profilesEntries := [];
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

    // Validate portfolio images (max 5 images)
    private func validatePortfolioImages(images: [Text]) : Bool {
        images.size() <= 5
    };

    // Validate plan data
    private func validatePlanData(plans: RequirementPlans) : Bool {
        plans.basic.price.size() > 0 and
        plans.advanced.price.size() > 0 and
        plans.premium.price.size() > 0 and
        plans.basic.description.size() > 0 and
        plans.advanced.description.size() > 0 and
        plans.premium.description.size() > 0
    };

    // Create freelancer profile - ONLY callable by main canister
    public shared(msg) func createProfile(email: Text, profile: FreelancerProfile) : async Result.Result<FreelancerProfile, Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        // Validate email
        if (email.size() == 0) {
            return #err(#InvalidEmail);
        };

        // Check if profile already exists
        switch (profiles.get(email)) {
            case (?_) { return #err(#InvalidData) }; // Profile already exists
            case null {
                // Validate portfolio images
                if (not validatePortfolioImages(profile.portfolioImages)) {
                    return #err(#TooManyImages);
                };

                // Validate plan data
                if (not validatePlanData(profile.requirementPlans)) {
                    return #err(#InvalidPlanData);
                };

                // Create new profile with timestamps
                let newProfile = {
                    email = email;
                    serviceTitle = profile.serviceTitle;
                    mainCategory = profile.mainCategory;
                    subCategory = profile.subCategory;
                    description = profile.description;
                    requirementPlans = profile.requirementPlans;
                    additionalCharges = profile.additionalCharges;
                    portfolioImages = profile.portfolioImages;
                    additionalQuestions = profile.additionalQuestions;
                    createdAt = Time.now();
                    updatedAt = Time.now();
                    isActive = true;
                };

                // Store the profile
                profiles.put(email, newProfile);
                #ok(newProfile)
            };
        }
    };

    // Update freelancer profile - ONLY callable by main canister
    public shared(msg) func updateProfile(email: Text, profile: FreelancerProfile) : async Result.Result<FreelancerProfile, Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        // Check if profile exists
        switch (profiles.get(email)) {
            case null { #err(#NotFound) };
            case (?existingProfile) {
                // Validate portfolio images
                if (not validatePortfolioImages(profile.portfolioImages)) {
                    return #err(#TooManyImages);
                };

                // Validate plan data
                if (not validatePlanData(profile.requirementPlans)) {
                    return #err(#InvalidPlanData);
                };

                // Update profile with new data but preserve original timestamps
                let updatedProfile = {
                    email = email;
                    serviceTitle = profile.serviceTitle;
                    mainCategory = profile.mainCategory;
                    subCategory = profile.subCategory;
                    description = profile.description;
                    requirementPlans = profile.requirementPlans;
                    additionalCharges = profile.additionalCharges;
                    portfolioImages = profile.portfolioImages;
                    additionalQuestions = profile.additionalQuestions;
                    createdAt = existingProfile.createdAt; // Preserve original creation time
                    updatedAt = Time.now(); // Update modification time
                    isActive = profile.isActive;
                };

                // Update the profile
                profiles.put(email, updatedProfile);
                #ok(updatedProfile)
            };
        }
    };

    // Get freelancer profile by email - ONLY callable by main canister
    public shared(msg) func getProfile(email: Text) : async Result.Result<FreelancerProfile, Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        switch (profiles.get(email)) {
            case null { #err(#NotFound) };
            case (?profile) { #ok(profile) };
        }
    };

    // Get all freelancer profiles - ONLY callable by main canister
    public shared(msg) func getAllProfiles() : async Result.Result<[(Text, FreelancerProfile)], Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        #ok(Iter.toArray(profiles.entries()))
    };

    // Get active freelancer profiles - ONLY callable by main canister
    public shared(msg) func getActiveProfiles() : async Result.Result<[(Text, FreelancerProfile)], Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        let activeProfiles = Iter.toArray(
            Iter.filter<(Text, FreelancerProfile)>(
                profiles.entries(),
                func((_, profile)) = profile.isActive
            )
        );
        #ok(activeProfiles)
    };

    // Get profiles by category - ONLY callable by main canister
    public shared(msg) func getProfilesByCategory(mainCategory: Text) : async Result.Result<[(Text, FreelancerProfile)], Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        let categoryProfiles = Iter.toArray(
            Iter.filter<(Text, FreelancerProfile)>(
                profiles.entries(),
                func((_, profile)) = profile.mainCategory == mainCategory and profile.isActive
            )
        );
        #ok(categoryProfiles)
    };

    // Get profiles by subcategory - ONLY callable by main canister
    public shared(msg) func getProfilesBySubCategory(mainCategory: Text, subCategory: Text) : async Result.Result<[(Text, FreelancerProfile)], Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        let subCategoryProfiles = Iter.toArray(
            Iter.filter<(Text, FreelancerProfile)>(
                profiles.entries(),
                func((_, profile)) = profile.mainCategory == mainCategory and profile.subCategory == subCategory and profile.isActive
            )
        );
        #ok(subCategoryProfiles)
    };

    // Delete freelancer profile - ONLY callable by main canister
    public shared(msg) func deleteProfile(email: Text) : async Result.Result<(), Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        switch (profiles.remove(email)) {
            case null { #err(#NotFound) };
            case (?_removed) { #ok(()) };
        }
    };

    // Deactivate freelancer profile - ONLY callable by main canister
    public shared(msg) func deactivateProfile(email: Text) : async Result.Result<FreelancerProfile, Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        switch (profiles.get(email)) {
            case null { #err(#NotFound) };
            case (?profile) {
                let deactivatedProfile = {
                    email = profile.email;
                    serviceTitle = profile.serviceTitle;
                    mainCategory = profile.mainCategory;
                    subCategory = profile.subCategory;
                    description = profile.description;
                    requirementPlans = profile.requirementPlans;
                    additionalCharges = profile.additionalCharges;
                    portfolioImages = profile.portfolioImages;
                    additionalQuestions = profile.additionalQuestions;
                    createdAt = profile.createdAt;
                    updatedAt = Time.now();
                    isActive = false;
                };

                profiles.put(email, deactivatedProfile);
                #ok(deactivatedProfile)
            };
        }
    };

    // Activate freelancer profile - ONLY callable by main canister
    public shared(msg) func activateProfile(email: Text) : async Result.Result<FreelancerProfile, Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        switch (profiles.get(email)) {
            case null { #err(#NotFound) };
            case (?profile) {
                let activatedProfile = {
                    email = profile.email;
                    serviceTitle = profile.serviceTitle;
                    mainCategory = profile.mainCategory;
                    subCategory = profile.subCategory;
                    description = profile.description;
                    requirementPlans = profile.requirementPlans;
                    additionalCharges = profile.additionalCharges;
                    portfolioImages = profile.portfolioImages;
                    additionalQuestions = profile.additionalQuestions;
                    createdAt = profile.createdAt;
                    updatedAt = Time.now();
                    isActive = true;
                };

                profiles.put(email, activatedProfile);
                #ok(activatedProfile)
            };
        }
    };

    // Check if profile exists - ONLY callable by main canister
    public shared(msg) func profileExists(email: Text) : async Result.Result<Bool, Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        switch (profiles.get(email)) {
            case null { #ok(false) };
            case (?_profile) { #ok(true) };
        }
    };

    // Get total profiles count - ONLY callable by main canister
    public shared(msg) func getTotalProfiles() : async Result.Result<Nat, Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        #ok(profiles.size())
    };

    // Get active profiles count - ONLY callable by main canister
    public shared(msg) func getActiveProfilesCount() : async Result.Result<Nat, Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        let activeCount = Iter.size(
            Iter.filter<(Text, FreelancerProfile)>(
                profiles.entries(),
                func((_, profile)) = profile.isActive
            )
        );
        #ok(activeCount)
    };

    // Search profiles by service title - ONLY callable by main canister
    public shared(msg) func searchProfilesByTitle(searchTerm: Text) : async Result.Result<[(Text, FreelancerProfile)], Error> {
        // Check if caller is main canister
        if (not onlyMainCanister(msg.caller)) {
            return #err(#Unauthorized);
        };

        let searchResults = Iter.toArray(
            Iter.filter<(Text, FreelancerProfile)>(
                profiles.entries(),
                func((_, profile)) = 
                    Text.contains(profile.serviceTitle, #text searchTerm) and profile.isActive
            )
        );
        #ok(searchResults)
    };
}
