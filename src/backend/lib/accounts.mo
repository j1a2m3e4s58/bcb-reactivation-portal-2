import Map    "mo:core/Map";
import List   "mo:core/List";
import Text   "mo:core/Text";
import Storage "mo:caffeineai-object-storage/Storage";
import Types  "../types/accounts";

module {

  // ─── Dormant Accounts ───────────────────────────────────────────────────────

  /// Returns all dormant accounts as PublicationAccount items.
  public func getPublicationAccounts(
    dormantAccounts : Map.Map<Text, Types.DormantAccount>
  ) : [Types.PublicationAccount] {
    let arr = dormantAccounts.toArray();
    let sorted = arr.sort(func((_, a), (_, b)) = Text.compare(a.accountName, b.accountName));
    sorted.map<(Text, Types.DormantAccount), Types.PublicationAccount>(func((_, d)) {
      { accountName = d.accountName; branch = d.branch; dateOfDormancy = d.dateOfDormancy }
    })
  };

  /// Returns all dormant accounts ordered by name.
  public func getDormantAccounts(
    dormantAccounts : Map.Map<Text, Types.DormantAccount>
  ) : [Types.DormantAccount] {
    let arr = dormantAccounts.toArray();
    let sorted = arr.sort(func((_, a), (_, b)) = Text.compare(a.accountName, b.accountName));
    sorted.map<(Text, Types.DormantAccount), Types.DormantAccount>(func((_, d)) { d })
  };

  /// Verifies whether an account number exists.
  public func verifyAccount(
    dormantAccounts : Map.Map<Text, Types.DormantAccount>,
    accountNumber   : Text
  ) : Types.VerifyResult {
    switch (dormantAccounts.get(accountNumber)) {
      case (?acct) {
        {
          found         = true;
          accountNumber = ?acct.accountNumber;
          accountName   = ?acct.accountName;
          message       = "Account found.";
        }
      };
      case null {
        {
          found         = false;
          accountNumber = null;
          accountName   = null;
          message       = "Account number not found in dormant accounts list.";
        }
      };
    }
  };

  /// Validates that a phone number is exactly 10 digits.
  public func isValidPhone(phoneNumber : Text) : Bool {
    if (phoneNumber.size() != 10) return false;
    phoneNumber.toArray().all(func(c : Char) : Bool {
      c >= '0' and c <= '9'
    })
  };

  /// Seeds dormant accounts into the map (replaces existing by key).
  public func seedDormantAccounts(
    dormantAccounts : Map.Map<Text, Types.DormantAccount>,
    accounts        : [Types.DormantAccount]
  ) : () {
    for (acct in accounts.values()) {
      dormantAccounts.add(acct.accountNumber, acct);
    };
  };

  // ─── Follow-ups ─────────────────────────────────────────────────────────────

  /// Submits a follow-up record after verifying the account and phone number.
  /// Uses List.size() as next id.
  public func submitFollowup(
    dormantAccounts : Map.Map<Text, Types.DormantAccount>,
    followups       : List.List<Types.FollowupRecord>,
    nextId          : Nat,
    accountNumber   : Text,
    phoneNumber     : Text,
    now             : Text
  ) : { result : { #ok : Text; #err : Text }; nextId : Nat } {
    if (not isValidPhone(phoneNumber)) {
      return { result = #err("Phone number must be exactly 10 digits."); nextId };
    };
    switch (dormantAccounts.get(accountNumber)) {
      case null {
        { result = #err("Account number not found."); nextId }
      };
      case (?acct) {
        let record : Types.FollowupRecord = {
          id            = nextId;
          accountNumber = acct.accountNumber;
          accountName   = acct.accountName;
          phoneNumber   = phoneNumber;
          createdAt     = now;
        };
        followups.add(record);
        { result = #ok("Follow-up submitted successfully."); nextId = nextId + 1 }
      };
    }
  };

  /// Returns all follow-up records as an array (most recent first).
  public func getFollowups(
    followups : List.List<Types.FollowupRecord>
  ) : [Types.FollowupRecord] {
    let arr = followups.toArray();
    arr.reverse()
  };

  /// Deletes follow-up records by id list.
  public func deleteFollowups(
    followups : List.List<Types.FollowupRecord>,
    ids       : [Nat]
  ) : { #ok : Text; #err : Text } {
    let idSet = ids;
    let retained = followups.filter(func(r : Types.FollowupRecord) : Bool {
      idSet.find(func(id : Nat) : Bool { id == r.id }) == null
    });
    followups.clear();
    followups.append(retained);
    #ok("Deleted " # idSet.size().toText() # " follow-up(s).")
  };

  /// Clears all follow-up records.
  public func clearFollowups(
    followups : List.List<Types.FollowupRecord>
  ) : { #ok : Text; #err : Text } {
    followups.clear();
    #ok("All follow-ups cleared.")
  };

  // ─── Online Reactivations ───────────────────────────────────────────────────

  /// Submits an online reactivation.
  public func submitOnlineReactivation(
    reactivations      : List.List<Types.OnlineReactivation>,
    nextId             : Nat,
    fullName           : Text,
    phoneNumber        : Text,
    accountNumber      : Text,
    extraInfo          : ?Text,
    ghanaCardFrontKey  : Storage.ExternalBlob,
    ghanaCardBackKey   : Storage.ExternalBlob,
    ghanaCardSelfieKey : Storage.ExternalBlob,
    now                : Text
  ) : { result : { #ok : Text; #err : Text }; nextId : Nat } {
    if (not isValidPhone(phoneNumber)) {
      return { result = #err("Phone number must be exactly 10 digits."); nextId };
    };
    if (fullName.size() == 0) {
      return { result = #err("Full name is required."); nextId };
    };
    if (accountNumber.size() == 0) {
      return { result = #err("Account number is required."); nextId };
    };
    let record : Types.OnlineReactivation = {
      id                  = nextId;
      fullName            = fullName;
      phoneNumber         = phoneNumber;
      accountNumber       = accountNumber;
      extraInfo           = extraInfo;
      ghanaCardFrontKey   = ghanaCardFrontKey;
      ghanaCardBackKey    = ghanaCardBackKey;
      ghanaCardSelfieKey  = ghanaCardSelfieKey;
      createdAt           = now;
      status              = "pending";
      activatedAt         = null;
    };
    reactivations.add(record);
    { result = #ok("Reactivation submitted successfully."); nextId = nextId + 1 }
  };

  /// Deletes reactivation records by id list.
  public func deleteReactivations(
    reactivations : List.List<Types.OnlineReactivation>,
    ids           : [Nat]
  ) : { #ok : Text; #err : Text } {
    let idSet = ids;
    let retained = reactivations.filter(func(r : Types.OnlineReactivation) : Bool {
      idSet.find(func(id : Nat) : Bool { id == r.id }) == null
    });
    reactivations.clear();
    reactivations.append(retained);
    #ok("Deleted " # idSet.size().toText() # " reactivation(s).")
  };

  /// Clears all reactivation records.
  public func clearReactivations(
    reactivations : List.List<Types.OnlineReactivation>
  ) : { #ok : Text; #err : Text } {
    reactivations.clear();
    #ok("All reactivations cleared.")
  };

  // ─── Already Activated ──────────────────────────────────────────────────────

  /// Returns activated accounts, optionally filtered by search term (case-insensitive).
  public func getActivatedAccounts(
    activated : List.List<Types.AlreadyActivated>,
    search    : ?Text
  ) : [Types.AlreadyActivated] {
    let arr = activated.toArray();
    switch (search) {
      case null { arr.reverse() };
      case (?q) {
        let lower = q.toLower();
        arr.filter(func(r : Types.AlreadyActivated) : Bool {
          r.fullName.toLower().contains(#text(lower)) or
          r.accountNumber.toLower().contains(#text(lower)) or
          r.phoneNumber.toLower().contains(#text(lower))
        }).reverse()
      };
    }
  };

  /// Deletes activated accounts by id list.
  public func deleteActivatedAccounts(
    activated : List.List<Types.AlreadyActivated>,
    ids       : [Nat]
  ) : { #ok : Text; #err : Text } {
    let idSet = ids;
    let retained = activated.filter(func(r : Types.AlreadyActivated) : Bool {
      idSet.find(func(id : Nat) : Bool { id == r.id }) == null
    });
    activated.clear();
    activated.append(retained);
    #ok("Deleted " # idSet.size().toText() # " activated record(s).")
  };

  /// Clears all activated account records.
  public func clearActivatedAccounts(
    activated : List.List<Types.AlreadyActivated>
  ) : { #ok : Text; #err : Text } {
    activated.clear();
    #ok("All activated accounts cleared.")
  };

  // ─── Sample Seed Data ───────────────────────────────────────────────────────

  /// Returns the pre-defined 15 sample Ghanaian-style dormant accounts.
  public func sampleAccounts() : [Types.DormantAccount] {
    [
      { accountNumber = "1001234567"; accountName = "Kwame Mensah";       branch = "Bawjiase";      dateOfDormancy = "2020-03-15" },
      { accountNumber = "1002345678"; accountName = "Abena Asante";       branch = "Kasoa";         dateOfDormancy = "2019-11-22" },
      { accountNumber = "1003456789"; accountName = "Kojo Boateng";       branch = "Winneba";       dateOfDormancy = "2021-01-08" },
      { accountNumber = "1004567890"; accountName = "Ama Darko";          branch = "Accra Central"; dateOfDormancy = "2020-07-30" },
      { accountNumber = "1005678901"; accountName = "Kofi Acheampong";    branch = "Bawjiase";      dateOfDormancy = "2018-09-14" },
      { accountNumber = "1006789012"; accountName = "Akosua Owusu";       branch = "Kasoa";         dateOfDormancy = "2021-05-19" },
      { accountNumber = "1007890123"; accountName = "Yaw Antwi";          branch = "Winneba";       dateOfDormancy = "2019-02-28" },
      { accountNumber = "1008901234"; accountName = "Adwoa Frimpong";     branch = "Accra Central"; dateOfDormancy = "2020-12-05" },
      { accountNumber = "1009012345"; accountName = "Kwesi Tetteh";       branch = "Bawjiase";      dateOfDormancy = "2021-08-17" },
      { accountNumber = "1000123456"; accountName = "Efua Amponsah";      branch = "Kasoa";         dateOfDormancy = "2018-06-03" },
      { accountNumber = "1001234568"; accountName = "Nana Osei";          branch = "Winneba";       dateOfDormancy = "2020-04-21" },
      { accountNumber = "1002345679"; accountName = "Akua Bonsu";         branch = "Accra Central"; dateOfDormancy = "2019-10-11" },
      { accountNumber = "1003456780"; accountName = "Kwabena Appiah";     branch = "Bawjiase";      dateOfDormancy = "2021-03-09" },
      { accountNumber = "1004567891"; accountName = "Esi Quaye";          branch = "Kasoa";         dateOfDormancy = "2020-01-26" },
      { accountNumber = "1005678902"; accountName = "Fiifi Asiedu";       branch = "Winneba";       dateOfDormancy = "2019-07-14" },
    ]
  };
};
