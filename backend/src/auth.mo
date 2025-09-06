module {
  public type User = {
    email : Text;
    passwordHash : Text; // already hashed before storage
  };

  // Verifies email + passwordHash against stored users
  public func verifyUser(users : [User], email : Text, passwordHash : Text) : Bool {
    for (u in users.vals()) {
      if (u.email == email and u.passwordHash == passwordHash) {
        return true;
      };
    };
    return false;
  };
}
