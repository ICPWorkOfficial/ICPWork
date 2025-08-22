import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Int "mo:base/Int";

persistent actor AuthCanister {
  
  // Types
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
  
  public type AuthRequest = {
    email: Text;
    password: Text;
  };
  
  public type OTPRequest = {
    userId: Text;
    otp: Text;
  };
  
  public type PasswordChangeRequest = {
    userId: Text;
    otp: Text;
    newPassword: Text;
  };

  public type AuthResult = Result.Result<AuthUser, Text>;
  public type GenericResult = Result.Result<Text, Text>;

  // Storage
  private var userEntries : [(Text, AuthUser)] = [];
  private transient var users = Map.HashMap<Text, AuthUser>(10, Text.equal, Text.hash);
  transient var emailToUserId = Map.HashMap<Text, Text>(10, Text.equal, Text.hash);

  // Initialize from stable storage
  system func preupgrade() {
    userEntries := Iter.toArray(users.entries());
  };

  system func postupgrade() {
    users := Map.fromIter<Text, AuthUser>(userEntries.vals(), userEntries.size(), Text.equal, Text.hash);
    userEntries := [];
    
    // Rebuild email index
    for ((userId, user) in users.entries()) {
      emailToUserId.put(user.email, userId);
    };
  };

  // Helper functions
  private func generateUserId() : Text {
    let seed = Time.now();
    Text.concat("user_", Int.toText(seed));
  };

 private func generateOTP() : Text {
    let seed = Time.now();
    let otp = Int.abs(seed) % 1000000;
    let otpStr = Int.toText(otp);
    // Pad with zeros to make it 6 digits
    if (otpStr.size() == 1) { Text.concat("00000", otpStr) }
    else if (otpStr.size() == 2) { Text.concat("0000", otpStr) }
    else if (otpStr.size() == 3) { Text.concat("000", otpStr) }
    else if (otpStr.size() == 4) { Text.concat("00", otpStr) }
    else if (otpStr.size() == 5) { Text.concat("0", otpStr) }
    else { otpStr };
  };

  private func hashPassword(password: Text) : Text {
    // Simple hash - in production use proper hashing
    Text.concat("hash_", password);
  };

  private func isOTPValid(user: AuthUser) : Bool {
    switch (user.otpExpiry) {
      case (?expiry) { Time.now() <= expiry };
      case null { false };
    };
  };

  // Public functions
  public func register(email: Text, username: Text, password: Text, userType: UserType) : async AuthResult {
    // Check if email already exists
    switch (emailToUserId.get(email)) {
      case (?_) { #err("Email already registered") };
      case null {
        let userId = generateUserId();
        let passwordHash = hashPassword(password);
        let otp = generateOTP();
        let otpExpiry = Time.now() + (5 * 60 * 1_000_000_000); // 5 minutes in nanoseconds
        
        let newUser : AuthUser = {
          id = userId;
          email = email;
          username = username;
          passwordHash = passwordHash;
          userType = userType;
          isVerified = false;
          otp = ?otp;
          otpExpiry = ?otpExpiry;
        };
        
        users.put(userId, newUser);
        emailToUserId.put(email, userId);
        #ok(newUser);
      };
    };
  };

  public func login(request: AuthRequest) : async AuthResult {
    switch (emailToUserId.get(request.email)) {
      case null { #err("User not found") };
      case (?userId) {
        switch (users.get(userId)) {
          case null { #err("User not found") };
          case (?user) {
            let passwordHash = hashPassword(request.password);
            if (user.passwordHash == passwordHash) {
              if (user.isVerified) {
                #ok(user);
              } else {
                #err("User not verified. Please verify with OTP first.");
              };
            } else {
              #err("Invalid password");
            };
          };
        };
      };
    };
  };

  public func verifyOTP(request: OTPRequest) : async GenericResult {
    switch (users.get(request.userId)) {
      case null { #err("User not found") };
      case (?user) {
        switch (user.otp) {
          case null { #err("No OTP found") };
          case (?storedOTP) {
            if (not isOTPValid(user)) {
              #err("OTP expired");
            } else if (storedOTP == request.otp) {
              let updatedUser = {
                user with 
                isVerified = true;
                otp = null;
                otpExpiry = null;
              };
              users.put(request.userId, updatedUser);
              #ok("User verified successfully");
            } else {
              #err("Invalid OTP");
            };
          };
        };
      };
    };
  };

  public func resendOTP(userId: Text) : async GenericResult {
    switch (users.get(userId)) {
      case null { #err("User not found") };
      case (?user) {
        let newOTP = generateOTP();
        let otpExpiry = Time.now() + (5 * 60 * 1_000_000_000); // 5 minutes
        
        let updatedUser = {
          user with 
          otp = ?newOTP;
          otpExpiry = ?otpExpiry;
        };
        
        users.put(userId, updatedUser);
        #ok("New OTP sent");
      };
    };
  };

  public func changePassword(request: PasswordChangeRequest) : async GenericResult {
    switch (users.get(request.userId)) {
      case null { #err("User not found") };
      case (?user) {
        switch (user.otp) {
          case null { #err("No OTP found") };
          case (?storedOTP) {
            if (not isOTPValid(user)) {
              #err("OTP expired");
            } else if (storedOTP == request.otp) {
              let newPasswordHash = hashPassword(request.newPassword);
              let updatedUser = {
                user with 
                passwordHash = newPasswordHash;
                otp = null;
                otpExpiry = null;
              };
              users.put(request.userId, updatedUser);
              #ok("Password changed successfully");
            } else {
              #err("Invalid OTP");
            };
          };
        };
      };
    };
  };

  public func getUser(userId: Text) : async ?AuthUser {
    users.get(userId);
  };

  public func getUserByEmail(email: Text) : async ?AuthUser {
    switch (emailToUserId.get(email)) {
      case null { null };
      case (?userId) { users.get(userId) };
    };
  };

  // Admin function to get all users (remove in production)
  public func getAllUsers() : async [AuthUser] {
    Iter.toArray(users.vals());
  };
}