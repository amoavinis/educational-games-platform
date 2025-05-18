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
import { auth } from "./firebase";

// Get all students for current school (user)
export const getStudents = async () => {
  const q = query(
    collection(db, "students"),
    where("schoolId", "==", auth.currentUser.uid)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Add new student
export const addStudent = async (studentData) => {
  const docRef = await addDoc(collection(db, "students"), {
    ...studentData,
    schoolId: auth.currentUser.uid,
  });
  return docRef.id;
};

// Update student
export const updateStudent = async (studentId, studentData) => {
  await updateDoc(doc(db, "students", studentId), studentData);
};

// Delete student
export const deleteStudent = async (studentId) => {
  await deleteDoc(doc(db, "students", studentId));
};
