import Auth "auth";
import Utils "utils";
import Array "mo:base/Array";

actor {
  type User = Auth.User;

  // Persistent storage
  stable var clientData : [User] = [];
  stable var freelanceData : [User] = [];

  // Register a user (hashes password via utils.mo before storing)
  public func registerUser(userType : Text, email : Text, password : Text) : async Bool {
    let hashedPassword = Utils.hashPassword(password);
    let newUser : User = { email = email; passwordHash = hashedPassword };

    switch (userType) {
      case ("client") {
        clientData := Array.append(clientData, [newUser]);
        return true;
      };
      case ("freelancer") {
        freelanceData := Array.append(freelanceData, [newUser]);
        return true;
      };
      case (_) {
        return false;
      };
    };
  };

  // Authenticate user (hash password via utils.mo, then verify using auth.mo)
  public query func authenticateUser(userType : Text, email : Text, password : Text) : async Bool {
    let hashedPassword = Utils.hashPassword(password);

    switch (userType) {
      case ("client") {
        return Auth.verifyUser(clientData, email, hashedPassword);
      };
      case ("freelancer") {
        return Auth.verifyUser(freelanceData, email, hashedPassword);
      };
      case (_) {
        return false;
      };
    };
  };
}
