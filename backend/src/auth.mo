import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Utils "./utils";

module {
  public type User = {
    email : Text;
    passwordHash : Blob;
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

    public func auth(email : Text, password : Text) : User {
      let hashed = Utils.hashPassword(password);
      let newUser : User = { email = email; passwordHash = hashed };

      switch (findUserIndex(email)) {
        case (?i) { users.put(i, newUser); };
        case null { users.add(newUser); };
      };

      newUser
    };

    public func login(email : Text, password : Text) : Bool {
      switch (findUserIndex(email)) {
        case (?i) {
          let u = users.get(i);
          Utils.hashPassword(password) == u.passwordHash
        };
        case null { false };
      }
    };

    public func listUsers() : [User] {
      Buffer.toArray(users)
    };
  };
}
