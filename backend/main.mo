import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";

actor {
  type Sanctuary = {
    name : Text;
    description : Text;
    date : Time.Time;
  };

  let sanctuaries = Map.empty<Text, Sanctuary>();

  // Add a new sanctuary
  public shared ({ caller }) func addSanctuary(name : Text, description : Text, date : Time.Time) : async () {
    let id = name.concat(date.toText());
    let sanctuary : Sanctuary = {
      name;
      description;
      date;
    };
    sanctuaries.add(id, sanctuary);
  };

  public query ({ caller }) func getSanctuary(id : Text) : async Sanctuary {
    switch (sanctuaries.get(id)) {
      case (null) {
        Runtime.trap("Sanctuary not found");
      };
      case (?sanctuary) { sanctuary };
    };
  };

  public query ({ caller }) func getDaySanctuaries(targetTime : Time.Time) : async [Sanctuary] {
    let filteredList = sanctuaries.values().toList<Sanctuary>().filter(
      func(sanctuary) {
        let sanctuaryDay = sanctuary.date / (24 * 60 * 60 * 1_000_000_000);
        let targetDay = targetTime / (24 * 60 * 60 * 1_000_000_000);
        sanctuaryDay == targetDay;
      }
    );
    filteredList.toArray();
  };

  public query ({ caller }) func getSanctuariesByMonth(targetTime : Time.Time) : async [Sanctuary] {
    let filteredList = sanctuaries.values().toList<Sanctuary>().filter(
      func(sanctuary) {
        let sanctuaryMonth = (sanctuary.date / (30 * 24 * 60 * 60 * 1_000_000_000)) % 12;
        let targetMonth = (targetTime / (30 * 24 * 60 * 60 * 1_000_000_000)) % 12;
        sanctuaryMonth == targetMonth;
      }
    );
    filteredList.toArray();
  };

  public query ({ caller }) func getSanctuariesByYear(targetTime : Time.Time) : async [Sanctuary] {
    let filteredList = sanctuaries.values().toList<Sanctuary>().filter(
      func(sanctuary) {
        let sanctuaryYear = sanctuary.date / (365 * 24 * 60 * 60 * 1_000_000_000);
        let targetYear = targetTime / (365 * 24 * 60 * 60 * 1_000_000_000);
        sanctuaryYear == targetYear;
      }
    );
    filteredList.toArray();
  };

  public query ({ caller }) func getAllSanctuaries() : async [Sanctuary] {
    sanctuaries.values().toArray();
  };
};
