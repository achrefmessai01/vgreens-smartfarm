import { Redirect } from 'expo-router';

/**
 * Catches the Clerk Expo OAuth deep-link redirect
 * (`<scheme>://oauth-native-callback?...`). The Clerk SDK has already
 * captured the session params from the URL by the time this route renders;
 * the only thing left to do is bounce the user back into the app so Expo
 * Router stops showing the "Unmatched Route" screen.
 *
 * Auth state is decided by the (auth) and (protected) layouts — sending the
 * user to "/" lets those layouts route them to the right place based on
 * their session.
 */
export default function OAuthNativeCallback() {
  return <Redirect href="/" />;
}
