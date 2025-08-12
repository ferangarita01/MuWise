
import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { auth } from './firebase';

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    // This gives you a Google Access Token. You can use it to access the Google API.
    // const credential = GoogleAuthProvider.credentialFromResult(result);
    // const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    return user;
  } catch (error) {
    // Handle Errors here.
    if (error instanceof Error) {
        const errorCode = (error as any).code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = (error as any).customData?.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.error({ errorCode, errorMessage, email, credential });
    }
    return null;
  }
};
