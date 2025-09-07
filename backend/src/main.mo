import Auth "./auth";

persistent actor Main {
  transient let authService = Auth.Auth();

  system func preupgrade() { authService.preupgrade(); };
  system func postupgrade() { authService.postupgrade(); };

  public func auth(email : Text, password : Text) : async (Text, Blob) {
    authService.auth(email, password)
  };

  public func login(email : Text, password : Text) : async Bool {
    authService.login(email, password)
  };

  public func listUsers() : async [(Text, Blob)] {
    authService.listUsers()
  };
}
