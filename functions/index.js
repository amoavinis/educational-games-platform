const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();

const app = express();

app.use(cors({origin: true}));
app.use(express.json());

const bucket = admin.storage().bucket();

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
        res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
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
            gender: studentData.gender,
            dateOfBirth: studentData.dateOfBirth,
            diagnosis: studentData.diagnosis,
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

/**
 * checkAdmin
 * @param {object} req - The HTTP request
 * @return {Promise<boolean>} boolean
 */
async function checkAdmin(req) {
  const authHeader = req.headers.authorization;
  const idToken = authHeader?.split("Bearer ")?.[1];
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  const uid = decodedToken?.uid;
  const role = decodedToken?.role;

  return authHeader && authHeader.startsWith("Bearer ") && uid && role === 1;
}

exports.getUsers = functions.https.onRequest({
  region: "europe-west1",
},
async (req, res) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.set("Access-Control-Allow-Headers",
        "Authorization, Content-Type");
    res.status(204).send("");
    return;
  }

  // Handle actual request
  res.set("Access-Control-Allow-Origin", "*");

  if (!checkAdmin(req)) {
    res.status(401)
        .json({error:
          "Unauthorized: Missing or invalid token or invalid role"});
    return;
  }

  try {
    // Get users
    const snapshot = await admin.firestore().collection("schools").get();
    const users = snapshot.docs.map((doc) => ({uid: doc.id, ...doc.data()}));

    res.status(200).json(users);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

exports.createUser = functions.https.onRequest({
  region: "europe-west1",
},
async (req, res) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS, POST");
    res.set("Access-Control-Allow-Headers",
        "Authorization, Content-Type");
    res.status(204).send("");
    return;
  }

  // Handle actual request
  res.set("Access-Control-Allow-Origin", "*");

  if (!checkAdmin(req)) {
    res.status(401)
        .json({error:
          "Unauthorized: Missing or invalid token or invalid role"});
    return;
  }

  try {
    // Create user
    const {email, password, name} = req.body;
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: false,
      disabled: false,
    });

    // Set claims and create document
    await Promise.all([
      admin.auth().setCustomUserClaims(userRecord.uid, {
        role: 2,
      }),
      admin.firestore().collection("schools").doc(userRecord.uid).set({
        email,
        name,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }),
    ]);

    res.status(200).json({uid: userRecord.uid});
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
},
);

exports.updateUser = functions.https.onRequest({
  region: "europe-west1",
},
async (req, res) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS, PUT");
    res.set("Access-Control-Allow-Headers",
        "Authorization, Content-Type");
    res.status(204).send("");
    return;
  }

  // Handle actual request
  res.set("Access-Control-Allow-Origin", "*");

  if (!checkAdmin(req)) {
    res.status(401)
        .json({error:
          "Unauthorized: Missing or invalid token or invalid role"});
    return;
  }

  // Only allow PUT requests
  if (req.method !== "PUT") {
    res.status(405).json({error: "Method Not Allowed"});
    return;
  }

  try {
    // Extract UID from URL
    const id = req.path.split("/").pop(); // Gets the last segment of the URL
    if (!id) {
      res.status(400).json({error: "User ID is required"});
      return;
    }

    // Process update
    const {email, password, name} = req.body;
    const updateData = {email, name};
    if (password) {
      updateData.password = password;
    }

    await Promise.all([
      admin.auth().updateUser(id, updateData),
      admin.auth().setCustomUserClaims(id, {
        role: 2,
      }),
      admin.firestore().collection("schools").doc(id).update({
        name: name,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }),
    ]);

    res.status(200).json({success: true});
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
},
);

exports.deleteUser = functions.https.onRequest({
  region: "europe-west1",
},
async (req, res) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS, DELETE");
    res.set("Access-Control-Allow-Headers",
        "Authorization, Content-Type");
    res.status(204).send("");
    return;
  }

  // Handle actual request
  res.set("Access-Control-Allow-Origin", "*");

  if (!checkAdmin(req)) {
    res.status(401)
        .json({error:
          "Unauthorized: Missing or invalid token or invalid role"});
    return;
  }

  // Only allow DELETE requests
  if (req.method !== "DELETE") {
    res.status(405).json({error: "Method Not Allowed"});
    return;
  }

  try {
    // Extract UID from URL
    const id = req.path.split("/").pop(); // Gets the last segment of the URL
    if (!id) {
      res.status(400).json({error: "User ID is required"});
      return;
    }


    await Promise.all([
      admin.auth().deleteUser(id),
      admin.auth().setCustomUserClaims(id, null),
      admin.firestore().collection("schools").doc(id).delete(),
    ]);

    res.status(200).json({success: true});
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
},
);

exports.getReportsWithDetails = functions.https.onRequest(
    {
      region: "europe-west1",
    },
    async (req, res) => {
      // Handle CORS preflight
      if (req.method === "OPTIONS") {
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
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

        // Get classes, students, and current school for join with reports
        const [classesSnapshot, schoolDoc, studentsSnapshot] =
          await Promise.all([
            db.collection("classes").where("schoolId", "==", schoolId).get(),
            db.collection("schools").doc(schoolId).get(),
            db.collection("students").where("schoolId", "==", schoolId).get(),
          ]);

        const classesMap = {};
        classesSnapshot.forEach((doc) => {
          classesMap[doc.id] = doc.data().name;
        });

        const schoolsMap = {};
        if (schoolDoc.exists) {
          schoolsMap[schoolDoc.id] = schoolDoc.data().name;
        }

        const studentsMap = {};
        studentsSnapshot.forEach((doc) => {
          const studentData = doc.data();
          studentsMap[doc.id] = {
            gender: studentData.gender,
            dateOfBirth: studentData.dateOfBirth,
            diagnosis: studentData.diagnosis,
          };
        });

        // Get reports
        const reportsQuery = db.collection("reports")
            .where("schoolId", "==", schoolId);

        const reportsSnapshot = await reportsQuery.get();

        // Join data
        const reports = [];
        reportsSnapshot.forEach((doc) => {
          const reportData = doc.data();
          const studentData = studentsMap[reportData.studentId] || {};
          reports.push({
            id: doc.id,
            schoolId: reportData.schoolId,
            schoolName: schoolsMap[reportData.schoolId],
            classId: reportData.classId,
            className: classesMap[reportData.classId],
            studentId: reportData.studentId,
            studentGender: studentData.gender,
            studentDateOfBirth: studentData.dateOfBirth,
            studentDiagnosis: studentData.diagnosis,
            gameId: reportData.gameId,
            results: reportData.results,
            createdAt: reportData.createdAt,
            updatedAt: reportData.updatedAt,
          });
        });

        res.status(200).json(reports);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
      }
    },
);

exports.downloadFile = functions.https.onRequest(
    {
      region: "europe-west1",
    },
    async (req, res) => {
      // Set CORS headers
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "GET");
      res.set("Access-Control-Allow-Headers", "Content-Type");

      try {
        // Get file path from query parameter
        const filePath = req.query.filePath;
        if (!filePath) {
          return res.status(400).send("File path is required");
        }

        // Create file reference
        const file = bucket.file(`audio-recordings/${filePath}`);

        // Verify file exists
        const [exists] = await file.exists();
        if (!exists) {
          return res.status(404).send("File not found");
        }

        // Get file metadata for filename and content type
        const [metadata] = await file.getMetadata();

        // Set headers to force download
        res.set("Content-Type",
            metadata.contentType || "application/octet-stream");
        res.set(
            "Content-Disposition",
            // eslint-disable-next-line max-len
            `attachment; filename="${filePath.replace(/^audio-recordings_\//, "")}"`,
        );

        // Stream the file to the response
        file
            .createReadStream()
            .on("error", (error) => {
              console.error("Stream error:", error);
              res.status(500).end();
            })
            .pipe(res);
      } catch (error) {
        console.error("Download error:", error);
        res.status(500).send("Download failed");
      }
    },
);
