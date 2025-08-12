
import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    type UserCredential
} from 'firebase/auth';
import { auth } from './firebase';

const provider = new GoogleAuthProvider();

export type EmailPasswordCredentials = {
    email: string;
    password: string;
}

export type SignUpDetails = EmailPasswordCredentials & {
    fullName: string;
}

export const signInWithEmail = async ({ email, password }: EmailPasswordCredentials): Promise<User | null> => {
    try {
        const result: UserCredential = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (error) {
        console.error('Error signing in with email and password', error);
        throw error;
    }
};

export const signUpWithEmail = async ({ email, password, fullName }: SignUpDetails): Promise<User | null> => {
    try {
        const result: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (result.user) {
            await updateProfile(result.user, {
                displayName: fullName
            });
        }
        return result.user;
    } catch (error) {
        console.error('Error signing up with email and password', error);
        throw error;
    }
};

export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
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
