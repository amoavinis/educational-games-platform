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

// Get all students for current school (user)
export const getStudents = async () => {
  const q = query(
    collection(db, "students"),
    where("schoolId", "==", localStorage.getItem("school"))
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getStudentsWithClasses = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not authenticated");
  }

  const schoolId = localStorage.getItem("school");

  const response = await callFunction(
    `https://getstudentswithclasses-v5j5fe6n2q-ew.a.run.app?schoolId=${schoolId}`,
    "GET",
    null
  );
  
  try {
    return response;
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};

// Add new student
export const addStudent = async (studentData) => {
  const docRef = await addDoc(collection(db, "students"), {
    name: studentData.name,
    classId: studentData.classId,
    gender: studentData.gender,
    dateOfBirth: studentData.dateOfBirth,
    diagnosis: studentData.diagnosis,
    schoolId: localStorage.getItem("school"),
  });
  return docRef.id;
};

// Update student
export const updateStudent = async (studentId, studentData) => {
  await updateDoc(doc(db, "students", studentId), {
    name: studentData.name,
    classId: studentData.classId,
    gender: studentData.gender,
    dateOfBirth: studentData.dateOfBirth,
    diagnosis: studentData.diagnosis,
  });
};

// Delete student
export const deleteStudent = async (studentId) => {
  await deleteDoc(doc(db, "students", studentId));
};
