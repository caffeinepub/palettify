import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type StyleId = Nat;

  public type UserProfile = {
    name : Text;
  };

  public type ArtStyle = {
    id : StyleId;
    name : Text;
    timePeriod : Text;
    description : Text;
    characteristics : [Text];
    notableArtists : [Text];
    artworks : [Artwork];
  };

  public type Artwork = {
    title : Text;
    artist : Text;
  };

  public type QuizAttempt = {
    styleId : StyleId;
    correct : Bool;
    score : Nat;
  };

  public type StyleProgress = {
    bestScore : Nat;
    attemptsCount : Nat;
  };

  public type UserStats = {
    stylesStudied : Nat;
    quizzesTaken : Nat;
    averageScore : Nat;
    perStyleProgress : [(StyleId, StyleProgress)];
  };

  public type QuizOption = {
    styleId : StyleId;
    styleName : Text;
  };

  public type QuizQuestion = {
    clue : Text;
    clueType : Text;
    correctStyleId : StyleId;
    options : [QuizOption];
  };

  public type QuizResult = {
    correct : Bool;
    correctStyleId : StyleId;
    correctStyleName : Text;
  };

  public type ArtStyleWithProgress = {
    artStyle : ArtStyle;
    isStudied : Bool;
    progress : ?StyleProgress;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();
  let artStyles = Map.empty<StyleId, ArtStyle>();
  let userStudiedStyles = Map.empty<Principal, Set.Set<StyleId>>();
  let userStyleProgress = Map.empty<Principal, Map.Map<StyleId, StyleProgress>>();
  let userQuizAttempts = Map.empty<Principal, [QuizAttempt]>();
  var nextStyleId : Nat = 0;

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
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

  // Art Style Management (Admin only)
  public shared ({ caller }) func addArtStyle(style : ArtStyle) : async StyleId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add art styles");
    };
    let id = nextStyleId;
    nextStyleId += 1;
    let styleWithId = {
      id = id;
      name = style.name;
      timePeriod = style.timePeriod;
      description = style.description;
      characteristics = style.characteristics;
      notableArtists = style.notableArtists;
      artworks = style.artworks;
    };
    artStyles.add(id, styleWithId);
    id;
  };

  public shared ({ caller }) func updateArtStyle(id : StyleId, style : ArtStyle) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update art styles");
    };
    let styleWithId = {
      id = id;
      name = style.name;
      timePeriod = style.timePeriod;
      description = style.description;
      characteristics = style.characteristics;
      notableArtists = style.notableArtists;
      artworks = style.artworks;
    };
    artStyles.add(id, styleWithId);
  };

  public shared ({ caller }) func deleteArtStyle(id : StyleId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete art styles");
    };
    artStyles.remove(id);
  };

  // Art Style Viewing (Open to all including guests)
  public query func getArtStyle(id : StyleId) : async ?ArtStyle {
    artStyles.get(id);
  };

  public query func getAllArtStyles() : async [ArtStyle] {
    artStyles.values().toArray();
  };

  // User Progress Tracking (User only)
  public shared ({ caller }) func markStyleAsStudied(styleId : StyleId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark styles as studied");
    };

    let studied = switch (userStudiedStyles.get(caller)) {
      case (null) { Set.empty<StyleId>() };
      case (?set) { set };
    };
    studied.add(styleId);
    userStudiedStyles.add(caller, studied);
  };

  public shared ({ caller }) func unmarkStyleAsStudied(styleId : StyleId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unmark styles");
    };

    switch (userStudiedStyles.get(caller)) {
      case (null) {};
      case (?studied) {
        studied.remove(styleId);
        userStudiedStyles.add(caller, studied);
      };
    };
  };

  public query ({ caller }) func getStudiedStyles() : async [StyleId] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view studied styles");
    };

    switch (userStudiedStyles.get(caller)) {
      case (null) { [] };
      case (?studied) { studied.toArray() };
    };
  };

  public query ({ caller }) func getAllArtStylesWithProgress() : async [ArtStyleWithProgress] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view progress");
    };

    let studied = userStudiedStyles.get(caller);
    let progress = userStyleProgress.get(caller);

    let withProgress = func(style : ArtStyle) : ArtStyleWithProgress {
      let isStudied = switch (studied) {
        case (null) { false };
        case (?set) { set.contains(style.id) };
      };

      let styleProgress = switch (progress) {
        case (null) { null };
        case (?progressMap) { progressMap.get(style.id) };
      };

      {
        artStyle = style;
        isStudied = isStudied;
        progress = styleProgress;
      };
    };

    artStyles.values().toArray().map(withProgress);
  };

  // Quiz System (User only)
  public shared ({ caller }) func getRandomQuizQuestion() : async ?QuizQuestion {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access quizzes");
    };

    let styles = artStyles.values().toArray();
    if (styles.size() < 4) {
      return null;
    };

    // Simple pseudo-random selection based on caller
    let callerBytes = caller.toBlob();
    let seed = if (callerBytes.size() > 0) {
      callerBytes.get(0).toNat();
    } else {
      0;
    };

    let correctIndex = seed % styles.size();
    let correctStyle = styles[correctIndex];

    // Select clue (characteristic or artwork)
    let useCharacteristic = (seed % 2) == 0;
    let clue = if (useCharacteristic and correctStyle.characteristics.size() > 0) {
      let charIndex = seed % correctStyle.characteristics.size();
      correctStyle.characteristics[charIndex];
    } else if (correctStyle.artworks.size() > 0) {
      let artIndex = seed % correctStyle.artworks.size();
      let artwork = correctStyle.artworks[artIndex];
      "Artwork: \"" # artwork.title # "\" by " # artwork.artist;
    } else if (correctStyle.characteristics.size() > 0) {
      correctStyle.characteristics[0];
    } else {
      correctStyle.description;
    };

    // Generate 4 options including the correct one
    var options : [QuizOption] = [];
    options := options.concat([{
      styleId = correctStyle.id;
      styleName = correctStyle.name;
    }]);

    var optionCount = 1;
    var offset = 1;
    while (optionCount < 4 and offset < styles.size()) {
      let optionIndex = (correctIndex + offset) % styles.size();
      if (optionIndex != correctIndex) {
        let optionStyle = styles[optionIndex];
        options := options.concat([{
          styleId = optionStyle.id;
          styleName = optionStyle.name;
        }]);
        optionCount += 1;
      };
      offset += 1;
    };

    ?{
      clue = clue;
      clueType = if (useCharacteristic) { "characteristic" } else { "artwork" };
      correctStyleId = correctStyle.id;
      options = options;
    };
  };

  public shared ({ caller }) func submitQuizAnswer(styleId : StyleId, selectedStyleId : StyleId, score : Nat) : async QuizResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit quiz answers");
    };

    let correct = styleId == selectedStyleId;
    let finalScore = if (correct) { score } else { 0 };

    // Record attempt
    let attempt : QuizAttempt = {
      styleId = styleId;
      correct = correct;
      score = finalScore;
    };

    let attempts = switch (userQuizAttempts.get(caller)) {
      case (null) { [attempt] };
      case (?existing) { existing.concat([attempt]) };
    };
    userQuizAttempts.add(caller, attempts);

    // Update progress
    let progressMap = switch (userStyleProgress.get(caller)) {
      case (null) { Map.empty<StyleId, StyleProgress>() };
      case (?existing) { existing };
    };

    let currentProgress = switch (progressMap.get(styleId)) {
      case (null) {
        {
          bestScore = finalScore;
          attemptsCount = 1;
        };
      };
      case (?existing) {
        {
          bestScore = if (finalScore > existing.bestScore) { finalScore } else { existing.bestScore };
          attemptsCount = existing.attemptsCount + 1;
        };
      };
    };

    progressMap.add(styleId, currentProgress);
    userStyleProgress.add(caller, progressMap);

    let correctStyleName = switch (artStyles.get(styleId)) {
      case (null) { "Unknown" };
      case (?style) { style.name };
    };

    {
      correct = correct;
      correctStyleId = styleId;
      correctStyleName = correctStyleName;
    };
  };

  // Stats (User can view own, Admin can view any)
  public query ({ caller }) func getUserStats(user : Principal) : async UserStats {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own stats");
    };

    let stylesStudied = switch (userStudiedStyles.get(user)) {
      case (null) { 0 };
      case (?studied) { studied.size() };
    };

    let userAttempts = switch (userQuizAttempts.get(user)) {
      case (null) { [] };
      case (?attempts) { attempts };
    };

    let quizzesTaken = userAttempts.size();

    let averageScore = if (userAttempts.size() == 0) {
      0;
    } else {
      var total = 0;
      for (attempt in userAttempts.vals()) {
        total += attempt.score;
      };
      total / userAttempts.size();
    };

    let perStyleProgress : [(StyleId, StyleProgress)] = switch (userStyleProgress.get(user)) {
      case (null) { [] };
      case (?progressMap) {
        progressMap.entries().toArray();
      };
    };

    {
      stylesStudied = stylesStudied;
      quizzesTaken = quizzesTaken;
      averageScore = averageScore;
      perStyleProgress = perStyleProgress;
    };
  };

  public query ({ caller }) func getCallerStats() : async UserStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view stats");
    };

    let stylesStudied = switch (userStudiedStyles.get(caller)) {
      case (null) { 0 };
      case (?studied) { studied.size() };
    };

    let userAttempts = switch (userQuizAttempts.get(caller)) {
      case (null) { [] };
      case (?attempts) { attempts };
    };

    let quizzesTaken = userAttempts.size();

    let averageScore = if (userAttempts.size() == 0) {
      0;
    } else {
      var total = 0;
      for (attempt in userAttempts.vals()) {
        total += attempt.score;
      };
      total / userAttempts.size();
    };

    let perStyleProgress : [(StyleId, StyleProgress)] = switch (userStyleProgress.get(caller)) {
      case (null) { [] };
      case (?progressMap) {
        progressMap.entries().toArray();
      };
    };

    {
      stylesStudied = stylesStudied;
      quizzesTaken = quizzesTaken;
      averageScore = averageScore;
      perStyleProgress = perStyleProgress;
    };
  };
};
