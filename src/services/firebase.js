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
  await user.getIdToken(true);
  if (!user) return null;

  const idTokenResult = await user.getIdTokenResult(true); // ← Force refresh
  const role = idTokenResult.claims.role; // 1 or 2
  return role;
}