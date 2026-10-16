import { ref, computed } from 'vue';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';
import { auth } from '@/services/firebase';

export type UserRole = 'student' | 'teacher';

const user = ref<User | null>(null);
const role = ref<UserRole | null>((localStorage.getItem('user_role') as UserRole) || null);
const authReady = ref(false);
const authLoading = ref(false);
const authError = ref('');

let listenerStarted = false;

function persistSession(u: User | null, r: UserRole | null) {
  if (u) {
    localStorage.setItem('user_auth', JSON.stringify({ uid: u.uid, email: u.email }));
    localStorage.setItem('user_name', u.displayName || u.email?.split('@')[0] || 'Learner');
  } else {
    localStorage.removeItem('user_auth');
    localStorage.removeItem('user_name');
  }
  if (r) localStorage.setItem('user_role', r);
}

export function initAuthListener() {
  if (listenerStarted) return;
  listenerStarted = true;
  onAuthStateChanged(auth, (u) => {
    user.value = u;
    if (!u) {
      localStorage.removeItem('user_auth');
    } else if (!localStorage.getItem('user_role')) {
      // Fallback role inference for Google users without explicit choice
      const inferred: UserRole = (u.displayName || u.email || '').toLowerCase().includes('teacher')
        ? 'teacher'
        : 'student';
      role.value = inferred;
      persistSession(u, inferred);
    }
    authReady.value = true;
  });
}

function inferRole(email: string, fallback: UserRole = 'student'): UserRole {
  const saved = localStorage.getItem('user_role') as UserRole | null;
  if (saved === 'student' || saved === 'teacher') return saved;
  return email.toLowerCase().includes('teacher') ? 'teacher' : fallback;
}

export function useAuth() {
  const isAuthenticated = computed(() => !!user.value || !!localStorage.getItem('user_auth'));

  const signUp = async (name: string, email: string, password: string, chosenRole: UserRole) => {
    authLoading.value = true;
    authError.value = '';
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
      user.value = { ...cred.user, displayName: name.trim() || cred.user.displayName } as User;
      role.value = chosenRole;
      persistSession(cred.user, chosenRole);
      localStorage.setItem('user_name', name.trim() || email.split('@')[0]);
      return role.value;
    } catch (e: any) {
      authError.value = friendlyError(e?.code || e?.message);
      throw e;
    } finally {
      authLoading.value = false;
    }
  };

  const signIn = async (email: string, password: string) => {
    authLoading.value = true;
    authError.value = '';
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      user.value = cred.user;
      const r = inferRole(email);
      role.value = r;
      persistSession(cred.user, r);
      return r;
    } catch (e: any) {
      authError.value = friendlyError(e?.code || e?.message);
      throw e;
    } finally {
      authLoading.value = false;
    }
  };

  const signInWithGoogle = async (chosenRole: UserRole = 'student') => {
    authLoading.value = true;
    authError.value = '';
    try {
      if (Capacitor.isNativePlatform()) {
        const result = await FirebaseAuthentication.signInWithGoogle();
        const idToken = result.credential?.idToken;
        if (!idToken) throw new Error('No Google credential returned');
        const fbCred = GoogleAuthProvider.credential(idToken);
        const userCred = await signInWithCredential(auth, fbCred);
        user.value = userCred.user;
      } else {
        const provider = new GoogleAuthProvider();
        const userCred = await signInWithPopup(auth, provider);
        user.value = userCred.user;
      }
      const email = user.value?.email || '';
      const r = (localStorage.getItem('pending_role') as UserRole) || inferRole(email, chosenRole);
      localStorage.removeItem('pending_role');
      role.value = r;
      persistSession(user.value, r);
      return r;
    } catch (e: any) {
      // User cancelled native sheet — don't surface as error
      if (e?.message?.toLowerCase?.().includes('cancel')) return null;
      authError.value = friendlyError(e?.code || e?.message);
      throw e;
    } finally {
      authLoading.value = false;
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
    } catch { /* noop */ }
    try {
      await FirebaseAuthentication.signOut();
    } catch { /* web: plugin not available */ }
    user.value = null;
    role.value = null;
    localStorage.removeItem('user_auth');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
  };

  return { user, role, authReady, authLoading, authError, isAuthenticated, signUp, signIn, signInWithGoogle, signOut };
}

function friendlyError(code: string): string {
  const c = String(code || '');
  if (c.includes('auth/email-already-in-use')) return 'This email is already registered. Try signing in.';
  if (c.includes('auth/invalid-email')) return 'Please enter a valid email address.';
  if (c.includes('auth/weak-password')) return 'Password should be at least 6 characters.';
  if (c.includes('auth/user-not-found') || c.includes('auth/wrong-password') || c.includes('auth/invalid-credential'))
    return 'Incorrect email or password. Please try again.';
  if (c.includes('auth/popup-closed')) return 'Google sign-in was closed before finishing.';
  if (c.includes('auth/operation-not-allowed'))
    return 'Email/password sign-in is disabled — enable it in Firebase Console > Authentication.';
  if (c.includes('auth/api-key-not-valid')) return 'Firebase API key invalid — add a Web app in Firebase Console and update .env.';
  return c.replace('Firebase: ', '').slice(0, 160) || 'Something went wrong. Please try again.';
}
