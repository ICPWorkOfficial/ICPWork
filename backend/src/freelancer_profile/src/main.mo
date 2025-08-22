import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Iter "mo:base/Iter";

persistent actor FreelancerCanister {
  
  // Types
  public type Address = {
    country: Text;
    state: Text;
    city: Text;
    localAddress: Text;
  };
  
  public type FreelancerProfile = {
    userId: Text;
    firstName: Text;
    lastName: Text;
    profilePhotoUrl: Text;
    resumeUrl: Text;
    skills: [Text]; // Array of 5 skills
    address: Address;
  };

  public type ProfileResult = Result.Result<FreelancerProfile, Text>;
  public type GenericResult = Result.Result<Text, Text>;

  // Auth canister types (mirrored)
  public type UserType = {#FREELANCER; #CLIENT};
  public type AuthUser = {
    id: Text;
    email: Text;
    username: Text;
    passwordHash: Text;
    userType: UserType;
    isVerified: Bool;
    otp: ?Text;
    otpExpiry: ?Int;
  };

  // Auth canister interface
  public type AuthCanister = actor {
    getUser: (Text) -> async ?AuthUser;
  };

  // Storage
  private var profileEntries : [(Text, FreelancerProfile)] = [];
  private transient var profiles = Map.HashMap<Text, FreelancerProfile>(10, Text.equal, Text.hash);
  
  // Auth canister reference - replace with your actual canister ID
  private transient let authCanister : AuthCanister = actor("uxrrr-q7777-77774-qaaaq-cai"); // Replace with actual canister ID

  // Initialize from stable storage
  system func preupgrade() {
    profileEntries := Iter.toArray(profiles.entries());
  };

  system func postupgrade() {
    profiles := Map.fromIter<Text, FreelancerProfile>(profileEntries.vals(), profileEntries.size(), Text.equal, Text.hash);
    profileEntries := [];
  };

  // Helper function for text matching
  private func textContains(text: Text, substring: Text) : Bool {
    Text.contains(text, #text substring);
  };

  // Helper function to verify user is freelancer
  private func verifyFreelancer(userId: Text) : async Result.Result<AuthUser, Text> {
    try {
      switch (await authCanister.getUser(userId)) {
        case null { #err("User not found") };
        case (?user) {
          if (not user.isVerified) {
            #err("User not verified");
          } else {
            switch (user.userType) {
              case (#FREELANCER) { #ok(user) };
              case (#CLIENT) { #err("User is not a freelancer") };
            };
          };
        };
      };
    } catch (_) {
      #err("Error connecting to auth canister");
    };
  };

  // Validate skills array
  private func validateSkills(skills: [Text]) : Bool {
    skills.size() == 5 and Array.foldLeft<Text, Bool>(skills, true, func(acc, skill) { acc and skill.size() > 0 });
  };

  // Public functions
  public func createProfile(
    userId: Text,
    firstName: Text,
    lastName: Text,
    profilePhotoUrl: Text,
    resumeUrl: Text,
    skills: [Text],
    address: Address
  ) : async ProfileResult {
    
    // Verify user is a verified freelancer
    switch (await verifyFreelancer(userId)) {
      case (#err(msg)) { #err(msg) };
      case (#ok(_)) {
        // Check if profile already exists
        switch (profiles.get(userId)) {
          case (?_) { #err("Profile already exists") };
          case null {
            // Validate skills
            if (not validateSkills(skills)) {
              #err("Must provide exactly 5 non-empty skills");
            } else {
              let newProfile : FreelancerProfile = {
                userId = userId;
                firstName = firstName;
                lastName = lastName;
                profilePhotoUrl = profilePhotoUrl;
                resumeUrl = resumeUrl;
                skills = skills;
                address = address;
              };
              
              profiles.put(userId, newProfile);
              #ok(newProfile);
            };
          };
        };
      };
    };
  };

  public func updateProfile(
    userId: Text,
    firstName: Text,
    lastName: Text,
    profilePhotoUrl: Text,
    resumeUrl: Text,
    skills: [Text],
    address: Address
  ) : async ProfileResult {
    
    // Verify user is a verified freelancer
    switch (await verifyFreelancer(userId)) {
      case (#err(msg)) { #err(msg) };
      case (#ok(_)) {
        switch (profiles.get(userId)) {
          case null { #err("Profile not found") };
          case (?_) {
            // Validate skills
            if (not validateSkills(skills)) {
              #err("Must provide exactly 5 non-empty skills");
            } else {
              let updatedProfile : FreelancerProfile = {
                userId = userId;
                firstName = firstName;
                lastName = lastName;
                profilePhotoUrl = profilePhotoUrl;
                resumeUrl = resumeUrl;
                skills = skills;
                address = address;
              };
              
              profiles.put(userId, updatedProfile);
              #ok(updatedProfile);
            };
          };
        };
      };
    };
  };

  public func getProfile(userId: Text) : async ?FreelancerProfile {
    profiles.get(userId);
  };

  public func deleteProfile(userId: Text) : async GenericResult {
    // Verify user is a verified freelancer
    switch (await verifyFreelancer(userId)) {
      case (#err(msg)) { #err(msg) };
      case (#ok(_)) {
        switch (profiles.get(userId)) {
          case null { #err("Profile not found") };
          case (?_) {
            profiles.delete(userId);
            #ok("Profile deleted successfully");
          };
        };
      };
    };
  };

  // Search functions
  public func searchBySkill(skill: Text) : async [FreelancerProfile] {
    Array.filter<FreelancerProfile>(
      Iter.toArray(profiles.vals()),
      func(profile) { 
        Array.find<Text>(profile.skills, func(s) { 
          textContains(Text.toLowercase(s), Text.toLowercase(skill))
        }) != null
      }
    );
  };

  public func searchByLocation(country: Text, state: ?Text) : async [FreelancerProfile] {
    Array.filter<FreelancerProfile>(
      Iter.toArray(profiles.vals()),
      func(profile) { 
        let countryMatch = textContains(Text.toLowercase(profile.address.country), Text.toLowercase(country));
        switch (state) {
          case null { countryMatch };
          case (?s) { 
            countryMatch and textContains(Text.toLowercase(profile.address.state), Text.toLowercase(s))
          };
        };
      }
    );
  };

  public func getAllProfiles() : async [FreelancerProfile] {
    Iter.toArray(profiles.vals());
  };
}