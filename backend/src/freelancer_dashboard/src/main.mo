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
        slug: Text; // Unique slug for SEO-friendly URLs
        serviceTitle: Text;
        mainCategory: Text;
        subCategory: Text;
        description: Text;
        requirementPlans: RequirementPlans;
        additionalCharges: AdditionalCharges;
        portfolioImages: [Text]; // Array of up to 5 image URLs
        additionalQuestions: [QuestionAnswer];
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

    // Question and Answer structure
    public type QuestionAnswer = {
        question: Text;
        answer: Text;
        questionType: Text; // "text", "checkbox", "dropdown"
        options: [Text]; // For checkbox and dropdown types
        isRequired: Bool;
    };

    // Error types
    public type Error = {
        #NotFound;
        #InvalidData;
        #Unauthorized;
        #InvalidEmail;
        #TooManyImages;
        #InvalidPlanData;
        #SlugAlreadyExists;
        #InvalidSlug;
    };

    // Main canister principal - will be set during initialization
    private transient var mainCanisterPrincipal : ?Principal = null;

    // Stable storage for upgrades
    private var profilesEntries : [(Text, FreelancerProfile)] = [];
    private transient var profiles = HashMap.HashMap<Text, FreelancerProfile>(10, Text.equal, Text.hash);
    
    // Slug storage for reverse lookup
    private var slugEntries : [(Text, Text)] = []; // (slug, email)
    private transient var slugToEmail = HashMap.HashMap<Text, Text>(10, Text.equal, Text.hash);

    // System functions for upgrades
    system func preupgrade() {
        profilesEntries := Iter.toArray(profiles.entries());
        slugEntries := Iter.toArray(slugToEmail.entries());
    };

    system func postupgrade() {
        profiles := HashMap.fromIter<Text, FreelancerProfile>(
            profilesEntries.vals(), 
            profilesEntries.size(), 
            Text.equal, 
            Text.hash
        );
        slugToEmail := HashMap.fromIter<Text, Text>(
            slugEntries.vals(),
            slugEntries.size(),
            Text.equal,
            Text.hash
        );
        profilesEntries := [];
        slugEntries := [];
    };

    // Set main canister principal (called during initialization)
    public shared(_msg) func setMainCanister() : async () {
        mainCanisterPrincipal := ?_msg.caller;
    };

    // Access control modifier
    private func _onlyMainCanister(caller: Principal) : Bool {
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

    // Validate slug format
    private func validateSlug(slug: Text) : Bool {
        slug.size() > 0 and slug.size() <= 100 and
        Text.contains(slug, #char ' ') == false and
        Text.contains(slug, #char '/') == false and
        Text.contains(slug, #char '\\') == false and
        Text.contains(slug, #char '?') == false and
        Text.contains(slug, #char '#') == false and
        Text.contains(slug, #char '[') == false and
        Text.contains(slug, #char ']') == false and
        Text.contains(slug, #char '@') == false and
        Text.contains(slug, #char '!') == false and
        Text.contains(slug, #char '$') == false and
        Text.contains(slug, #char '&') == false and
        Text.contains(slug, #char '\'') == false and // Single quote
        Text.contains(slug, #char '(') == false and // Left parenthesis
        Text.contains(slug, #char ')') == false and // Right parenthesis
        Text.contains(slug, #char '*') == false and
        Text.contains(slug, #char '+') == false and
        Text.contains(slug, #char ',') == false and
        Text.contains(slug, #char ';') == false and
        Text.contains(slug, #char '=') == false and
        Text.contains(slug, #char '%') == false
    };

    // Generate slug from service title
    private func generateSlug(serviceTitle: Text, email: Text) : Text {
        // Convert to lowercase and replace spaces with hyphens
        let baseSlug = Text.replace(Text.toLowercase(serviceTitle), #text " ", "-");
        
        // Remove special characters and keep only alphanumeric and hyphens
        let cleanSlug = Text.replace(
            Text.replace(
                Text.replace(
                    Text.replace(
                        Text.replace(baseSlug, #text ".", ""),
                        #text ",", ""
                    ),
                    #text "!", ""
                ),
                #text "?", ""
            ),
            #text "&", "and"
        );
        
        // Add email hash to ensure uniqueness
        let emailHash = Text.hash(email);
        let emailHashStr = debug_show(emailHash);
        // Use the full hash string for uniqueness
        let shortHash = emailHashStr;
        cleanSlug # "-" # shortHash
    };

    // Check if slug is unique
    private func isSlugUnique(slug: Text) : Bool {
        switch (slugToEmail.get(slug)) {
            case null { true };
            case (?_) { false };
        }
    };

    // Create freelancer profile - Public access
    public shared(_msg) func createProfile(email: Text, profile: FreelancerProfile) : async Result.Result<FreelancerProfile, Error> {
        // Authorization removed - allow direct API calls

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

                // Generate or validate slug
                let finalSlug = if (profile.slug.size() > 0) {
                    // Validate provided slug
                    if (not validateSlug(profile.slug)) {
                        return #err(#InvalidSlug);
                    };
                    if (not isSlugUnique(profile.slug)) {
                        return #err(#SlugAlreadyExists);
                    };
                    profile.slug
                } else {
                    // Generate slug from service title
                    generateSlug(profile.serviceTitle, email)
                };

                // Create new profile with timestamps
                let newProfile = {
                    email = email;
                    slug = finalSlug;
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

                // Store the profile and slug mapping
                profiles.put(email, newProfile);
                slugToEmail.put(finalSlug, email);
                #ok(newProfile)
            };
        }
    };

    // Update freelancer profile - Public access
    public shared(_msg) func updateProfile(email: Text, profile: FreelancerProfile) : async Result.Result<FreelancerProfile, Error> {
        // Authorization removed - allow direct API calls

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

                // Handle slug changes
                let finalSlug = if (profile.slug != existingProfile.slug) {
                    // Slug is being changed
                    if (not validateSlug(profile.slug)) {
                        return #err(#InvalidSlug);
                    };
                    if (not isSlugUnique(profile.slug)) {
                        return #err(#SlugAlreadyExists);
                    };
                    // Remove old slug mapping
                    slugToEmail.delete(existingProfile.slug);
                    // Add new slug mapping
                    slugToEmail.put(profile.slug, email);
                    profile.slug
                } else {
                    // Slug remains the same
                    existingProfile.slug
                };

                // Update profile with new data but preserve original timestamps
                let updatedProfile = {
                    email = email;
                    slug = finalSlug;
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

    // Get freelancer profile by email - Public access
    public shared(_msg) func getProfile(email: Text) : async Result.Result<FreelancerProfile, Error> {
        // Authorization removed - allow direct API calls

        switch (profiles.get(email)) {
            case null { #err(#NotFound) };
            case (?profile) { #ok(profile) };
        }
    };

    // Get freelancer profile by slug - Public access
    public shared(_msg) func getProfileBySlug(slug: Text) : async Result.Result<FreelancerProfile, Error> {
        // Authorization removed - allow direct API calls

        switch (slugToEmail.get(slug)) {
            case null { #err(#NotFound) };
            case (?email) {
                switch (profiles.get(email)) {
                    case null { #err(#NotFound) };
                    case (?profile) { #ok(profile) };
                }
            };
        }
    };

    // Get all freelancer profiles - Public access
    public shared(_msg) func getAllProfiles() : async Result.Result<[(Text, FreelancerProfile)], Error> {
        // Authorization removed - allow direct API calls

        #ok(Iter.toArray(profiles.entries()))
    };

    // Get active freelancer profiles - Public access
    public shared(_msg) func getActiveProfiles() : async Result.Result<[(Text, FreelancerProfile)], Error> {
        // Authorization removed - allow direct API calls

        let activeProfiles = Iter.toArray(
            Iter.filter<(Text, FreelancerProfile)>(
                profiles.entries(),
                func((_, profile)) = profile.isActive
            )
        );
        #ok(activeProfiles)
    };

    // Get profiles by category - Public access
    public shared(_msg) func getProfilesByCategory(mainCategory: Text) : async Result.Result<[(Text, FreelancerProfile)], Error> {
        // Authorization removed - allow direct API calls

        let categoryProfiles = Iter.toArray(
            Iter.filter<(Text, FreelancerProfile)>(
                profiles.entries(),
                func((_, profile)) = profile.mainCategory == mainCategory and profile.isActive
            )
        );
        #ok(categoryProfiles)
    };

    // Get profiles by subcategory - Public access
    public shared(_msg) func getProfilesBySubCategory(mainCategory: Text, subCategory: Text) : async Result.Result<[(Text, FreelancerProfile)], Error> {
        // Authorization removed - allow direct API calls

        let subCategoryProfiles = Iter.toArray(
            Iter.filter<(Text, FreelancerProfile)>(
                profiles.entries(),
                func((_, profile)) = profile.mainCategory == mainCategory and profile.subCategory == subCategory and profile.isActive
            )
        );
        #ok(subCategoryProfiles)
    };

    // Delete freelancer profile - Public access
    public shared(_msg) func deleteProfile(email: Text) : async Result.Result<(), Error> {
        // Authorization removed - allow direct API calls

        switch (profiles.get(email)) {
            case null { #err(#NotFound) };
            case (?profile) {
                // Remove slug mapping
                slugToEmail.delete(profile.slug);
                // Remove profile
                profiles.delete(email);
                #ok(())
            };
        }
    };

    // Deactivate freelancer profile - Public access
    public shared(_msg) func deactivateProfile(email: Text) : async Result.Result<FreelancerProfile, Error> {
        // Authorization removed - allow direct API calls

        switch (profiles.get(email)) {
            case null { #err(#NotFound) };
            case (?profile) {
                let deactivatedProfile = {
                    email = profile.email;
                    slug = profile.slug;
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

    // Activate freelancer profile - Public access
    public shared(_msg) func activateProfile(email: Text) : async Result.Result<FreelancerProfile, Error> {
        // Authorization removed - allow direct API calls

        switch (profiles.get(email)) {
            case null { #err(#NotFound) };
            case (?profile) {
                let activatedProfile = {
                    email = profile.email;
                    slug = profile.slug;
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

    // Check if profile exists - Public access
    public shared(_msg) func profileExists(email: Text) : async Result.Result<Bool, Error> {
        // Authorization removed - allow direct API calls

        switch (profiles.get(email)) {
            case null { #ok(false) };
            case (?_profile) { #ok(true) };
        }
    };

    // Get total profiles count - Public access
    public shared(_msg) func getTotalProfiles() : async Result.Result<Nat, Error> {
        // Authorization removed - allow direct API calls

        #ok(profiles.size())
    };

    // Get active profiles count - Public access
    public shared(_msg) func getActiveProfilesCount() : async Result.Result<Nat, Error> {
        // Authorization removed - allow direct API calls

        let activeCount = Iter.size(
            Iter.filter<(Text, FreelancerProfile)>(
                profiles.entries(),
                func((_, profile)) = profile.isActive
            )
        );
        #ok(activeCount)
    };

    // Search profiles by service title - Public access
    public shared(_msg) func searchProfilesByTitle(searchTerm: Text) : async Result.Result<[(Text, FreelancerProfile)], Error> {
        // Authorization removed - allow direct API calls

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
