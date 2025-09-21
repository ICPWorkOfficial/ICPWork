import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Nat "mo:base/Nat";

persistent actor ProjectStore {
    // Project data types
    public type ProjectStatus = {
        #Open;
        #InProgress;
        #Completed;
        #Cancelled;
    };

    public type Project = {
        id: Text;
        title: Text;
        description: Text;
        requirements: Text;
        budget: Text;
        timeline: Text;
        category: Text;
        skills: [Text];
        clientEmail: Text;
        status: ProjectStatus;
        createdAt: Int;
        updatedAt: Int;
        applications: [Text]; // Array of freelancer emails who applied
    };

    public type ProjectApplication = {
        id: Text;
        projectId: Text;
        freelancerEmail: Text;
        proposal: Text;
        whyFit: Text;
        estimatedTime: Text;
        bidAmount: Text;
        createdAt: Int;
        status: {
            #Pending;
            #Accepted;
            #Rejected;
        };
    };

    // Error types
    public type Error = {
        #NotFound;
        #InvalidData;
        #Unauthorized;
        #InvalidEmail;
        #ProjectNotFound;
        #ApplicationNotFound;
    };

    // Storage
    private transient var projects = HashMap.HashMap<Text, Project>(0, Text.equal, Text.hash);
    private transient var applications = HashMap.HashMap<Text, ProjectApplication>(0, Text.equal, Text.hash);
    private transient var nextProjectId: Nat = 1;
    private transient var nextApplicationId: Nat = 1;

    // Create a new project
    public shared(_msg) func createProject(
        title: Text,
        description: Text,
        requirements: Text,
        budget: Text,
        timeline: Text,
        category: Text,
        skills: [Text],
        clientEmail: Text
    ) : async Result.Result<Project, Error> {
        // Validate input
        if (title.size() == 0 or description.size() == 0 or clientEmail.size() == 0) {
            return #err(#InvalidData);
        };

        let projectId = "proj_" # Nat.toText(nextProjectId);
        nextProjectId += 1;

        let newProject: Project = {
            id = projectId;
            title = title;
            description = description;
            requirements = requirements;
            budget = budget;
            timeline = timeline;
            category = category;
            skills = skills;
            clientEmail = clientEmail;
            status = #Open;
            createdAt = Time.now();
            updatedAt = Time.now();
            applications = [];
        };

        projects.put(projectId, newProject);
        #ok(newProject)
    };

    // Get project by ID
    public shared(_msg) func getProject(projectId: Text) : async Result.Result<Project, Error> {
        switch (projects.get(projectId)) {
            case null { #err(#ProjectNotFound) };
            case (?project) { #ok(project) };
        }
    };

    // Get all projects
    public shared(_msg) func getAllProjects() : async Result.Result<[(Text, Project)], Error> {
        #ok(Iter.toArray(projects.entries()))
    };

    // Get projects by client email
    public shared(_msg) func getProjectsByClient(clientEmail: Text) : async Result.Result<[(Text, Project)], Error> {
        let clientProjects = Iter.toArray(
            Iter.filter<(Text, Project)>(
                projects.entries(),
                func((_, project)) = project.clientEmail == clientEmail
            )
        );
        #ok(clientProjects)
    };

    // Get open projects (for freelancers to browse)
    public shared(_msg) func getOpenProjects() : async Result.Result<[(Text, Project)], Error> {
        let openProjects = Iter.toArray(
            Iter.filter<(Text, Project)>(
                projects.entries(),
                func((_, project)) = project.status == #Open
            )
        );
        #ok(openProjects)
    };

    // Update project status
    public shared(_msg) func updateProjectStatus(projectId: Text, status: ProjectStatus) : async Result.Result<Project, Error> {
        switch (projects.get(projectId)) {
            case null { #err(#ProjectNotFound) };
            case (?project) {
                let updatedProject = {
                    id = project.id;
                    title = project.title;
                    description = project.description;
                    requirements = project.requirements;
                    budget = project.budget;
                    timeline = project.timeline;
                    category = project.category;
                    skills = project.skills;
                    clientEmail = project.clientEmail;
                    status = status;
                    createdAt = project.createdAt;
                    updatedAt = Time.now();
                    applications = project.applications;
                };
                projects.put(projectId, updatedProject);
                #ok(updatedProject)
            };
        }
    };

    // Apply to project
    public shared(_msg) func applyToProject(
        projectId: Text,
        freelancerEmail: Text,
        proposal: Text,
        whyFit: Text,
        estimatedTime: Text,
        bidAmount: Text
    ) : async Result.Result<ProjectApplication, Error> {
        // Check if project exists and is open
        switch (projects.get(projectId)) {
            case null { return #err(#ProjectNotFound) };
            case (?project) {
                if (project.status != #Open) {
                    return #err(#InvalidData);
                };

                // Check if freelancer already applied
                if (Array.find<Text>(project.applications, func(email) = email == freelancerEmail) != null) {
                    return #err(#InvalidData);
                };

                let applicationId = "app_" # Nat.toText(nextApplicationId);
                nextApplicationId += 1;

                let newApplication: ProjectApplication = {
                    id = applicationId;
                    projectId = projectId;
                    freelancerEmail = freelancerEmail;
                    proposal = proposal;
                    whyFit = whyFit;
                    estimatedTime = estimatedTime;
                    bidAmount = bidAmount;
                    createdAt = Time.now();
                    status = #Pending;
                };

                applications.put(applicationId, newApplication);

                // Add freelancer to project applications
                let updatedApplications = Array.append<Text>(project.applications, [freelancerEmail]);
                let updatedProject = {
                    id = project.id;
                    title = project.title;
                    description = project.description;
                    requirements = project.requirements;
                    budget = project.budget;
                    timeline = project.timeline;
                    category = project.category;
                    skills = project.skills;
                    clientEmail = project.clientEmail;
                    status = project.status;
                    createdAt = project.createdAt;
                    updatedAt = Time.now();
                    applications = updatedApplications;
                };
                projects.put(projectId, updatedProject);

                #ok(newApplication)
            };
        }
    };

    // Get applications for a project
    public shared(_msg) func getProjectApplications(projectId: Text) : async Result.Result<[ProjectApplication], Error> {
        let projectApplications = Iter.toArray(
            Iter.filter<(Text, ProjectApplication)>(
                applications.entries(),
                func((_, application)) = application.projectId == projectId
            )
        );
        #ok(Array.map<(Text, ProjectApplication), ProjectApplication>(
            projectApplications,
            func((_, application)) = application
        ))
    };

    // Get applications by freelancer
    public shared(_msg) func getFreelancerApplications(freelancerEmail: Text) : async Result.Result<[ProjectApplication], Error> {
        let freelancerApplications = Iter.toArray(
            Iter.filter<(Text, ProjectApplication)>(
                applications.entries(),
                func((_, application)) = application.freelancerEmail == freelancerEmail
            )
        );
        #ok(Array.map<(Text, ProjectApplication), ProjectApplication>(
            freelancerApplications,
            func((_, application)) = application
        ))
    };

    // Accept/Reject application
    public shared(_msg) func updateApplicationStatus(
        applicationId: Text,
        status: {
            #Accepted;
            #Rejected;
        }
    ) : async Result.Result<ProjectApplication, Error> {
        switch (applications.get(applicationId)) {
            case null { #err(#ApplicationNotFound) };
            case (?application) {
                let updatedApplication = {
                    id = application.id;
                    projectId = application.projectId;
                    freelancerEmail = application.freelancerEmail;
                    proposal = application.proposal;
                    whyFit = application.whyFit;
                    estimatedTime = application.estimatedTime;
                    bidAmount = application.bidAmount;
                    createdAt = application.createdAt;
                    status = status;
                };
                applications.put(applicationId, updatedApplication);

                // If application is accepted, update project status to InProgress
                if (status == #Accepted) {
                    switch (projects.get(application.projectId)) {
                        case null { };
                        case (?project) {
                            let updatedProject = {
                                id = project.id;
                                title = project.title;
                                description = project.description;
                                requirements = project.requirements;
                                budget = project.budget;
                                timeline = project.timeline;
                                category = project.category;
                                skills = project.skills;
                                clientEmail = project.clientEmail;
                                status = #InProgress;
                                createdAt = project.createdAt;
                                updatedAt = Time.now();
                                applications = project.applications;
                            };
                            projects.put(application.projectId, updatedProject);
                        };
                    };
                };

                #ok(updatedApplication)
            };
        }
    };

    // Delete project
    public shared(_msg) func deleteProject(projectId: Text) : async Result.Result<(), Error> {
        switch (projects.remove(projectId)) {
            case null { #err(#ProjectNotFound) };
            case (?_removed) { #ok(()) };
        }
    };

    // Get project statistics
    public shared(_msg) func getProjectStats() : async Result.Result<{
        totalProjects: Nat;
        openProjects: Nat;
        inProgressProjects: Nat;
        completedProjects: Nat;
        totalApplications: Nat;
    }, Error> {
        let totalProjects = projects.size();
        let openProjects = Iter.size(
            Iter.filter<(Text, Project)>(
                projects.entries(),
                func((_, project)) = project.status == #Open
            )
        );
        let inProgressProjects = Iter.size(
            Iter.filter<(Text, Project)>(
                projects.entries(),
                func((_, project)) = project.status == #InProgress
            )
        );
        let completedProjects = Iter.size(
            Iter.filter<(Text, Project)>(
                projects.entries(),
                func((_, project)) = project.status == #Completed
            )
        );
        let totalApplications = applications.size();

        #ok({
            totalProjects = totalProjects;
            openProjects = openProjects;
            inProgressProjects = inProgressProjects;
            completedProjects = completedProjects;
            totalApplications = totalApplications;
        })
    };
}
