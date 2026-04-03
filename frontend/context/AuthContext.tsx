"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirebaseAuth, getGoogleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { syncUserProfile } from "@/lib/history";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  configured: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingState, setLoadingState] = useState(true);
  const configured = isFirebaseConfigured();
  const loading = configured ? loadingState : false;

  useEffect(() => {
    if (!configured) return;
    try {
      const auth = getFirebaseAuth();
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setLoadingState(false);
      });
      return () => unsubscribe();
    } catch (err) {
      console.error("Firebase auth init error:", err);
      setTimeout(() => setLoadingState(false), 0);
    }
  }, [configured]);

  const signInWithGoogle = useCallback(async () => {
    if (!configured) throw new Error("Firebase not configured");
    const auth = getFirebaseAuth();
    const provider = getGoogleProvider();
    await signInWithPopup(auth, provider);
  }, [configured]);

  const signOut = useCallback(async () => {
    if (!configured) return;
    try {
      const auth = getFirebaseAuth();
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  }, [configured]);

  useEffect(() => {
    if (!configured || !user) return;

    void syncUserProfile({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    }).catch((error) => {
      console.error("User sync error:", error);
    });
  }, [configured, user]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const payload = {
      type: "TRUTHGUARD_AUTH_STATE",
      user: user
        ? {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          }
        : null,
    };

    window.postMessage(payload, window.location.origin);
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(payload, "*");
    }
    if (window.opener) {
      window.opener.postMessage(payload, "*");
    }
  }, [user]);

  useEffect(() => {
    if (!configured || !user) return;

    const timeoutMs = 5 * 60 * 1000;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void signOut();
      }, timeoutMs);
    };

    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];

    events.forEach((eventName) => window.addEventListener(eventName, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach((eventName) =>
        window.removeEventListener(eventName, resetTimer)
      );
    };
  }, [configured, user, signOut]);

  return (
    <AuthContext.Provider value={{ user, loading, configured, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
