import Blob "mo:base/Blob";
import Text "mo:base/Text";
import Sha256 "mo:sha2/Sha256";
import Random "mo:base/Random";
import Nat64 "mo:base/Nat64";
import Nat8 "mo:base/Nat8";


module {
  // Hash a password using SHA-256 and return blob digest
  public func hashPassword(password : Text) : Blob {
    let bytes = Text.encodeUtf8(password);
    let digest = Sha256.fromBlob(#sha256, bytes);
    return digest;
  };

  // Generates a 6-digit OTP using Nat64
  public func generateOtpNat64() : async Nat64 {
    let entropy : Blob = await Random.blob();
    let rand = Random.Finite(entropy);
    
    let b0 : Nat8 = switch (rand.byte()) {
      case (?v) v;
      case null 0;
    };
    let b1 : Nat8 = switch (rand.byte()) {
      case (?v) v;
      case null 0;
    };
    let b2 : Nat8 = switch (rand.byte()) {
      case (?v) v;
      case null 0;
    };


    let randomVal : Nat64 = Nat64.fromNat(Nat8.toNat(b0)) * 256 * 256
               + Nat64.fromNat(Nat8.toNat(b1)) * 256
               + Nat64.fromNat(Nat8.toNat(b2));

  
  let min : Nat64 = 100_000;
  let max : Nat64 = 999_999;
  let range : Nat64 = max - min + 1; // = 900_000

  let otp64 : Nat64 = min + (randomVal % range);

  return Nat64.fromNat(Nat64.toNat(otp64));
  }
}
