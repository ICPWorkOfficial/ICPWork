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
          case ('A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z') {
            hasUpper := true;
          };
          case ('a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z') {
            hasLower := true;
          };
          case ('0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9') {
            hasDigit := true;
          };
          case ('!' | '@' | '#' | '$' | '%' | '^' | '&' | '*' | '(' | ')' | ',' | '.' | '?' | '"' | ':' | '{' | '}' | '|' | '<' | '>') {
            hasSpecial := true;
          };
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
