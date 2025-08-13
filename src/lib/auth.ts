



import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    type UserCredential,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './firebase-client'; // Use client-side auth
import { db } from './firebase-client'; // Use client-side db for writes
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

export type EmailPasswordCredentials = {
    email: string;
    password: string;
}

export type ProfileData = {
  fullName: string;
  artistName?: string;
  primaryRole?: string;
  genres?: string[];
  publisher?: string;
  proSociety?: string;
  ipiNumber?: string;
  profilePhoto?: string;
};


export type SignUpDetails = {
  fullName: string;
  email: string;
  password: string;
  artistName?: string;
  primaryRole?: string;
  genres?: string;
  publisher?: string;
  proSociety?: string;
  ipiNumber?: string;
};


export const signInWithEmail = async ({ email, password }: EmailPasswordCredentials): Promise<User | null> => {
    try {
        const result: UserCredential = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (error) {
        console.error('Error signing in with email and password', error);
        throw error;
    }
};

export const signUpWithEmail = async (details: SignUpDetails): Promise<User | null> => {
    const { email, password, fullName, ...profileData } = details;
    try {
        const result: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        if (user) {
            await updateProfile(user, {
                displayName: fullName
            });
            // Save user to Firestore
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                displayName: fullName,
                email: user.email,
                createdAt: new Date().toISOString(),
                ...profileData, // Save all other optional fields
            });
        }
        return user;
    } catch (error) {
        console.error('Error signing up with email and password', error);
        throw error;
    }
};

export async function updateUserProfile(user: User, profileData: Partial<ProfileData>) {
    const { fullName, profilePhoto, ...firestoreData } = profileData;

    // Update Firebase Auth profile
    await updateProfile(user, {
        displayName: fullName,
        photoURL: profilePhoto,
    });

    // Update Firestore document
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, {
        displayName: fullName,
        photoURL: profilePhoto,
        ...firestoreData
    });
}

const upsertUserInFirestore = async (user: User) => {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
        await setDoc(userDocRef, {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: new Date().toISOString(),
        });
    }
};


export const signInWithGoogle = async (): Promise<User | null> => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Don't await this, let it run in the background
    upsertUserInFirestore(user);

    return user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign Out Error:", error);
    throw error;
  }
};

// Function to get the current user on the server
export const getAuthenticatedUser = (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};
