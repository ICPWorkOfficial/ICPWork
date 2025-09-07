import Sha256 "mo:sha2/Sha256";
import Blob "mo:base/Blob";
import Text "mo:base/Text";

module {

    // Utility functions for hashing and verifying passwords
  public func hashPassword(password : Text) : Blob {
    Sha256.fromBlob(#sha256, Text.encodeUtf8(password))
  };

  public func verifyPassword(password : Text, storedHash : Blob) : Bool {
    hashPassword(password) == storedHash
  };

  
}
