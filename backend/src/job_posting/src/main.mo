import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Int "mo:base/Int";

persistent actor JobPosting {
    
    // Job posting data types
    public type JobCategory = {
        #Technology;
        #Marketing;
        #Design;
        #Sales;
        #Finance;
        #HumanResources;
        #Operations;
        #CustomerService;
        #Other : Text;
    };

    public type SubCategory = {
        #Frontend;
        #Backend;
        #FullStack;
        #Mobile;
        #DevOps;
        #DataScience;
        #MachineLearning;
        #UIUX;
        #GraphicDesign;
        #DigitalMarketing;
        #ContentMarketing;
        #SEO;
        #SocialMedia;
        #SalesDevelopment;
        #AccountManagement;
        #FinancialAnalysis;
        #Accounting;
        #Recruitment;
        #Training;
        #ProjectManagement;
        #QualityAssurance;
        #CustomerSupport;
        #TechnicalSupport;
        #Other : Text;
    };

    public type WorkplaceType = {
        #Onsite;
        #Remote;
        #Hybrid;
    };

    public type BudgetType = {
        #PerHour;
        #Fixed;
        #Negotiable;
    };

    public type ApplicationType = {
        #Paid;
        #Unpaid;
    };

    public type JobPosting = {
        id: Text;
        clientEmail: Text;
        category: JobCategory;
        subCategory: SubCategory;
        jobTitle: Text;
        rolesAndResponsibilities: [Text];
        skillsRequired: [Text];
        benefits: [Text];
        jobRoles: [Text];
        duration: Text;
        isContractToHire: Bool;
        workplaceType: WorkplaceType;
        location: Text;
        budget: Text;
        budgetType: BudgetType;
        applicationType: ApplicationType;
        applicationDetails: Text;
        isActive: Bool;
        createdAt: Int;
        updatedAt: Int;
        applicationsCount: Nat;
    };

    public type JobPostingInput = {
        clientEmail: Text;
        category: JobCategory;
        subCategory: SubCategory;
        jobTitle: Text;
        rolesAndResponsibilities: [Text];
        skillsRequired: [Text];
        benefits: [Text];
        jobRoles: [Text];
        duration: Text;
        isContractToHire: Bool;
        workplaceType: WorkplaceType;
        location: Text;
        budget: Text;
        budgetType: BudgetType;
        applicationType: ApplicationType;
        applicationDetails: Text;
    };

    public type JobPostingUpdate = {
        category: ?JobCategory;
        subCategory: ?SubCategory;
        jobTitle: ?Text;
        rolesAndResponsibilities: ?[Text];
        skillsRequired: ?[Text];
        benefits: ?[Text];
        jobRoles: ?[Text];
        duration: ?Text;
        isContractToHire: ?Bool;
        workplaceType: ?WorkplaceType;
        location: ?Text;
        budget: ?Text;
        budgetType: ?BudgetType;
        applicationType: ?ApplicationType;
        applicationDetails: ?Text;
        isActive: ?Bool;
    };

    public type Error = {
        #NotFound;
        #Unauthorized;
        #InvalidData;
        #InvalidEmail;
        #JobPostingNotFound;
        #InvalidCategory;
        #InvalidSubCategory;
        #InvalidWorkplaceType;
        #InvalidBudgetType;
        #InvalidApplicationType;
    };

    // Stable storage for upgrades
    private var jobPostingsEntries : [(Text, JobPosting)] = [];
    private transient var jobPostings = HashMap.HashMap<Text, JobPosting>(10, Text.equal, Text.hash);

    // System functions for upgrades
    system func preupgrade() {
        jobPostingsEntries := Iter.toArray(jobPostings.entries());
    };

    system func postupgrade() {
        jobPostings := HashMap.fromIter<Text, JobPosting>(
            jobPostingsEntries.vals(), 
            jobPostingsEntries.size(), 
            Text.equal, 
            Text.hash
        );
        jobPostingsEntries := [];
    };

    // Helper function to generate unique job ID
    private func generateJobId() : Text {
        let timestamp = Time.now();
        "job_" # Int.toText(timestamp) # "_" # Int.toText(Array.size(jobPostingsEntries));
    };

    // Validate email format
    private func isValidEmail(email: Text) : Bool {
        Text.contains(email, #text("@")) and
        Text.contains(email, #text("."))
    };

    // Validate job posting data
    private func validateJobPosting(job: JobPostingInput) : ?Error {
        if (not isValidEmail(job.clientEmail)) {
            return ?#InvalidEmail;
        };
        if (Text.size(job.jobTitle) == 0) {
            return ?#InvalidData;
        };
        if (Array.size(job.rolesAndResponsibilities) == 0) {
            return ?#InvalidData;
        };
        if (Array.size(job.skillsRequired) == 0) {
            return ?#InvalidData;
        };
        null
    };

    // Create new job posting
    public shared(_msg) func createJobPosting(jobInput: JobPostingInput) : async Result.Result<JobPosting, Error> {
        // Validate input data
        switch (validateJobPosting(jobInput)) {
            case (?error) { return #err(error) };
            case null {};
        };

        let jobId = generateJobId();
        let now = Time.now();
        
        let newJobPosting: JobPosting = {
            id = jobId;
            clientEmail = jobInput.clientEmail;
            category = jobInput.category;
            subCategory = jobInput.subCategory;
            jobTitle = jobInput.jobTitle;
            rolesAndResponsibilities = jobInput.rolesAndResponsibilities;
            skillsRequired = jobInput.skillsRequired;
            benefits = jobInput.benefits;
            jobRoles = jobInput.jobRoles;
            duration = jobInput.duration;
            isContractToHire = jobInput.isContractToHire;
            workplaceType = jobInput.workplaceType;
            location = jobInput.location;
            budget = jobInput.budget;
            budgetType = jobInput.budgetType;
            applicationType = jobInput.applicationType;
            applicationDetails = jobInput.applicationDetails;
            isActive = true;
            createdAt = now;
            updatedAt = now;
            applicationsCount = 0;
        };
        
        jobPostings.put(jobId, newJobPosting);
        #ok(newJobPosting)
    };

    // Get job posting by ID
    public query func getJobPosting(jobId: Text) : async Result.Result<JobPosting, Error> {
        switch (jobPostings.get(jobId)) {
            case null { #err(#JobPostingNotFound) };
            case (?job) { #ok(job) };
        }
    };

    // Get all job postings
    public query func getAllJobPostings() : async [JobPosting] {
        Iter.toArray(jobPostings.vals())
    };

    // Get active job postings
    public query func getActiveJobPostings() : async [JobPosting] {
        var activeJobs: [JobPosting] = [];
        for (job in jobPostings.vals()) {
            if (job.isActive) {
                activeJobs := Array.append(activeJobs, [job]);
            };
        };
        activeJobs
    };

    // Get job postings by client email
    public query func getJobPostingsByClient(clientEmail: Text) : async [JobPosting] {
        var clientJobs: [JobPosting] = [];
        for (job in jobPostings.vals()) {
            if (job.clientEmail == clientEmail) {
                clientJobs := Array.append(clientJobs, [job]);
            };
        };
        clientJobs
    };

    // Get job postings by category
    public query func getJobPostingsByCategory(category: JobCategory) : async [JobPosting] {
        var categoryJobs: [JobPosting] = [];
        for (job in jobPostings.vals()) {
            if (job.category == category) {
                categoryJobs := Array.append(categoryJobs, [job]);
            };
        };
        categoryJobs
    };

    // Get job postings by subcategory
    public query func getJobPostingsBySubCategory(subCategory: SubCategory) : async [JobPosting] {
        var subCategoryJobs: [JobPosting] = [];
        for (job in jobPostings.vals()) {
            if (job.subCategory == subCategory) {
                subCategoryJobs := Array.append(subCategoryJobs, [job]);
            };
        };
        subCategoryJobs
    };

    // Get job postings by workplace type
    public query func getJobPostingsByWorkplaceType(workplaceType: WorkplaceType) : async [JobPosting] {
        var workplaceJobs: [JobPosting] = [];
        for (job in jobPostings.vals()) {
            if (job.workplaceType == workplaceType) {
                workplaceJobs := Array.append(workplaceJobs, [job]);
            };
        };
        workplaceJobs
    };

    // Search job postings by title
    public query func searchJobPostingsByTitle(searchTerm: Text) : async [JobPosting] {
        var searchResults: [JobPosting] = [];
        for (job in jobPostings.vals()) {
            if (Text.contains(job.jobTitle, #text(searchTerm))) {
                searchResults := Array.append(searchResults, [job]);
            };
        };
        searchResults
    };

    // Update job posting
    public shared(_msg) func updateJobPosting(jobId: Text, update: JobPostingUpdate) : async Result.Result<JobPosting, Error> {
        switch (jobPostings.get(jobId)) {
            case null { #err(#JobPostingNotFound) };
            case (?existingJob) {
                let now = Time.now();
                
                let updatedJob: JobPosting = {
                    id = existingJob.id;
                    clientEmail = existingJob.clientEmail;
                    category = switch (update.category) {
                        case (?cat) cat;
                        case null existingJob.category;
                    };
                    subCategory = switch (update.subCategory) {
                        case (?subCat) subCat;
                        case null existingJob.subCategory;
                    };
                    jobTitle = switch (update.jobTitle) {
                        case (?title) title;
                        case null existingJob.jobTitle;
                    };
                    rolesAndResponsibilities = switch (update.rolesAndResponsibilities) {
                        case (?roles) roles;
                        case null existingJob.rolesAndResponsibilities;
                    };
                    skillsRequired = switch (update.skillsRequired) {
                        case (?skills) skills;
                        case null existingJob.skillsRequired;
                    };
                    benefits = switch (update.benefits) {
                        case (?benefits) benefits;
                        case null existingJob.benefits;
                    };
                    jobRoles = switch (update.jobRoles) {
                        case (?roles) roles;
                        case null existingJob.jobRoles;
                    };
                    duration = switch (update.duration) {
                        case (?duration) duration;
                        case null existingJob.duration;
                    };
                    isContractToHire = switch (update.isContractToHire) {
                        case (?contract) contract;
                        case null existingJob.isContractToHire;
                    };
                    workplaceType = switch (update.workplaceType) {
                        case (?workplace) workplace;
                        case null existingJob.workplaceType;
                    };
                    location = switch (update.location) {
                        case (?location) location;
                        case null existingJob.location;
                    };
                    budget = switch (update.budget) {
                        case (?budget) budget;
                        case null existingJob.budget;
                    };
                    budgetType = switch (update.budgetType) {
                        case (?budgetType) budgetType;
                        case null existingJob.budgetType;
                    };
                    applicationType = switch (update.applicationType) {
                        case (?appType) appType;
                        case null existingJob.applicationType;
                    };
                    applicationDetails = switch (update.applicationDetails) {
                        case (?details) details;
                        case null existingJob.applicationDetails;
                    };
                    isActive = switch (update.isActive) {
                        case (?active) active;
                        case null existingJob.isActive;
                    };
                    createdAt = existingJob.createdAt;
                    updatedAt = now;
                    applicationsCount = existingJob.applicationsCount;
                };
                
                jobPostings.put(jobId, updatedJob);
                #ok(updatedJob)
            };
        }
    };

    // Delete job posting
    public shared(_msg) func deleteJobPosting(jobId: Text) : async Result.Result<(), Error> {
        switch (jobPostings.remove(jobId)) {
            case null { #err(#JobPostingNotFound) };
            case (?_removed) { #ok(()) };
        }
    };

    // Increment applications count
    public shared(_msg) func incrementApplicationsCount(jobId: Text) : async Result.Result<(), Error> {
        switch (jobPostings.get(jobId)) {
            case null { #err(#JobPostingNotFound) };
            case (?job) {
                let updatedJob: JobPosting = {
                    id = job.id;
                    clientEmail = job.clientEmail;
                    category = job.category;
                    subCategory = job.subCategory;
                    jobTitle = job.jobTitle;
                    rolesAndResponsibilities = job.rolesAndResponsibilities;
                    skillsRequired = job.skillsRequired;
                    benefits = job.benefits;
                    jobRoles = job.jobRoles;
                    duration = job.duration;
                    isContractToHire = job.isContractToHire;
                    workplaceType = job.workplaceType;
                    location = job.location;
                    budget = job.budget;
                    budgetType = job.budgetType;
                    applicationType = job.applicationType;
                    applicationDetails = job.applicationDetails;
                    isActive = job.isActive;
                    createdAt = job.createdAt;
                    updatedAt = Time.now();
                    applicationsCount = job.applicationsCount + 1;
                };
                jobPostings.put(jobId, updatedJob);
                #ok(())
            };
        }
    };

    // Get job posting statistics
    public query func getJobPostingStats() : async {
        totalJobs: Nat;
        activeJobs: Nat;
        inactiveJobs: Nat;
        totalApplications: Nat;
    } {
        var totalJobs: Nat = 0;
        var activeJobs: Nat = 0;
        var inactiveJobs: Nat = 0;
        var totalApplications: Nat = 0;
        
        for (job in jobPostings.vals()) {
            totalJobs += 1;
            if (job.isActive) {
                activeJobs += 1;
            } else {
                inactiveJobs += 1;
            };
            totalApplications += job.applicationsCount;
        };
        
        {
            totalJobs = totalJobs;
            activeJobs = activeJobs;
            inactiveJobs = inactiveJobs;
            totalApplications = totalApplications;
        }
    };
}