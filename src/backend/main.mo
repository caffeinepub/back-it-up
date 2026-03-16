import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Session = {
    timestamp : Time.Time;
    totalBadPostureDuration : Nat;
    totalGoodPostureDuration : Nat;
    threshold : Float;
  };

  public type UserProfile = {
    name : Text;
  };

  public type UserSettings = {
    postureThreshold : Float;
  };

  let sessions = Map.empty<Principal, [Session]>();
  let userSettings = Map.empty<Principal, UserSettings>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // ---- User Profile functions (required by frontend) ----

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ---- Session functions ----

  public query ({ caller }) func getSessions() : async [Session] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view sessions");
    };
    switch (sessions.get(caller)) {
      case (null) { [] };
      case (?userSessions) { userSessions };
    };
  };

  public shared ({ caller }) func addSession(session : Session) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add sessions");
    };
    switch (sessions.get(caller)) {
      case (null) { sessions.add(caller, [session]) };
      case (?existingSessions) {
        sessions.add(caller, existingSessions.concat([session]));
      };
    };
  };

  public shared ({ caller }) func updateSettings(newSettings : UserSettings) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update settings");
    };
    userSettings.add(caller, newSettings);
  };

  public query ({ caller }) func getSettings() : async UserSettings {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get settings");
    };
    switch (userSettings.get(caller)) {
      case (null) {
        let defaultSettings : UserSettings = {
          postureThreshold = 10.0;
        };
        defaultSettings;
      };
      case (?settings) { settings };
    };
  };

  public query ({ caller }) func getSortedSessions() : async [Session] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view sessions");
    };
    switch (sessions.get(caller)) {
      case (null) { [] };
      case (?userSessions) {
        userSessions.sort(
          func(s1 : Session, s2 : Session) : Order.Order {
            if (s1.timestamp < s2.timestamp) { #less }
            else if (s1.timestamp > s2.timestamp) { #greater }
            else { #equal };
          },
        );
      };
    };
  };
};
