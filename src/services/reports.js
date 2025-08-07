import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { canSaveGameReport } from "./gameAttempts";

async function callFunction(url, method, body) {
  const auth = getAuth();
  const user = auth.currentUser;
  const idToken = await user.getIdToken();

  const res = await fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: body ? JSON.stringify(body) : null,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error ${res.status}: ${text}`);
  }
  return res.json();
}

// Get all reports for current school (user)
export const getReports = async () => {
  const q = query(
    collection(db, "reports"),
    where("schoolId", "==", localStorage.getItem("school"))
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Get reports with related data (students, classes, etc.)
export const getReportsWithDetails = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not authenticated");
  }

  const schoolId = localStorage.getItem("school");

  const response = await callFunction(
    `https://europe-west1-educational-games-platform.cloudfunctions.net/getReportsWithDetails?schoolId=${schoolId}`,
    "GET",
    null
  );
  
  try {
    return response;
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
};

// Add new report
export const addReport = async (reportData) => {
  // Validate that the student can save another attempt for this game
  const canSave = await canSaveGameReport(
    reportData.studentId,
    reportData.gameId,
    reportData.schoolId || localStorage.getItem("school")
  );
  
  if (!canSave) {
    console.warn("Report not saved: Student has already completed maximum attempts for this game");
    throw new Error("Έχετε ήδη ολοκληρώσει τον μέγιστο αριθμό προσπαθειών για αυτό το παιχνίδι.");
  }
  
  const docRef = await addDoc(collection(db, "reports"), {
    schoolId: reportData.schoolId || localStorage.getItem("school"),
    classId: reportData.classId,
    studentId: reportData.studentId,
    gameId: reportData.gameId, // number from 1 to 15
    results: reportData.results, // JSON string
    createdAt: new Date(),
  });
  return docRef.id;
};

// Update report
export const updateReport = async (reportId, reportData) => {
  await updateDoc(doc(db, "reports", reportId), {
    classId: reportData.classId,
    studentId: reportData.studentId,
    gameId: reportData.gameId,
    results: reportData.results,
    updatedAt: new Date(),
  });
};

// Delete report
export const deleteReport = async (reportId) => {
  await deleteDoc(doc(db, "reports", reportId));
};

// Get reports for a specific student
export const getReportsByStudent = async (studentId) => {
  const q = query(
    collection(db, "reports"),
    where("schoolId", "==", localStorage.getItem("school")),
    where("studentId", "==", studentId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Get reports for a specific game
export const getReportsByGame = async (gameNumber) => {
  const q = query(
    collection(db, "reports"),
    where("schoolId", "==", localStorage.getItem("school")),
    where("gameId", "==", gameNumber)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Get reports for a specific class
export const getReportsByClass = async (classId) => {
  const q = query(
    collection(db, "reports"),
    where("schoolId", "==", localStorage.getItem("school")),
    where("classId", "==", classId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Legacy function for backward compatibility
export const sendReport = (payload) => {
  console.log("Legacy sendReport called, use addReport instead:", payload);
  // You can either call addReport here or just log for now
};