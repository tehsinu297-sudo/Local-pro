import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA2qFFGnMJH1CD5gSrVE4WJM7RlyY0GEGE",
  authDomain: "earnpro-81a87.firebaseapp.com",
  projectId: "earnpro-81a87",
  storageBucket: "earnpro-81a87.firebasestorage.app",
  messagingSenderId: "870626732031",
  appId: "1:870626732031:web:b50ee2710c221a4b9769ca",
  measurementId: "G-WNDQF52FJD",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

isSupported().then((supported) => {
  if (supported) getAnalytics(app);
});

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}
