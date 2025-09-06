import Blob "mo:base/Blob";
import Text "mo:base/Text";
import Sha256 "mo:sha2/Sha256";

module {
  // Hash a password using SHA-256 and return hex string
  public func hashPassword(password : Text) : Text {
    let bytes = Text.encodeUtf8(password);
    let digest = SHA256.sha256(bytes);
    return Blob.toHex(digest);
  };
}
