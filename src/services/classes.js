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

export const getClasses = async () => {
  const schoolId = localStorage.getItem("school");

  let q = query(collection(db, "classes"), where("schoolId", "==", schoolId));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const addClass = async (classData) => {
  const schoolId = localStorage.getItem("school");
  const docRef = await addDoc(collection(db, "classes"), {
    ...classData,
    schoolId,
  });
  return docRef.id;
};

export const updateClass = async (classId, classData) => {
  await updateDoc(doc(db, "classes", classId), classData);
};

export const deleteClass = async (classId) => {
  await deleteDoc(doc(db, "classes", classId));
};
