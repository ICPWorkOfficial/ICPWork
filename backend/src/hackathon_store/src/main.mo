import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import _Principal "mo:base/Principal";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Float "mo:base/Float";
import Buffer "mo:base/Buffer";

persistent actor HackathonStorage {
    
    // ===== HACKATHON DATA TYPES =====
    
    public type HackathonStatus = {
        #RegistrationOpen;
        #Upcoming;
        #Ongoing;
        #Completed;
        #Cancelled;
    };

    public type HackathonMode = {
        #Virtual;
        #InPerson;
        #Hybrid;
    };

    public type HackathonCategory = {
        #Web3;
        #DeFi;
        #NFT;
        #SmartContracts;
        #Frontend;
        #Backend;
        #Mobile;
        #AI;
        #Security;
        #Infrastructure;
        #Other : Text;
    };

    public type ParticipantStatus = {
        #Registered;
        #Submitted;
        #Winner;
        #RunnerUp;
        #Disqualified;
        #Withdrawn;
    };

    public type Participant = {
        userId: Text;
        userEmail: Text;
        registeredAt: Int;
        status: ParticipantStatus;
        submissionUrl: ?Text;
        submissionDescription: ?Text;
        submittedAt: ?Int;
        teamMembers: [Text];
        githubRepo: ?Text;
        demoUrl: ?Text;
        presentationUrl: ?Text;
    };

    public type Prize = {
        position: Text; // "1st", "2nd", "3rd", "Participation"
        amount: Text;
        description: ?Text;
        token: ?Text; // ICP, ETH, etc.
    };

    public type Hackathon = {
        id: Text;
        title: Text;
        description: Text;
        organizer: Text;
        organizerId: Text;
        mode: HackathonMode;
        prizePool: Text;
        prizes: [Prize];
        timeline: Text;
        startDate: Int;
        endDate: Int;
        registrationDeadline: Int;
        submissionDeadline: Int;
        tags: [Text];
        category: HackathonCategory;
        status: HackathonStatus;
        featured: Bool;
        requirements: [Text];
        deliverables: [Text];
        judgingCriteria: [Text];
        maxParticipants: ?Nat;
        maxTeamSize: ?Nat;
        createdAt: Int;
        updatedAt: Int;
        participants: [Participant];
        winnerIds: [Text];
        location: ?Text;
        website: ?Text;
        discord: ?Text;
        twitter: ?Text;
        imageUrl: ?Text;
        bannerUrl: ?Text;
    };

    public type HackathonInput = {
        title: Text;
        description: Text;
        organizer: Text;
        mode: HackathonMode;
        prizePool: Text;
        prizes: [Prize];
        timeline: Text;
        startDate: Int;
        endDate: Int;
        registrationDeadline: Int;
        submissionDeadline: Int;
        tags: [Text];
        category: HackathonCategory;
        featured: Bool;
        requirements: [Text];
        deliverables: [Text];
        judgingCriteria: [Text];
        maxParticipants: ?Nat;
        maxTeamSize: ?Nat;
        location: ?Text;
        website: ?Text;
        discord: ?Text;
        twitter: ?Text;
        imageUrl: ?Text;
        bannerUrl: ?Text;
    };

    public type HackathonUpdate = {
        title: ?Text;
        description: ?Text;
        prizePool: ?Text;
        prizes: ?[Prize];
        timeline: ?Text;
        startDate: ?Int;
        endDate: ?Int;
        registrationDeadline: ?Int;
        submissionDeadline: ?Int;
        tags: ?[Text];
        status: ?HackathonStatus;
        featured: ?Bool;
        requirements: ?[Text];
        deliverables: ?[Text];
        judgingCriteria: ?[Text];
        maxParticipants: ?Nat;
        maxTeamSize: ?Nat;
        location: ?Text;
        website: ?Text;
        discord: ?Text;
        twitter: ?Text;
        imageUrl: ?Text;
        bannerUrl: ?Text;
    };

    public type HackathonStats = {
        totalHackathons: Nat;
        activeHackathons: Nat;
        completedHackathons: Nat;
        totalPrizePool: Text;
        totalParticipants: Nat;
        totalWinners: Nat;
    };

    public type HackathonSearchFilters = {
        status: ?HackathonStatus;
        category: ?HackathonCategory;
        mode: ?HackathonMode;
        featured: ?Bool;
        organizer: ?Text;
        tags: ?[Text];
        minPrizePool: ?Text;
        maxParticipants: ?Nat;
    };

    // ===== STORAGE =====
    
    private var hackathonEntries: [(Text, Hackathon)] = [];
    private transient var hackathons = HashMap.HashMap<Text, Hackathon>(
        0, Text.equal, Text.hash
    );

    // ===== SYSTEM FUNCTIONS =====
    
    system func preupgrade() {
        hackathonEntries := Iter.toArray(hackathons.entries());
    };

    system func postupgrade() {
        hackathons := HashMap.fromIter<Text, Hackathon>(
            hackathonEntries.vals(), hackathonEntries.size(), Text.equal, Text.hash
        );
        hackathonEntries := [];
    };

    // ===== UTILITY FUNCTIONS =====
    
    private func generateId(): Text {
        let time = Time.now();
        let random = Int.abs(time % 1000000);
        "hack_" # Int.toText(time) # "_" # Int.toText(random)
    };

    private func isRegistrationOpen(hackathon: Hackathon): Bool {
        let now = Time.now();
        now <= hackathon.registrationDeadline and hackathon.status == #RegistrationOpen
    };

    private func isOngoing(hackathon: Hackathon): Bool {
        let now = Time.now();
        now >= hackathon.startDate and now <= hackathon.endDate and hackathon.status == #Ongoing
    };

    private func _isCompleted(hackathon: Hackathon): Bool {
        let now = Time.now();
        now > hackathon.endDate or hackathon.status == #Completed
    };

    private func _isUpcoming(hackathon: Hackathon): Bool {
        let now = Time.now();
        now < hackathon.startDate and hackathon.status == #Upcoming
    };

    // ===== HACKATHON CRUD OPERATIONS =====
    
    public func createHackathon(organizerEmail: Text, input: HackathonInput): async Result.Result<Hackathon, Text> {
        // Validate input
        if (Text.size(input.title) == 0) {
            return #err("Title is required");
        };
        
        if (Text.size(input.description) == 0) {
            return #err("Description is required");
        };
        
        if (Text.size(input.organizer) == 0) {
            return #err("Organizer is required");
        };
        
        if (input.startDate >= input.endDate) {
            return #err("Start date must be before end date");
        };
        
        if (input.registrationDeadline >= input.startDate) {
            return #err("Registration deadline must be before start date");
        };
        
        if (input.submissionDeadline > input.endDate) {
            return #err("Submission deadline must be before or equal to end date");
        };

        let id = generateId();
        let now = Time.now();
        
        // Determine initial status based on dates
        let initialStatus: HackathonStatus = if (now < input.registrationDeadline) {
            #RegistrationOpen
        } else if (now < input.startDate) {
            #Upcoming
        } else if (now <= input.endDate) {
            #Ongoing
        } else {
            #Completed
        };

        let hackathon: Hackathon = {
            id = id;
            title = input.title;
            description = input.description;
            organizer = input.organizer;
            organizerId = organizerEmail;
            mode = input.mode;
            prizePool = input.prizePool;
            prizes = input.prizes;
            timeline = input.timeline;
            startDate = input.startDate;
            endDate = input.endDate;
            registrationDeadline = input.registrationDeadline;
            submissionDeadline = input.submissionDeadline;
            tags = input.tags;
            category = input.category;
            status = initialStatus;
            featured = input.featured;
            requirements = input.requirements;
            deliverables = input.deliverables;
            judgingCriteria = input.judgingCriteria;
            maxParticipants = input.maxParticipants;
            maxTeamSize = input.maxTeamSize;
            createdAt = now;
            updatedAt = now;
            participants = [];
            winnerIds = [];
            location = input.location;
            website = input.website;
            discord = input.discord;
            twitter = input.twitter;
            imageUrl = input.imageUrl;
            bannerUrl = input.bannerUrl;
        };

        hackathons.put(id, hackathon);
        #ok(hackathon)
    };

    public func updateHackathon(hackathonId: Text, organizerEmail: Text, update: HackathonUpdate): async Result.Result<Hackathon, Text> {
        switch (hackathons.get(hackathonId)) {
            case null { #err("Hackathon not found") };
            case (?hackathon) {
                if (hackathon.organizerId != organizerEmail) {
                    return #err("Unauthorized: Only the organizer can update this hackathon");
                };

                let now = Time.now();
                
                // Create updated hackathon with new values
                let updatedHackathon: Hackathon = {
                    id = hackathon.id;
                    title = switch (update.title) { case null hackathon.title; case (?t) t };
                    description = switch (update.description) { case null hackathon.description; case (?d) d };
                    organizer = hackathon.organizer;
                    organizerId = hackathon.organizerId;
                    mode = hackathon.mode;
                    prizePool = switch (update.prizePool) { case null hackathon.prizePool; case (?p) p };
                    prizes = switch (update.prizes) { case null hackathon.prizes; case (?p) p };
                    timeline = switch (update.timeline) { case null hackathon.timeline; case (?t) t };
                    startDate = switch (update.startDate) { case null hackathon.startDate; case (?s) s };
                    endDate = switch (update.endDate) { case null hackathon.endDate; case (?e) e };
                    registrationDeadline = switch (update.registrationDeadline) { case null hackathon.registrationDeadline; case (?r) r };
                    submissionDeadline = switch (update.submissionDeadline) { case null hackathon.submissionDeadline; case (?s) s };
                    tags = switch (update.tags) { case null hackathon.tags; case (?t) t };
                    category = hackathon.category;
                    status = switch (update.status) { case null hackathon.status; case (?s) s };
                    featured = switch (update.featured) { case null hackathon.featured; case (?f) f };
                    requirements = switch (update.requirements) { case null hackathon.requirements; case (?r) r };
                    deliverables = switch (update.deliverables) { case null hackathon.deliverables; case (?d) d };
                    judgingCriteria = switch (update.judgingCriteria) { case null hackathon.judgingCriteria; case (?j) j };
                    maxParticipants = switch (update.maxParticipants) { case null hackathon.maxParticipants; case (?m) ?m };
                    maxTeamSize = switch (update.maxTeamSize) { case null hackathon.maxTeamSize; case (?m) ?m };
                    createdAt = hackathon.createdAt;
                    updatedAt = now;
                    participants = hackathon.participants;
                    winnerIds = hackathon.winnerIds;
                    location = switch (update.location) { case null hackathon.location; case (?l) ?l };
                    website = switch (update.website) { case null hackathon.website; case (?w) ?w };
                    discord = switch (update.discord) { case null hackathon.discord; case (?d) ?d };
                    twitter = switch (update.twitter) { case null hackathon.twitter; case (?t) ?t };
                    imageUrl = switch (update.imageUrl) { case null hackathon.imageUrl; case (?i) ?i };
                    bannerUrl = switch (update.bannerUrl) { case null hackathon.bannerUrl; case (?b) ?b };
                };

                hackathons.put(hackathonId, updatedHackathon);
                #ok(updatedHackathon)
            };
        }
    };

    public func deleteHackathon(hackathonId: Text, organizerEmail: Text): async Result.Result<(), Text> {
        switch (hackathons.get(hackathonId)) {
            case null { #err("Hackathon not found") };
            case (?hackathon) {
                if (hackathon.organizerId != organizerEmail) {
                    return #err("Unauthorized: Only the organizer can delete this hackathon");
                };

                hackathons.delete(hackathonId);
                #ok(())
            };
        }
    };

    // ===== PARTICIPATION MANAGEMENT =====
    
    public func registerForHackathon(hackathonId: Text, userEmail: Text, teamMembers: [Text]): async Result.Result<(), Text> {
        switch (hackathons.get(hackathonId)) {
            case null { #err("Hackathon not found") };
            case (?hackathon) {
                if (not isRegistrationOpen(hackathon)) {
                    return #err("Registration is not open for this hackathon");
                };

                // Check if user is already registered
                for (participant in hackathon.participants.vals()) {
                    if (participant.userEmail == userEmail) {
                        return #err("User is already registered for this hackathon");
                    };
                };

                // Check max participants
                switch (hackathon.maxParticipants) {
                    case null {};
                    case (?max) {
                        if (hackathon.participants.size() >= max) {
                            return #err("Hackathon has reached maximum participants");
                        };
                    };
                };

                // Check max team size
                switch (hackathon.maxTeamSize) {
                    case null {};
                    case (?maxTeam) {
                        if (teamMembers.size() + 1 > maxTeam) {
                            return #err("Team size exceeds maximum allowed");
                        };
                    };
                };

                let newParticipant: Participant = {
                    userId = userEmail; // Using email as userId for simplicity
                    userEmail = userEmail;
                    registeredAt = Time.now();
                    status = #Registered;
                    submissionUrl = null;
                    submissionDescription = null;
                    submittedAt = null;
                    teamMembers = teamMembers;
                    githubRepo = null;
                    demoUrl = null;
                    presentationUrl = null;
                };

                let updatedParticipants = Array.append(hackathon.participants, [newParticipant]);
                let updatedHackathon = {
                    hackathon with
                    participants = updatedParticipants;
                    updatedAt = Time.now();
                };

                hackathons.put(hackathonId, updatedHackathon);
                #ok(())
            };
        }
    };

    public func submitToHackathon(hackathonId: Text, userEmail: Text, submissionUrl: Text, description: Text, githubRepo: ?Text, demoUrl: ?Text, presentationUrl: ?Text): async Result.Result<(), Text> {
        switch (hackathons.get(hackathonId)) {
            case null { #err("Hackathon not found") };
            case (?hackathon) {
                if (not isOngoing(hackathon)) {
                    return #err("Hackathon is not currently accepting submissions");
                };

                let now = Time.now();
                if (now > hackathon.submissionDeadline) {
                    return #err("Submission deadline has passed");
                };

                // Find and update participant
                let updatedParticipants = Buffer.Buffer<Participant>(0);
                var found = false;

                for (participant in hackathon.participants.vals()) {
                    if (participant.userEmail == userEmail) {
                        let updatedParticipant = {
                            participant with
                            status = #Submitted;
                            submissionUrl = ?submissionUrl;
                            submissionDescription = ?description;
                            submittedAt = ?now;
                            githubRepo = githubRepo;
                            demoUrl = demoUrl;
                            presentationUrl = presentationUrl;
                        };
                        updatedParticipants.add(updatedParticipant);
                        found := true;
                    } else {
                        updatedParticipants.add(participant);
                    };
                };

                if (not found) {
                    return #err("User is not registered for this hackathon");
                };

                let updatedHackathon = {
                    hackathon with
                    participants = Buffer.toArray(updatedParticipants);
                    updatedAt = now;
                };

                hackathons.put(hackathonId, updatedHackathon);
                #ok(())
            };
        }
    };

    public func withdrawFromHackathon(hackathonId: Text, userEmail: Text): async Result.Result<(), Text> {
        switch (hackathons.get(hackathonId)) {
            case null { #err("Hackathon not found") };
            case (?hackathon) {
                let updatedParticipants = Buffer.Buffer<Participant>(0);
                var found = false;

                for (participant in hackathon.participants.vals()) {
                    if (participant.userEmail == userEmail) {
                        let updatedParticipant = {
                            participant with
                            status = #Withdrawn;
                        };
                        updatedParticipants.add(updatedParticipant);
                        found := true;
                    } else {
                        updatedParticipants.add(participant);
                    };
                };

                if (not found) {
                    return #err("User is not registered for this hackathon");
                };

                let updatedHackathon = {
                    hackathon with
                    participants = Buffer.toArray(updatedParticipants);
                    updatedAt = Time.now();
                };

                hackathons.put(hackathonId, updatedHackathon);
                #ok(())
            };
        }
    };

    // ===== QUERY FUNCTIONS =====
    
    public func getHackathon(hackathonId: Text): async ?Hackathon {
        hackathons.get(hackathonId)
    };

    public func getAllHackathons(): async [Hackathon] {
        Iter.toArray(hackathons.vals())
    };

    public func getHackathonsByStatus(status: HackathonStatus): async [Hackathon] {
        let filtered = Buffer.Buffer<Hackathon>(0);
        
        for ((_, hackathon) in hackathons.entries()) {
            if (hackathon.status == status) {
                filtered.add(hackathon);
            };
        };
        
        Buffer.toArray(filtered)
    };

    public func getHackathonsByCategory(category: HackathonCategory): async [Hackathon] {
        let filtered = Buffer.Buffer<Hackathon>(0);
        
        for ((_, hackathon) in hackathons.entries()) {
            if (hackathon.category == category) {
                filtered.add(hackathon);
            };
        };
        
        Buffer.toArray(filtered)
    };

    public func getFeaturedHackathons(): async [Hackathon] {
        let filtered = Buffer.Buffer<Hackathon>(0);
        
        for ((_, hackathon) in hackathons.entries()) {
            if (hackathon.featured) {
                filtered.add(hackathon);
            };
        };
        
        Buffer.toArray(filtered)
    };

    public func getHackathonsByOrganizer(organizerEmail: Text): async [Hackathon] {
        let filtered = Buffer.Buffer<Hackathon>(0);
        
        for ((_, hackathon) in hackathons.entries()) {
            if (hackathon.organizerId == organizerEmail) {
                filtered.add(hackathon);
            };
        };
        
        Buffer.toArray(filtered)
    };

    public func getUserHackathons(userEmail: Text): async [Hackathon] {
        let userHackathons = Buffer.Buffer<Hackathon>(0);
        
        for ((_, hackathon) in hackathons.entries()) {
            var found = false;
            for (participant in hackathon.participants.vals()) {
                if (participant.userEmail == userEmail and not found) {
                    userHackathons.add(hackathon);
                    found := true;
                };
            };
        };
        
        Buffer.toArray(userHackathons)
    };

    public func searchHackathons(filters: HackathonSearchFilters): async [Hackathon] {
        let filtered = Buffer.Buffer<Hackathon>(0);
        
        for ((_, hackathon) in hackathons.entries()) {
            var matches = true;
            
            // Status filter
            switch (filters.status) {
                case null {};
                case (?status) {
                    if (hackathon.status != status) {
                        matches := false;
                    };
                };
            };
            
            // Category filter
            switch (filters.category) {
                case null {};
                case (?category) {
                    if (hackathon.category != category) {
                        matches := false;
                    };
                };
            };
            
            // Mode filter
            switch (filters.mode) {
                case null {};
                case (?mode) {
                    if (hackathon.mode != mode) {
                        matches := false;
                    };
                };
            };
            
            // Featured filter
            switch (filters.featured) {
                case null {};
                case (?featured) {
                    if (hackathon.featured != featured) {
                        matches := false;
                    };
                };
            };
            
            // Organizer filter
            switch (filters.organizer) {
                case null {};
                case (?organizer) {
                    if (hackathon.organizerId != organizer) {
                        matches := false;
                    };
                };
            };
            
            if (matches) {
                filtered.add(hackathon);
            };
        };
        
        Buffer.toArray(filtered)
    };

    // ===== STATISTICS =====
    
    public func getHackathonStats(): async HackathonStats {
        let totalHackathons = hackathons.size();
        var activeHackathons = 0;
        var completedHackathons = 0;
        var totalParticipants = 0;
        var totalWinners = 0;
        var totalPrizePool: Float = 0.0;

        for ((_, hackathon) in hackathons.entries()) {
            switch (hackathon.status) {
                case (#RegistrationOpen or #Upcoming or #Ongoing) {
                    activeHackathons += 1;
                };
                case (#Completed) {
                    completedHackathons += 1;
                };
                case (#Cancelled) {};
            };

            totalParticipants += hackathon.participants.size();
            totalWinners += hackathon.winnerIds.size();

            // Parse prize pool (simplified - assumes format like "$1000" or "1000 ICP")
            // This is a basic implementation - in production you'd want more robust parsing
            if (Text.contains(hackathon.prizePool, #text "$")) {
                // Extract numeric value from prize pool string
                // This is simplified - you'd want proper parsing
                totalPrizePool += 1000.0; // Placeholder
            };
        };

        {
            totalHackathons = totalHackathons;
            activeHackathons = activeHackathons;
            completedHackathons = completedHackathons;
            totalPrizePool = "$" # Float.format(#fix 0, totalPrizePool);
            totalParticipants = totalParticipants;
            totalWinners = totalWinners;
        }
    };

    // ===== ADMIN FUNCTIONS =====
    
    public func updateParticipantStatus(hackathonId: Text, userEmail: Text, status: ParticipantStatus, organizerEmail: Text): async Result.Result<(), Text> {
        switch (hackathons.get(hackathonId)) {
            case null { #err("Hackathon not found") };
            case (?hackathon) {
                if (hackathon.organizerId != organizerEmail) {
                    return #err("Unauthorized: Only the organizer can update participant status");
                };

                let updatedParticipants = Buffer.Buffer<Participant>(0);
                var found = false;

                for (participant in hackathon.participants.vals()) {
                    if (participant.userEmail == userEmail) {
                        let updatedParticipant = {
                            participant with
                            status = status;
                        };
                        updatedParticipants.add(updatedParticipant);
                        found := true;
                    } else {
                        updatedParticipants.add(participant);
                    };
                };

                if (not found) {
                    return #err("Participant not found");
                };

                let updatedHackathon = {
                    hackathon with
                    participants = Buffer.toArray(updatedParticipants);
                    updatedAt = Time.now();
                };

                hackathons.put(hackathonId, updatedHackathon);
                #ok(())
            };
        }
    };

    public func setWinners(hackathonId: Text, winnerIds: [Text], organizerEmail: Text): async Result.Result<(), Text> {
        switch (hackathons.get(hackathonId)) {
            case null { #err("Hackathon not found") };
            case (?hackathon) {
                if (hackathon.organizerId != organizerEmail) {
                    return #err("Unauthorized: Only the organizer can set winners");
                };

                let updatedHackathon = {
                    hackathon with
                    winnerIds = winnerIds;
                    status = #Completed;
                    updatedAt = Time.now();
                };

                hackathons.put(hackathonId, updatedHackathon);
                #ok(())
            };
        }
    };
}