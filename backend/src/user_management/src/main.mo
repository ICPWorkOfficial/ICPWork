import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Utils "../../utils";

persistent actor UserManagement {
    
    // Define the User type with all information
    public type User = {
        // Authentication fields
        email: Text;
        passwordHash: Blob;
        userId: Text;
        
        // Profile fields
        firstName: ?Text;
        lastName: ?Text;
        phoneNumber: ?Text;
        userType: Text; // "client" or "freelancer"
        
        // Client specific fields
        companyName: ?Text;
        companyWebsite: ?Text;
        industry: ?Text;
        businessType: ?Text;
        numberOfEmployees: ?Nat;
        description: ?Text;
        
        // Freelancer specific fields
        skills: [Text];
        country: ?Text;
        state: ?Text;
        city: ?Text;
        zipCode: ?Text;
        streetAddress: ?Text;
        photo: ?Text;
        linkedinProfile: ?Text;
        
        // Metadata
        createdAt: Int;
        updatedAt: Int;
    };

    // Error types
    public type Error = {
        #NotFound;
        #AlreadyExists;
        #Unauthorized;
        #InvalidData;
        #InvalidEmail;
        #InvalidPassword;
        #InvalidUserType;
    };

    // Stable storage for upgrades
    private var usersEntries : [(Text, User)] = [];
    private transient var users = HashMap.HashMap<Text, User>(10, Text.equal, Text.hash);

    // System functions for upgrades
    system func preupgrade() {
        usersEntries := Iter.toArray(users.entries());
    };

    system func postupgrade() {
        users := HashMap.fromIter<Text, User>(
            usersEntries.vals(), 
            usersEntries.size(), 
            Text.equal, 
            Text.hash
        );
        usersEntries := [];
    };

    // Validate user data
    private func _validateUser(user: User) : Bool {
        Text.size(user.email) > 0 and
        Text.size(user.userId) > 0 and
        (user.userType == "client" or user.userType == "freelancer")
    };

    // Validate email format
    private func isValidEmail(email: Text) : Bool {
        Text.contains(email, #text("@")) and
        Text.contains(email, #text("."))
    };

    // Generate unique user ID
    private func generateUserId(email: Text) : Text {
        // Simple hash-based ID generation using email as base
        "user_" # email
    };

    // Register new user
    public func registerUser(email: Text, password: Text, userType: Text) : async Result.Result<User, Error> {
        // Validate inputs
        if (not isValidEmail(email)) {
            return #err(#InvalidEmail);
        };
        
        if (Text.size(password) < 6) {
            return #err(#InvalidPassword);
        };
        
        if (userType != "client" and userType != "freelancer") {
            return #err(#InvalidUserType);
        };

        // Check if user already exists
        switch (users.get(email)) {
            case (?_) { return #err(#AlreadyExists) };
            case null {
                let userId = generateUserId(email);
                let passwordHash = Utils.hashPassword(password);
                let now = 0; // You can use Time.now() if available
                
                let newUser: User = {
                    email = email;
                    passwordHash = passwordHash;
                    userId = userId;
                    firstName = null;
                    lastName = null;
                    phoneNumber = null;
                    userType = userType;
                    companyName = null;
                    companyWebsite = null;
                    industry = null;
                    businessType = null;
                    numberOfEmployees = null;
                    description = null;
                    skills = [];
                    country = null;
                    state = null;
                    city = null;
                    zipCode = null;
                    streetAddress = null;
                    photo = null;
                    linkedinProfile = null;
                    createdAt = now;
                    updatedAt = now;
                };
                
                users.put(email, newUser);
                #ok(newUser)
            };
        }
    };

    // Login user
    public func loginUser(email: Text, password: Text) : async Result.Result<User, Error> {
        switch (users.get(email)) {
            case null { #err(#NotFound) };
            case (?user) {
                let passwordHash = Utils.hashPassword(password);
                if (passwordHash == user.passwordHash) {
                    #ok(user)
                } else {
                    #err(#Unauthorized)
                }
            };
        }
    };

    // Update user profile
    public shared(_msg) func updateUserProfile(email: Text, profileData: {
        firstName: ?Text;
        lastName: ?Text;
        phoneNumber: ?Text;
        companyName: ?Text;
        companyWebsite: ?Text;
        industry: ?Text;
        businessType: ?Text;
        numberOfEmployees: ?Nat;
        description: ?Text;
        skills: [Text];
        country: ?Text;
        state: ?Text;
        city: ?Text;
        zipCode: ?Text;
        streetAddress: ?Text;
        photo: ?Text;
        linkedinProfile: ?Text;
    }) : async Result.Result<User, Error> {
        switch (users.get(email)) {
            case null { #err(#NotFound) };
            case (?existingUser) {
                let now = 0; // You can use Time.now() if available
                
                let updatedUser: User = {
                    email = existingUser.email;
                    passwordHash = existingUser.passwordHash;
                    userId = existingUser.userId;
                    firstName = profileData.firstName;
                    lastName = profileData.lastName;
                    phoneNumber = profileData.phoneNumber;
                    userType = existingUser.userType;
                    companyName = profileData.companyName;
                    companyWebsite = profileData.companyWebsite;
                    industry = profileData.industry;
                    businessType = profileData.businessType;
                    numberOfEmployees = profileData.numberOfEmployees;
                    description = profileData.description;
                    skills = profileData.skills;
                    country = profileData.country;
                    state = profileData.state;
                    city = profileData.city;
                    zipCode = profileData.zipCode;
                    streetAddress = profileData.streetAddress;
                    photo = profileData.photo;
                    linkedinProfile = profileData.linkedinProfile;
                    createdAt = existingUser.createdAt;
                    updatedAt = now;
                };
                
                users.put(email, updatedUser);
                #ok(updatedUser)
            };
        }
    };

    // Get user by email
    public query func getUser(email: Text) : async Result.Result<User, Error> {
        switch (users.get(email)) {
            case null { #err(#NotFound) };
            case (?user) { #ok(user) };
        }
    };

    // Get user by ID
    public query func getUserById(userId: Text) : async Result.Result<User, Error> {
        for ((email, user) in users.entries()) {
            if (user.userId == userId) {
                return #ok(user);
            };
        };
        #err(#NotFound)
    };

    // Get all users
    public query func getAllUsers() : async [(Text, User)] {
        Iter.toArray(users.entries())
    };

    // Get users by type
    public query func getUsersByType(userType: Text) : async [User] {
        var filteredUsers: [User] = [];
        for ((email, user) in users.entries()) {
            if (user.userType == userType) {
                filteredUsers := Array.append(filteredUsers, [user]);
            };
        };
        filteredUsers
    };

    // Delete user
    public shared(_msg) func deleteUser(email: Text) : async Result.Result<(), Error> {
        switch (users.remove(email)) {
            case null { #err(#NotFound) };
            case (?_removed) { #ok(()) };
        }
    };

    // Change password
    public shared(_msg) func changePassword(email: Text, oldPassword: Text, newPassword: Text) : async Result.Result<(), Error> {
        switch (users.get(email)) {
            case null { #err(#NotFound) };
            case (?user) {
                let oldPasswordHash = Utils.hashPassword(oldPassword);
                if (oldPasswordHash != user.passwordHash) {
                    return #err(#Unauthorized);
                };
                
                if (Text.size(newPassword) < 6) {
                    return #err(#InvalidPassword);
                };
                
                let newPasswordHash = Utils.hashPassword(newPassword);
                let updatedUser: User = {
                    email = user.email;
                    passwordHash = newPasswordHash;
                    userId = user.userId;
                    firstName = user.firstName;
                    lastName = user.lastName;
                    phoneNumber = user.phoneNumber;
                    userType = user.userType;
                    companyName = user.companyName;
                    companyWebsite = user.companyWebsite;
                    industry = user.industry;
                    businessType = user.businessType;
                    numberOfEmployees = user.numberOfEmployees;
                    description = user.description;
                    skills = user.skills;
                    country = user.country;
                    state = user.state;
                    city = user.city;
                    zipCode = user.zipCode;
                    streetAddress = user.streetAddress;
                    photo = user.photo;
                    linkedinProfile = user.linkedinProfile;
                    createdAt = user.createdAt;
                    updatedAt = 0; // Update timestamp
                };
                
                users.put(email, updatedUser);
                #ok(())
            };
        }
    };
}
