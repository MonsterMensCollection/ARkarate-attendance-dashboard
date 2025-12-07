/* ---------------------------------------------------------
   🚀 FIREBASE INITIALIZATION
------------------------------------------------------------ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, collection, addDoc, doc, deleteDoc, getDoc, getDocs, setDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
    getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* ---------------------------------------------------------
   🔥 PASTE YOUR FIREBASE CONFIG HERE
------------------------------------------------------------ */
const firebaseConfig = {
  apiKey: "AIzaSyA4OVgeKWvAIklI8hTibj3kT3C9KgBsp2w",
  authDomain: "ar-karate-e580f.firebaseapp.com",
  projectId: "ar-karate-e580f",
  storageBucket: "ar-karate-e580f.firebasestorage.app",
  messagingSenderId: "1057516841712",
  appId: "1:1057516841712:web:53cdd653879cb678df3035",
  measurementId: "G-7K6PYQ1HWB"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

/* ---------------------------------------------------------
   🌐 LOGIN FUNCTION
------------------------------------------------------------ */
export async function loginUser(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

/* ---------------------------------------------------------
   🚪 LOGOUT FUNCTION
------------------------------------------------------------ */
export async function logoutUser() {
    return signOut(auth);
}

/* ---------------------------------------------------------
   🧑‍🏫 CHECK USER ROLE (ADMIN or TEACHER)
------------------------------------------------------------ */
export async function getUserRole(uid) {
    const roleRef = doc(db, "roles", uid);
    const snap = await getDoc(roleRef);

    if (!snap.exists()) return null;
    return snap.data().role; // "admin" or "teacher"
}

/* ---------------------------------------------------------
   🎓 ADD STUDENT
------------------------------------------------------------ */
export async function addStudent(name, belt, id) {
    await setDoc(doc(db, "students", id), {
        name: name,
        belt: belt,
        id: id,
        createdAt: new Date()
    });
}

/* ---------------------------------------------------------
   ❌ DELETE STUDENT
------------------------------------------------------------ */
export async function deleteStudent(id) {
    await deleteDoc(doc(db, "students", id));
}

/* ---------------------------------------------------------
   📋 GET ALL STUDENTS
------------------------------------------------------------ */
export async function getAllStudents() {
    const studentRef = collection(db, "students");
    const snapshot = await getDocs(studentRef);
    
    let list = [];
    snapshot.forEach(doc => list.push(doc.data()));
    return list;
}

/* ---------------------------------------------------------
   🆔 QR CODE TEXT GENERATOR
------------------------------------------------------------ */
export function makeQRText(studentId) {
    return studentId; // keep simple → QR contains only ID
}

/* ---------------------------------------------------------
   ✔️ MARK ATTENDANCE
------------------------------------------------------------ */
export async function markAttendance(studentId) {
    const today = new Date().toISOString().split("T")[0];

    await setDoc(
        doc(db, "attendance", `${studentId}_${today}`),
        {
            studentId: studentId,
            date: today,
            timestamp: new Date()
        }
    );
}

/* ---------------------------------------------------------
   🔐 AUTO REDIRECT BASED ON USER LOGIN + ROLE
------------------------------------------------------------ */
export function autoRedirect() {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = "login.html";
            return;
        }

        const role = await getUserRole(user.uid);

        if (role === "admin") {
            window.location.href = "admin.html";
        } else if (role === "teacher") {
            window.location.href = "teacher.html";
        } else {
            alert("No role assigned!");
        }
    });
}
