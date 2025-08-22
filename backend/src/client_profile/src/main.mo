import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Iter "mo:base/Iter";

persistent actor ClientCanister {
  
  // Types
  public type Address = {
    country: Text;
    state: Text;
    city: Text;
    localAddress: Text;
  };
  
  public type ClientProfile = {
    userId: Text;
    organizationName: Text;
    website: Text;
    firstName: Text;
    lastName: Text;
    address: Address;
    phoneNumber: Text;
    description: Text;
  };

  public type ProfileResult = Result.Result<ClientProfile, Text>;
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
  private var profileEntries : [(Text, ClientProfile)] = [];
  private transient var profiles = Map.HashMap<Text, ClientProfile>(10, Text.equal, Text.hash);
  
  // Auth canister reference - replace with your actual canister ID
  private transient let authCanister : AuthCanister = actor("uxrrr-q7777-77774-qaaaq-cai"); 

  // Initialize from stable storage
  system func preupgrade() {
    profileEntries := Iter.toArray(profiles.entries());
  };

  system func postupgrade() {
    profiles := Map.fromIter<Text, ClientProfile>(profileEntries.vals(), profileEntries.size(), Text.equal, Text.hash);
    profileEntries := [];
  };

  // Helper function for text matching
  private func textContains(text: Text, substring: Text) : Bool {
    Text.contains(text, #text substring);
  };

  // Helper function to verify user is client
  private func verifyClient(userId: Text) : async Result.Result<AuthUser, Text> {
    try {
      switch (await authCanister.getUser(userId)) {
        case null { #err("User not found") };
        case (?user) {
          if (not user.isVerified) {
            #err("User not verified");
          } else {
            switch (user.userType) {
              case (#CLIENT) { #ok(user) };
              case (#FREELANCER) { #err("User is not a client") };
            };
          };
        };
      };
    } catch (_) {
      #err("Error connecting to auth canister");
    };
  };

  // Validate input fields
  private func validateProfile(
    organizationName: Text,
    firstName: Text,
    lastName: Text,
    phoneNumber: Text,
    description: Text
  ) : Bool {
    organizationName.size() > 0 and
    firstName.size() > 0 and
    lastName.size() > 0 and
    phoneNumber.size() > 0 and
    description.size() > 0;
  };

  // Public functions
  public func createProfile(
    userId: Text,
    organizationName: Text,
    website: Text,
    firstName: Text,
    lastName: Text,
    address: Address,
    phoneNumber: Text,
    description: Text
  ) : async ProfileResult {
    
    // Verify user is a verified client
    switch (await verifyClient(userId)) {
      case (#err(msg)) { #err(msg) };
      case (#ok(_)) {
        // Check if profile already exists
        switch (profiles.get(userId)) {
          case (?_) { #err("Profile already exists") };
          case null {
            // Validate required fields
            if (not validateProfile(organizationName, firstName, lastName, phoneNumber, description)) {
              #err("All fields except website are required and must be non-empty");
            } else {
              let newProfile : ClientProfile = {
                userId = userId;
                organizationName = organizationName;
                website = website;
                firstName = firstName;
                lastName = lastName;
                address = address;
                phoneNumber = phoneNumber;
                description = description;
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
    organizationName: Text,
    website: Text,
    firstName: Text,
    lastName: Text,
    address: Address,
    phoneNumber: Text,
    description: Text
  ) : async ProfileResult {
    
    // Verify user is a verified client
    switch (await verifyClient(userId)) {
      case (#err(msg)) { #err(msg) };
      case (#ok(_)) {
        switch (profiles.get(userId)) {
          case null { #err("Profile not found") };
          case (?_) {
            // Validate required fields
            if (not validateProfile(organizationName, firstName, lastName, phoneNumber, description)) {
              #err("All fields except website are required and must be non-empty");
            } else {
              let updatedProfile : ClientProfile = {
                userId = userId;
                organizationName = organizationName;
                website = website;
                firstName = firstName;
                lastName = lastName;
                address = address;
                phoneNumber = phoneNumber;
                description = description;
              };
              
              profiles.put(userId, updatedProfile);
              #ok(updatedProfile);
            };
          };
        };
      };
    };
  };

  public func getProfile(userId: Text) : async ?ClientProfile {
    profiles.get(userId);
  };

  public func deleteProfile(userId: Text) : async GenericResult {
    // Verify user is a verified client
    switch (await verifyClient(userId)) {
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
  public func searchByOrganization(orgName: Text) : async [ClientProfile] {
    Array.filter<ClientProfile>(
      Iter.toArray(profiles.vals()),
      func(profile) { 
        textContains(Text.toLowercase(profile.organizationName), Text.toLowercase(orgName))
      }
    );
  };

  public func searchByLocation(country: Text, state: ?Text) : async [ClientProfile] {
    Array.filter<ClientProfile>(
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

  public func searchByDescription(keyword: Text) : async [ClientProfile] {
    Array.filter<ClientProfile>(
      Iter.toArray(profiles.vals()),
      func(profile) { 
        textContains(Text.toLowercase(profile.description), Text.toLowercase(keyword))
      }
    );
  };

  public func getAllProfiles() : async [ClientProfile] {
    Iter.toArray(profiles.vals());
  };
}