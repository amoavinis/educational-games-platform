const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.syncUserRoleToClaims = functions.firestore.onDocumentWritten(
    {
      document: "userRoles/{uid}",
      region: "europe-west1",
    },
    async (change, context) => {
      const uid = context.params.uid;
      const afterData = change.after.exists ? change.after.data() : null;

      if (!afterData || !afterData.role) {
        console.log(`No role found for user ${uid}. Skipping claim set.`);
        return;
      }

      const role = afterData.role;
      try {
        await admin.auth().setCustomUserClaims(uid, {role});
        console.log(`Set custom claim 'role: ${role}' for user ${uid}`);
      } catch (error) {
        console.error(`Error setting role for ${uid}:`, error);
      }
    });
