const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/* -----------------------------------------------------------
   🕛 1. CREATE DAILY ATTENDANCE DOCUMENT AT MIDNIGHT (IST)
------------------------------------------------------------ */
exports.createDailyAttendance = functions
    .region("asia-south1")  // Mumbai region (closest to India)
    .pubsub.schedule("0 0 * * *") // midnight
    .timeZone("Asia/Kolkata")
    .onRun(async () => {

        const today = new Date().toISOString().split("T")[0];

        await db.collection("dailyAttendance").doc(today).set({
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            locked: false
        });

        console.log("Created attendance for:", today);
        return null;
    });

/* -----------------------------------------------------------
   🔐 2. LOCK YESTERDAY'S ATTENDANCE
------------------------------------------------------------ */
exports.lockYesterdayAttendance = functions
    .region("asia-south1")
    .pubsub.schedule("5 0 * * *") // 12:05 AM
    .timeZone("Asia/Kolkata")
    .onRun(async () => {

        const d = new Date();
        d.setDate(d.getDate() - 1);

        const yDay = d.toISOString().split("T")[0];

        await db.collection("dailyAttendance").doc(yDay).update({
            locked: true,
            lockedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log("Locked attendance for:", yDay);
        return null;
    });

/* -----------------------------------------------------------
   ✔ OPTIONAL: CLEANUP OLD DATA (every week)
------------------------------------------------------------ */
exports.cleanupOldAttendance = functions
    .region("asia-south1")
    .pubsub.schedule("0 3 * * 0") // every Sunday 3 AM
    .timeZone("Asia/Kolkata")
    .onRun(async () => {

        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 45); // keep 45 days

        const cutoffDate = cutoff.toISOString().split("T")[0];

        const snapshot = await db.collection("dailyAttendance").get();

        let batch = db.batch();
        snapshot.forEach(doc => {
            if (doc.id < cutoffDate) {
                batch.delete(doc.ref);
            }
        });

        await batch.commit();

        console.log("Cleaned old attendance before:", cutoffDate);
        return null;
    });
