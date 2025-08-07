import { db } from "./firebase";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

// Check how many attempts a student has made for a specific game
export const getStudentGameAttempts = async (studentId, gameId, schoolId = null) => {
  try {
    const school = schoolId || localStorage.getItem("school");
    
    if (!studentId || !gameId || !school) {
      console.error("Missing required parameters for game attempts check");
      return 0;
    }

    const q = query(
      collection(db, "reports"),
      where("schoolId", "==", school),
      where("studentId", "==", studentId),
      where("gameId", "==", parseInt(gameId))
    );
    
    const querySnapshot = await getDocs(q);
    const attemptCount = querySnapshot.docs.length;
    
    // console.log(`Student ${studentId} has ${attemptCount} attempts for game ${gameId}`);
    return attemptCount;
    
  } catch (error) {
    console.error("Error checking game attempts:", error);
    return 0; // Return 0 on error to allow playing (fail-safe)
  }
};

// Check if a student can play a game (less than 2 attempts)
export const canStudentPlayGame = async (studentId, gameId, schoolId = null) => {
  try {
    const attempts = await getStudentGameAttempts(studentId, gameId, schoolId);
    return attempts < 2;
  } catch (error) {
    console.error("Error checking if student can play:", error);
    return true; // Allow playing on error (fail-safe)
  }
};

// Check if a report can be saved (validates attempts before saving)
export const canSaveGameReport = async (studentId, gameId, schoolId = null) => {
  try {
    const attempts = await getStudentGameAttempts(studentId, gameId, schoolId);
    if (attempts >= 2) {
      console.warn(`Cannot save report: Student ${studentId} has already completed ${attempts} attempts for game ${gameId}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error checking if report can be saved:", error);
    return true; // Allow saving on error (fail-safe)
  }
};

// Constants
export const MAX_ATTEMPTS_PER_GAME = 2;