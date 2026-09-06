// Exercise sets. Every user (school account) is assigned one; new accounts default to A.
const EXERCISE_SETS = ["A", "B"];
const DEFAULT_EXERCISE_SET = "A";

// Falls back to A for anything unknown, including users created before sets existed.
const normalizeExerciseSet = (set) => (EXERCISE_SETS.includes(set) ? set : DEFAULT_EXERCISE_SET);

const games = [
  // Shared by both sets: a reaction-time baseline with no linguistic content
  { id: 16, name: "Χρόνος Αντίδρασης", description: "", color: `hsl(0, 80%, 70%)`, sets: ["A", "B"] },

  // Set A
  { id: 1, name: "Βρες τη βάση", description: "", color: `hsl(25, 80%, 70%)`, sets: ["A"] },
  { id: 2, name: "Βρες το επίθημα", description: "", color: `hsl(50, 80%, 70%)`, sets: ["A"] },
  { id: 3, name: "Βάση-μανία", description: "", color: `hsl(75, 80%, 70%)`, sets: ["A"] },
  { id: 4, name: "Βρες το σωστό τέλος", description: "", color: `hsl(100, 80%, 70%)`, sets: ["A"] },
  { id: 5, name: "Σπάσε τη λέξη στα δύο", description: "", color: `hsl(125, 80%, 70%)`, sets: ["A"] },
  { id: 6, name: "Βρες τη σωστή αρχή", description: "", color: `hsl(150, 80%, 70%)`, sets: ["A"] },
  { id: 7, name: "Ταξίδι στα προθήματα", description: "", color: `hsl(175, 80%, 70%)`, sets: ["A"] },
  { id: 8, name: "Μορφολογικό παζλ", description: "", color: `hsl(200, 80%, 70%)`, sets: ["A"] },
  { id: 9, name: "Κυνήγι διπλής όψης", description: "", color: `hsl(225, 80%, 70%)`, sets: ["A"] },
  { id: 10, name: "Λεξο-κομματάκια", description: "", color: `hsl(250, 80%, 70%)`, sets: ["A"] },
  { id: 11, name: "Ταξίδι στα επιθήματα", description: "", color: `hsl(275, 80%, 70%)`, sets: ["A"] },
  { id: 12, name: "Πώς τελειώνει", description: "", color: `hsl(300, 80%, 70%)`, sets: ["A"] },
  { id: 13, name: "Λεξοπλασία", description: "", color: `hsl(325, 80%, 70%)`, sets: ["A"] },
  { id: 14, name: "Κυνήγι επιθημάτων", description: "", color: `hsl(350, 80%, 70%)`, sets: ["A"] },
  { id: 15, name: "Κατάληξέ το", description: "", color: `hsl(360, 80%, 70%)`, sets: ["A"] },

  // Set B — παιχνίδια 17-31
  // Το χρώμα κάθε άσκησης είναι ίδιο με το αντίστοιχό της στο Σετ Α.
  { id: 17, name: "Βρες τη λέξη", description: "", color: `hsl(25, 80%, 70%)`, sets: ["B"] },
  { id: 18, name: "Βρες τον διαφορετικό", description: "", color: `hsl(50, 80%, 70%)`, sets: ["B"] },
  { id: 19, name: "Σημασιο-μανία", description: "", color: `hsl(75, 80%, 70%)`, sets: ["B"] },
  { id: 20, name: "Διάλεξε το σωστό", description: "", color: `hsl(100, 80%, 70%)`, sets: ["B"] },
  { id: 21, name: "Κυριολεξία ή μεταφορά;", description: "", color: `hsl(125, 80%, 70%)`, sets: ["B"] },
  { id: 22, name: "Ποια λέξη λείπει;", description: "", color: `hsl(150, 80%, 70%)`, sets: ["B"] },
  { id: 23, name: "Πού ταιριάζει;", description: "", color: `hsl(175, 80%, 70%)`, sets: ["B"] },
  { id: 24, name: "Φτιάξε τη σωστή φράση", description: "", color: `hsl(200, 80%, 70%)`, sets: ["B"] },
];

const getGamesForSet = (set) => {
  const exerciseSet = normalizeExerciseSet(set);
  return games.filter((game) => game.sets.includes(exerciseSet));
};

const isGameInSet = (gameId, set) => getGamesForSet(set).some((game) => game.id === gameId);

export { games, getGamesForSet, isGameInSet, normalizeExerciseSet, EXERCISE_SETS, DEFAULT_EXERCISE_SET };
