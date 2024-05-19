import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";


const firebaseConfig = {
  apiKey: "AIzaSyD7bqbBYF6vswJWTLG9TZP4du5fWwknP5g",
  authDomain: "auth-development-e8593.firebaseapp.com",
  projectId: "auth-development-e8593",
  storageBucket: "auth-development-e8593.appspot.com",
  messagingSenderId: "609545899114",
  appId: "1:609545899114:web:b69ddea4f37095ddc88e13"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Cloud Functions
const functions = getFunctions(app);

// Function to add admin role to a user
export const addAdminRole = async (email) => {
  const addRoleFn = httpsCallable(functions, 'addAdminRole');
  try {
    const result = await addRoleFn({ email });
    return result.data;
  } catch (error) {
    throw error;
  }
};