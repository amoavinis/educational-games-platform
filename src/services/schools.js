import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
} from "firebase/firestore";

// Get all schools
export const getSchools = async () => {
  const q = query(
    collection(db, "schools"),
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Add new school
export const addSchool = async (schoolData) => {
  const docRef = await addDoc(collection(db, "schools"), {
    ...schoolData,
  });
  return docRef.id;
};

// Update schools
export const updateSchool = async (schoolId, schoolData) => {
  await updateDoc(doc(db, "schools", schoolId), schoolData);
};

// Delete schools
export const deleteSchool = async (schoolId) => {
  await deleteDoc(doc(db, "schools", schoolId));
};
