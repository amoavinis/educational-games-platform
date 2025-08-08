import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "../config";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export default app;
export const db = getFirestore(app);
export const storage = getStorage(app);

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
