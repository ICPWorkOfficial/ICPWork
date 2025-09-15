import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Result "mo:base/Result";
import Utils "./utils";

module {
  public type UserType = {
    #freelancer;
    #client;
  };

  public type User = {
    email : Text;
    passwordHash : Blob;
    userType : UserType;
  };

  public type AuthError = {
    #UserAlreadyExists;
    #UserNotFound;
    #InvalidCredentials;
    #InvalidEmail;
    #WeakPassword;
  };

  public class Auth() {
    var usersArray : [User] = [];
    var users : Buffer.Buffer<User> = Buffer.fromArray(usersArray);

    public func preupgrade() {
      usersArray := Buffer.toArray(users);
    };

    public func postupgrade() {
      users := Buffer.fromArray(usersArray);
    };

    func findUserIndex(email : Text) : ?Nat {
      var i : Nat = 0;
      let len = users.size();
      while (i < len) {
        let u = users.get(i);
        if (u.email == email) return ?i;
        i += 1;
      };
      null
    };

    func validateEmail(email : Text) : Bool {
      // Basic email validation - contains @ and .
      Text.contains(email, #char '@') and Text.contains(email, #char '.')
    };

    func validatePassword(password : Text) : Bool {
      // Password validation matching frontend requirements
      let len = Text.size(password);
      if (len < 8) return false;
      
      var hasUpper = false;
      var hasLower = false;
      var hasDigit = false;
      var hasSpecial = false;
      
      for (char in password.chars()) {
        switch (char) {
          case ('A') { hasUpper := true; };
          case ('B') { hasUpper := true; };
          case ('C') { hasUpper := true; };
          case ('D') { hasUpper := true; };
          case ('E') { hasUpper := true; };
          case ('F') { hasUpper := true; };
          case ('G') { hasUpper := true; };
          case ('H') { hasUpper := true; };
          case ('I') { hasUpper := true; };
          case ('J') { hasUpper := true; };
          case ('K') { hasUpper := true; };
          case ('L') { hasUpper := true; };
          case ('M') { hasUpper := true; };
          case ('N') { hasUpper := true; };
          case ('O') { hasUpper := true; };
          case ('P') { hasUpper := true; };
          case ('Q') { hasUpper := true; };
          case ('R') { hasUpper := true; };
          case ('S') { hasUpper := true; };
          case ('T') { hasUpper := true; };
          case ('U') { hasUpper := true; };
          case ('V') { hasUpper := true; };
          case ('W') { hasUpper := true; };
          case ('X') { hasUpper := true; };
          case ('Y') { hasUpper := true; };
          case ('Z') { hasUpper := true; };
          case ('a') { hasLower := true; };
          case ('b') { hasLower := true; };
          case ('c') { hasLower := true; };
          case ('d') { hasLower := true; };
          case ('e') { hasLower := true; };
          case ('f') { hasLower := true; };
          case ('g') { hasLower := true; };
          case ('h') { hasLower := true; };
          case ('i') { hasLower := true; };
          case ('j') { hasLower := true; };
          case ('k') { hasLower := true; };
          case ('l') { hasLower := true; };
          case ('m') { hasLower := true; };
          case ('n') { hasLower := true; };
          case ('o') { hasLower := true; };
          case ('p') { hasLower := true; };
          case ('q') { hasLower := true; };
          case ('r') { hasLower := true; };
          case ('s') { hasLower := true; };
          case ('t') { hasLower := true; };
          case ('u') { hasLower := true; };
          case ('v') { hasLower := true; };
          case ('w') { hasLower := true; };
          case ('x') { hasLower := true; };
          case ('y') { hasLower := true; };
          case ('z') { hasLower := true; };
          case ('0') { hasDigit := true; };
          case ('1') { hasDigit := true; };
          case ('2') { hasDigit := true; };
          case ('3') { hasDigit := true; };
          case ('4') { hasDigit := true; };
          case ('5') { hasDigit := true; };
          case ('6') { hasDigit := true; };
          case ('7') { hasDigit := true; };
          case ('8') { hasDigit := true; };
          case ('9') { hasDigit := true; };
          case ('!') { hasSpecial := true; };
          case ('@') { hasSpecial := true; };
          case ('#') { hasSpecial := true; };
          case ('$') { hasSpecial := true; };
          case ('%') { hasSpecial := true; };
          case ('^') { hasSpecial := true; };
          case ('&') { hasSpecial := true; };
          case ('*') { hasSpecial := true; };
          case ('(') { hasSpecial := true; };
          case (')') { hasSpecial := true; };
          case (',') { hasSpecial := true; };
          case ('.') { hasSpecial := true; };
          case ('?') { hasSpecial := true; };
          case (':') { hasSpecial := true; };
          case ('{') { hasSpecial := true; };
          case ('}') { hasSpecial := true; };
          case ('|') { hasSpecial := true; };
          case ('<') { hasSpecial := true; };
          case ('>') { hasSpecial := true; };
          case _ {};
        };
      };
      
      hasUpper and hasLower and hasDigit and hasSpecial
    };

    public func signup(email : Text, password : Text, userType : UserType) : Result.Result<User, AuthError> {
      // Validate email format
      if (not validateEmail(email)) {
        return #err(#InvalidEmail);
      };

      // Validate password strength
      if (not validatePassword(password)) {
        return #err(#WeakPassword);
      };

      // Check if user already exists
      switch (findUserIndex(email)) {
        case (?_i) { return #err(#UserAlreadyExists); };
        case null {
          let hashed = Utils.hashPassword(password);
          let newUser : User = { 
            email = email; 
            passwordHash = hashed; 
            userType = userType;
          };
          users.add(newUser);
          #ok(newUser)
        };
      };
    };

    public func login(email : Text, password : Text) : Result.Result<User, AuthError> {
      switch (findUserIndex(email)) {
        case (?i) {
          let u = users.get(i);
          if (Utils.hashPassword(password) == u.passwordHash) {
            #ok(u)
          } else {
            #err(#InvalidCredentials)
          }
        };
        case null { #err(#UserNotFound) };
      }
    };

    // Legacy auth function for backward compatibility
    public func auth(email : Text, password : Text) : User {
      let hashed = Utils.hashPassword(password);
      let newUser : User = { 
        email = email; 
        passwordHash = hashed; 
        userType = #freelancer; // Default to freelancer for legacy compatibility
      };

      switch (findUserIndex(email)) {
        case (?i) { users.put(i, newUser); };
        case null { users.add(newUser); };
      };

      newUser
    };

    public func getUserByEmail(email : Text) : ?User {
      switch (findUserIndex(email)) {
        case (?i) { ?users.get(i) };
        case null { null };
      }
    };

    public func listUsers() : [User] {
      Buffer.toArray(users)
    };
  };
}
