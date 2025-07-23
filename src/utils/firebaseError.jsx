// utils/firebaseError.js
export function getFirebaseAuthErrorMessage(code) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password. Please try again.";

    case "auth/email-already-in-use":
      return "This email is already registered. Try logging in.";

    case "auth/too-many-requests":
      return "Too many attempts. Please wait a while and try again.";

    case "auth/invalid-email":
      return "The email address is not valid.";

    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";

    case "auth/user-disabled":
      return "This account has been disabled. Contact support.";

    default:
      return "Something went wrong. Please try again.";
  }
}
