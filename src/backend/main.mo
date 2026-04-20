import Map              "mo:core/Map";
import List             "mo:core/List";
import AccessControl    "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import AccountsMixin    "mixins/accounts-api";
import AccountsLib      "lib/accounts";
import Types            "types/accounts";

actor {
  // ─── Authorization ──────────────────────────────────────────────────────────
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ─── Object Storage ─────────────────────────────────────────────────────────
  include MixinObjectStorage();

  // ─── Dormant Accounts ───────────────────────────────────────────────────────
  let dormantAccounts    = Map.empty<Text, Types.DormantAccount>();

  // ─── Follow-ups ─────────────────────────────────────────────────────────────
  let followups          = List.empty<Types.FollowupRecord>();

  // ─── Online Reactivations ───────────────────────────────────────────────────
  let reactivations      = List.empty<Types.OnlineReactivation>();

  // ─── Already Activated ──────────────────────────────────────────────────────
  let activated          = List.empty<Types.AlreadyActivated>();

  // ─── Pre-seed sample dormant accounts ───────────────────────────────────────
  do {
    let samples = AccountsLib.sampleAccounts();
    AccountsLib.seedDormantAccounts(dormantAccounts, samples);
  };

  // ─── Accounts API Mixin ─────────────────────────────────────────────────────
  include AccountsMixin(
    accessControlState,
    dormantAccounts,
    followups,
    reactivations,
    activated,
  );
};
