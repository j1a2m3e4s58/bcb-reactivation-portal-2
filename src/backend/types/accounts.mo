import Storage "mo:caffeineai-object-storage/Storage";

module {
  /// A dormant account record stored in stable state.
  public type DormantAccount = {
    accountNumber : Text;
    accountName   : Text;
    branch        : Text;
    dateOfDormancy : Text;
  };

  /// Subset of DormantAccount exposed on the public publication list.
  public type PublicationAccount = {
    accountName    : Text;
    branch         : Text;
    dateOfDormancy : Text;
  };

  /// Result returned by verifyAccount.
  public type VerifyResult = {
    found         : Bool;
    accountNumber : ?Text;
    accountName   : ?Text;
    message       : Text;
  };

  /// A phone follow-up record.
  public type FollowupRecord = {
    id            : Nat;
    accountNumber : Text;
    accountName   : Text;
    phoneNumber   : Text;
    createdAt     : Text;
  };

  /// An online reactivation submission (pending or in-progress).
  public type OnlineReactivation = {
    id                  : Nat;
    fullName            : Text;
    phoneNumber         : Text;
    accountNumber       : Text;
    extraInfo           : ?Text;
    ghanaCardFrontKey   : Storage.ExternalBlob;
    ghanaCardBackKey    : Storage.ExternalBlob;
    ghanaCardSelfieKey  : Storage.ExternalBlob;
    createdAt           : Text;
    status              : Text;
    activatedAt         : ?Text;
  };

  /// An already-activated (exported) reactivation record.
  public type AlreadyActivated = {
    id                  : Nat;
    fullName            : Text;
    phoneNumber         : Text;
    accountNumber       : Text;
    extraInfo           : ?Text;
    ghanaCardFrontKey   : Storage.ExternalBlob;
    ghanaCardBackKey    : Storage.ExternalBlob;
    ghanaCardSelfieKey  : Storage.ExternalBlob;
    createdAt           : Text;
    exportedAt          : Text;
  };
};
