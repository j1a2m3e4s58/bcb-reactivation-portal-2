import Map      "mo:core/Map";
import List     "mo:core/List";
import Time     "mo:core/Time";
import Runtime  "mo:core/Runtime";
import Storage  "mo:caffeineai-object-storage/Storage";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types    "../types/accounts";
import AccountsLib "../lib/accounts";

mixin (
  accessControlState : AccessControl.AccessControlState,
  dormantAccounts    : Map.Map<Text, Types.DormantAccount>,
  followups          : List.List<Types.FollowupRecord>,
  reactivations      : List.List<Types.OnlineReactivation>,
  activated          : List.List<Types.AlreadyActivated>,
) {

  // ─── Helpers ─────────────────────────────────────────────────────────────

  func nowIso() : Text {
    let ns = Time.now();
    ns.toText()
  };

  func requireAdmin(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Staff access required.");
    };
  };

  // ─── Public Methods ───────────────────────────────────────────────────────

  public query func getPublicationAccounts() : async [Types.PublicationAccount] {
    AccountsLib.getPublicationAccounts(dormantAccounts)
  };

  public query func getDormantAccounts() : async [Types.DormantAccount] {
    AccountsLib.getDormantAccounts(dormantAccounts)
  };

  public query func verifyAccount(accountNumber : Text) : async Types.VerifyResult {
    AccountsLib.verifyAccount(dormantAccounts, accountNumber)
  };

  public shared func submitFollowup(
    accountNumber : Text,
    phoneNumber   : Text
  ) : async { #ok : Text; #err : Text } {
    let nextId = followups.size();
    let res = AccountsLib.submitFollowup(
      dormantAccounts, followups, nextId,
      accountNumber, phoneNumber, nowIso()
    );
    res.result
  };

  public shared func submitOnlineReactivation(
    fullName           : Text,
    phoneNumber        : Text,
    accountNumber      : Text,
    extraInfo          : ?Text,
    ghanaCardFrontKey  : Storage.ExternalBlob,
    ghanaCardBackKey   : Storage.ExternalBlob,
    ghanaCardSelfieKey : Storage.ExternalBlob
  ) : async { #ok : Text; #err : Text } {
    let nextId = reactivations.size();
    let res = AccountsLib.submitOnlineReactivation(
      reactivations, nextId,
      fullName, phoneNumber, accountNumber, extraInfo,
      ghanaCardFrontKey, ghanaCardBackKey, ghanaCardSelfieKey,
      nowIso()
    );
    res.result
  };

  // ─── Staff-Only Methods ───────────────────────────────────────────────────

  public query ({ caller }) func getFollowups() : async [Types.FollowupRecord] {
    requireAdmin(caller);
    AccountsLib.getFollowups(followups)
  };

  public query ({ caller }) func getFollowupsData() : async [Types.FollowupRecord] {
    requireAdmin(caller);
    AccountsLib.getFollowups(followups)
  };

  public shared ({ caller }) func deleteFollowups(ids : [Nat]) : async { #ok : Text; #err : Text } {
    requireAdmin(caller);
    AccountsLib.deleteFollowups(followups, ids)
  };

  public shared ({ caller }) func clearFollowups() : async { #ok : Text; #err : Text } {
    requireAdmin(caller);
    AccountsLib.clearFollowups(followups)
  };

  public query ({ caller }) func getPendingReactivations() : async [Types.OnlineReactivation] {
    requireAdmin(caller);
    let arr = reactivations.toArray();
    arr.filter(func(r : Types.OnlineReactivation) : Bool { r.status == "pending" }).reverse()
  };

  public query ({ caller }) func getPendingReactivationsData() : async [Types.OnlineReactivation] {
    requireAdmin(caller);
    let arr = reactivations.toArray();
    arr.filter(func(r : Types.OnlineReactivation) : Bool { r.status == "pending" }).reverse()
  };

  public shared ({ caller }) func exportReactivation(id : Nat) : async { #ok : Types.AlreadyActivated; #err : Text } {
    requireAdmin(caller);
    switch (reactivations.find(func(r : Types.OnlineReactivation) : Bool { r.id == id })) {
      case null { #err("Reactivation record not found.") };
      case (?r) {
        let exportedAt = nowIso();
        let activatedRecord : Types.AlreadyActivated = {
          id                 = activated.size();
          fullName           = r.fullName;
          phoneNumber        = r.phoneNumber;
          accountNumber      = r.accountNumber;
          extraInfo          = r.extraInfo;
          ghanaCardFrontKey  = r.ghanaCardFrontKey;
          ghanaCardBackKey   = r.ghanaCardBackKey;
          ghanaCardSelfieKey = r.ghanaCardSelfieKey;
          createdAt          = r.createdAt;
          exportedAt         = exportedAt;
        };
        activated.add(activatedRecord);
        // Remove from reactivations
        let retained = reactivations.filter(func(rec : Types.OnlineReactivation) : Bool { rec.id != id });
        reactivations.clear();
        reactivations.append(retained);
        #ok(activatedRecord)
      };
    }
  };

  public shared ({ caller }) func deleteReactivations(ids : [Nat]) : async { #ok : Text; #err : Text } {
    requireAdmin(caller);
    AccountsLib.deleteReactivations(reactivations, ids)
  };

  public shared ({ caller }) func clearReactivations() : async { #ok : Text; #err : Text } {
    requireAdmin(caller);
    AccountsLib.clearReactivations(reactivations)
  };

  public query ({ caller }) func getActivatedAccounts(search : ?Text) : async [Types.AlreadyActivated] {
    requireAdmin(caller);
    AccountsLib.getActivatedAccounts(activated, search)
  };

  public query ({ caller }) func getActivatedData() : async [Types.AlreadyActivated] {
    requireAdmin(caller);
    AccountsLib.getActivatedAccounts(activated, null)
  };

  public shared ({ caller }) func deleteActivatedAccounts(ids : [Nat]) : async { #ok : Text; #err : Text } {
    requireAdmin(caller);
    AccountsLib.deleteActivatedAccounts(activated, ids)
  };

  public shared ({ caller }) func clearActivatedAccounts() : async { #ok : Text; #err : Text } {
    requireAdmin(caller);
    AccountsLib.clearActivatedAccounts(activated)
  };

  public shared ({ caller }) func seedDormantAccounts(accounts : [Types.DormantAccount]) : async { #ok : Text; #err : Text } {
    requireAdmin(caller);
    AccountsLib.seedDormantAccounts(dormantAccounts, accounts);
    #ok("Seeded " # accounts.size().toText() # " dormant account(s).")
  };
};
