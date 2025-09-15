import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Option "mo:base/Option";
import Nat "mo:base/Nat";

persistent actor BountiesStorage {
    
    // Define the bounty data types based on frontend structure
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

    // Stable storage for bounties
    private stable var bountyEntries : [(Text, Bounty)] = [];
    private var bounties = HashMap.HashMap<Text, Bounty>(0, Text.equal, Text.hash);

    // Stable storage for bounty counter
    private stable var bountyCounter : Nat = 0;

    // System functions for upgrades
    system func preupgrade() {
        bountyEntries := Iter.toArray(bounties.entries());
    };

    system func postupgrade() {
        bounties := HashMap.fromIter<Text, Bounty>(bountyEntries.vals(), bountyEntries.size(), Text.equal, Text.hash);
        bountyEntries := [];
    };

    // Helper function to generate bounty ID
    private func generateBountyId() : Text {
        bountyCounter += 1;
        "bounty_" # Nat.toText(bountyCounter)
    };

    // Helper function to validate bounty input
    private func validateBountyInput(input: BountyInput) : Result.Result<(), Text> {
        if (Text.size(input.title) == 0) {
            return #err("Title cannot be empty");
        };
        if (Text.size(input.description) == 0) {
            return #err("Description cannot be empty");
        };
        if (Text.size(input.organizer) == 0) {
            return #err("Organizer cannot be empty");
        };
        if (Text.size(input.prizePool) == 0) {
            return #err("Prize pool cannot be empty");
        };
        #ok(())
    };

    // Create a new bounty
    public func createBounty(organizerId: Text, input: BountyInput) : async Result.Result<Bounty, Text> {
        switch (validateBountyInput(input)) {
            case (#err(msg)) { #err(msg) };
            case (#ok()) {
                let bountyId = generateBountyId();
                let now = Time.now();
                
                let bounty: Bounty = {
                    id = bountyId;
                    title = input.title;
                    description = input.description;
                    organizer = input.organizer;
                    organizerId = organizerId;
                    mode = input.mode;
                    prizePool = input.prizePool;
                    timeline = input.timeline;
                    registrationDeadline = input.registrationDeadline;
                    submissionDeadline = input.submissionDeadline;
                    tags = input.tags;
                    category = input.category;
                    status = #Open;
                    featured = input.featured;
                    requirements = input.requirements;
                    deliverables = input.deliverables;
                    judgesCriteria = input.judgesCriteria;
                    maxParticipants = input.maxParticipants;
                    createdAt = now;
                    updatedAt = now;
                    participants = [];
                    winnerIds = [];
                };
                
                bounties.put(bountyId, bounty);
                #ok(bounty)
            };
        }
    };

    // Update an existing bounty
    public func updateBounty(bountyId: Text, organizerId: Text, update: BountyUpdate) : async Result.Result<Bounty, Text> {
        switch (bounties.get(bountyId)) {
            case null { #err("Bounty not found") };
            case (?bounty) {
                if (bounty.organizerId != organizerId) {
                    return #err("Unauthorized: Only the organizer can update this bounty");
                };
                
                let updatedBounty: Bounty = {
                    id = bounty.id;
                    title = Option.get(update.title, bounty.title);
                    description = Option.get(update.description, bounty.description);
                    organizer = bounty.organizer;
                    organizerId = bounty.organizerId;
                    mode = bounty.mode;
                    prizePool = Option.get(update.prizePool, bounty.prizePool);
                    timeline = Option.get(update.timeline, bounty.timeline);
                    registrationDeadline = switch(update.registrationDeadline) {
                        case (?deadline) { ?deadline };
                        case null { bounty.registrationDeadline };
                    };
                    submissionDeadline = switch(update.submissionDeadline) {
                        case (?deadline) { ?deadline };
                        case null { bounty.submissionDeadline };
                    };
                    tags = Option.get(update.tags, bounty.tags);
                    category = bounty.category;
                    status = Option.get(update.status, bounty.status);
                    featured = Option.get(update.featured, bounty.featured);
                    requirements = Option.get(update.requirements, bounty.requirements);
                    deliverables = Option.get(update.deliverables, bounty.deliverables);
                    judgesCriteria = Option.get(update.judgesCriteria, bounty.judgesCriteria);
                    maxParticipants = switch(update.maxParticipants) {
                        case (?max) { ?max };
                        case null { bounty.maxParticipants };
                    };
                    createdAt = bounty.createdAt;
                    updatedAt = Time.now();
                    participants = bounty.participants;
                    winnerIds = bounty.winnerIds;
                };
                
                bounties.put(bountyId, updatedBounty);
                #ok(updatedBounty)
            };
        }
    };

    // Register for a bounty
    public func registerForBounty(bountyId: Text, userId: Text) : async Result.Result<(), Text> {
        switch (bounties.get(bountyId)) {
            case null { #err("Bounty not found") };
            case (?bounty) {
                if (bounty.status != #Open) {
                    return #err("Bounty is not open for registration");
                };
                
                // Check if user is already registered
                let isAlreadyRegistered = Array.find<Participant>(bounty.participants, func(p) = p.userId == userId);
                switch (isAlreadyRegistered) {
                    case (?_) { #err("User already registered for this bounty") };
                    case null {
                        // Check max participants limit
                        switch (bounty.maxParticipants) {
                            case (?max) {
                                if (bounty.participants.size() >= max) {
                                    return #err("Maximum participants limit reached");
                                };
                            };
                            case null { /* No limit */ };
                        };
                        
                        let participant: Participant = {
                            userId = userId;
                            registeredAt = Time.now();
                            status = #Registered;
                            submissionUrl = null;
                            submissionDescription = null;
                            submittedAt = null;
                        };
                        
                        let updatedParticipants = Array.append<Participant>(bounty.participants, [participant]);
                        let updatedBounty: Bounty = {
                            bounty with 
                            participants = updatedParticipants;
                            updatedAt = Time.now();
                        };
                        
                        bounties.put(bountyId, updatedBounty);
                        #ok(())
                    };
                }
            };
        }
    };

    // Submit to a bounty
    public func submitToBounty(bountyId: Text, userId: Text, submissionUrl: Text, description: Text) : async Result.Result<(), Text> {
        switch (bounties.get(bountyId)) {
            case null { #err("Bounty not found") };
            case (?bounty) {
                // Find the participant
                let participantIndex = Array.indexOf<Participant>(
                    { userId = userId; registeredAt = 0; status = #Registered; submissionUrl = null; submissionDescription = null; submittedAt = null; },
                    bounty.participants,
                    func(a, b) = a.userId == b.userId
                );
                
                switch (participantIndex) {
                    case null { #err("User not registered for this bounty") };
                    case (?index) {
                        let participant = bounty.participants[index];
                        let updatedParticipant: Participant = {
                            participant with
                            status = #Submitted;
                            submissionUrl = ?submissionUrl;
                            submissionDescription = ?description;
                            submittedAt = ?Time.now();
                        };
                        
                        let updatedParticipants = Array.tabulate<Participant>(bounty.participants.size(), func(i) {
                            if (i == index) { updatedParticipant } else { bounty.participants[i] }
                        });
                        
                        let updatedBounty: Bounty = {
                            bounty with 
                            participants = updatedParticipants;
                            updatedAt = Time.now();
                        };
                        
                        bounties.put(bountyId, updatedBounty);
                        #ok(())
                    };
                }
            };
        }
    };

    // Get bounty by ID
    public query func getBounty(bountyId: Text) : async ?Bounty {
        bounties.get(bountyId)
    };

    // Get all bounties
    public query func getAllBounties() : async [Bounty] {
        Iter.toArray(bounties.vals())
    };

    // Get bounties by status
    public query func getBountiesByStatus(status: BountyStatus) : async [Bounty] {
        let filtered = Iter.filter<Bounty>(bounties.vals(), func(bounty) = bounty.status == status);
        Iter.toArray(filtered)
    };

    // Get bounties by category
    public query func getBountiesByCategory(category: BountyCategory) : async [Bounty] {
        let filtered = Iter.filter<Bounty>(bounties.vals(), func(bounty) = bounty.category == category);
        Iter.toArray(filtered)
    };

    // Get featured bounties
    public query func getFeaturedBounties() : async [Bounty] {
        let filtered = Iter.filter<Bounty>(bounties.vals(), func(bounty) = bounty.featured);
        Iter.toArray(filtered)
    };

    // Get bounties by organizer
    public query func getBountiesByOrganizer(organizerId: Text) : async [Bounty] {
        let filtered = Iter.filter<Bounty>(bounties.vals(), func(bounty) = bounty.organizerId == organizerId);
        Iter.toArray(filtered)
    };

    // Get user's registered bounties
    public query func getUserBounties(userId: Text) : async [Bounty] {
        let filtered = Iter.filter<Bounty>(bounties.vals(), func(bounty) {
            Array.find<Participant>(bounty.participants, func(p) = p.userId == userId) != null
        });
        Iter.toArray(filtered)
    };

    // Get bounty statistics
    public query func getBountyStats() : async BountyStats {
        let allBounties = Iter.toArray(bounties.vals());
        let openBounties = Array.filter<Bounty>(allBounties, func(bounty) = bounty.status == #Open);
        let completedBounties = Array.filter<Bounty>(allBounties, func(bounty) = bounty.status == #Completed);
        
        let totalParticipants = Array.foldLeft<Bounty, Nat>(allBounties, 0, func(acc, bounty) {
            acc + bounty.participants.size()
        });
        
        {
            totalBounties = allBounties.size();
            openBounties = openBounties.size();
            completedBounties = completedBounties.size();
            totalPrizePool = "Calculate based on your needs"; // You might want to implement proper calculation
            totalParticipants = totalParticipants;
        }
    };

    // Delete bounty (admin function)
    public func deleteBounty(bountyId: Text, organizerId: Text) : async Result.Result<(), Text> {
        switch (bounties.get(bountyId)) {
            case null { #err("Bounty not found") };
            case (?bounty) {
                if (bounty.organizerId != organizerId) {
                    return #err("Unauthorized: Only the organizer can delete this bounty");
                };
                bounties.delete(bountyId);
                #ok(())
            };
        }
    };
}