// Make sure to save this as assets/app.js

// ----------------- FIREBASE CONFIG -----------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Replace with your Firebase project config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ----------------- AUTH FUNCTIONS -----------------
export async function loginUser(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function logoutUser() {
  return await signOut(auth);
}

export async function getUserRole(uid) {
  const docRef = doc(db, "roles", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) return docSnap.data().role;
  return null;
}

export function autoRedirect() {
  auth.onAuthStateChanged(async user => {
    if(user) {
      const role = await getUserRole(user.uid);
      if(role === "admin") {
        window.location.href = "#adminView";
      } else if(role === "teacher") {
        window.location.href = "#teacherView";
      }
    }
  });
}

// ----------------- STUDENT MANAGEMENT -----------------
export async function addStudent(name, belt, id) {
  await setDoc(doc(db, "students", id), { name, belt, id });
}

export async function deleteStudent(id) {
  await deleteDoc(doc(db, "students", id));
}

export async function getAllStudents() {
  const snapshot = await getDocs(collection(db, "students"));
  const students = [];
  snapshot.forEach(doc => {
    students.push(doc.data());
  });
  return students;
}

// ----------------- ATTENDANCE -----------------
export async function markAttendance(studentId) {
  const studentRef = doc(db, "students", studentId);
  const studentSnap = await getDoc(studentRef);

  if(!studentSnap.exists()) return; // student not found

  const studentData = studentSnap.data();
  const today = new Date().toISOString().split("T")[0];

  const attendanceRef = doc(db, "attendance", studentId + "-" + today);
  await setDoc(attendanceRef, {
    studentId: studentData.id,
    name: studentData.name,
    date: today,
    timestamp: serverTimestamp()
  });
}
