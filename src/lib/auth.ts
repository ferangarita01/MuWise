
import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    type UserCredential
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export type EmailPasswordCredentials = {
    email: string;
    password: string;
}

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

export const signInWithGoogle = async (): Promise<User | null> => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check if user exists in Firestore, if not, create them
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

    return user;
  } catch (error) {
    if (error instanceof Error) {
        const errorCode = (error as any).code;
        const errorMessage = error.message;
        const email = (error as any).customData?.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.error({ errorCode, errorMessage, email, credential });
    }
    throw error;
  }
};
