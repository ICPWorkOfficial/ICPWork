import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Utils "./utils";

module {
  public class Auth() {
    var usersArray : [(Text, Blob)] = [];

    var users = Buffer.fromArray<(Text, Blob)>(usersArray);

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
        let (e, _) = users.get(i);
        if (e == email) return ?i;
        i += 1;
      };
      return null;
    };

    public func auth(email : Text, password : Text) : (Text, Blob) {
      let hashed = Utils.hashPassword(password);

      switch (findUserIndex(email)) {
        case (?i) { users.put(i, (email, hashed)); };
        case null { users.add((email, hashed)); };
      };

      (email, hashed)
    };

    public func login(email : Text, password : Text) : Bool {
      switch (findUserIndex(email)) {
        case (?i) {
          let (_, storedHash) = users.get(i);
          Utils.hashPassword(password) == storedHash
        };
        case null { false };
      }
    };

    public func listUsers() : [(Text, Blob)] {
      Buffer.toArray(users)
    };
  };
}
