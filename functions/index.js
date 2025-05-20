const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.syncUserRoleToClaims = functions.firestore.onDocumentWritten(
    {
      document: "userRoles/{uid}",
      region: "europe-west1",
    },
    async (event) => {
      const uid = event.params.uid;
      const afterData = event.data?.after?.data();

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
    },
);

exports.getStudentsWithClasses = functions.https.onRequest(
    {
      region: "europe-west1",
    },
    async (req, res) => {
      // Handle CORS preflight
      if (req.method === "OPTIONS") {
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Access-Control-Allow-Methods", "GET");
        res.set("Access-Control-Allow-Headers",
            "Authorization, Content-Type");
        res.status(204).send("");
        return;
      }

      // Handle actual request
      res.set("Access-Control-Allow-Origin", "*");

      // Validate Authorization header
      const authHeader = req.headers.authorization;
      const idToken = authHeader?.split("Bearer ")?.[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken?.uid;

      if (!authHeader || !authHeader.startsWith("Bearer ") || !uid) {
        res.status(401)
            .json({error: "Unauthorized: Missing or invalid token"});
        return;
      }

      try {
        const db = admin.firestore();
        const schoolId = req.query.schoolId;

        // Get all classes for the school
        const classesSnapshot = await db.collection("classes")
            .where("schoolId", "==", schoolId)
            .get();

        const classesMap = {};
        classesSnapshot.forEach((doc) => {
          classesMap[doc.id] = doc.data().name;
        });

        // Get students
        const studentsQuery = db.collection("students")
            .where("schoolId", "==", schoolId);

        const studentsSnapshot = await studentsQuery.get();

        // Join data
        const students = [];
        studentsSnapshot.forEach((doc) => {
          const studentData = doc.data();
          students.push({
            id: doc.id,
            name: studentData.name,
            classId: studentData.classId,
            className: classesMap[studentData.classId] || "Unknown Class",
            schoolId: studentData.schoolId,
          });
        });

        res.status(200).json(students);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
      }
    },
);
