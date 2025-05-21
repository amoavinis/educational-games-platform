import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "../config";
import { getFirestore } from "firebase/firestore";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export default app;
export const db = getFirestore(app);

export async function getUserRoleFromClaims() {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }

  await user.getIdToken(true);
  const idTokenResult = await user.getIdTokenResult(true); // ← Force refresh
  const role = idTokenResult.claims.role; // 1 or 2
  return role;
}

export async function getUserName() {
  const auth1 = getAuth(app);
  const user = auth1.currentUser;
  console.log(user)
  if (!user) {
    return null;
  } else {
    console.log(user);

    return user;
  }
}
