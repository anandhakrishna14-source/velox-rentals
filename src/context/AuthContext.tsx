import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  deleteDoc,
  addDoc
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { Booking } from '../types';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInAsDemoClient: () => Promise<void>;
  signOut: () => Promise<void>;
  userBookings: Booking[];
  saveBookingToFirestore: (booking: Booking) => Promise<void>;
  userFavorites: string[];
  toggleFirestoreFavorite: (vehicleId: string) => Promise<void>;
  saveReviewToFirestore: (vehicleId: string, rating: number, comment: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);

  // Sync Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              id: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'VIP Guest',
              photoURL: currentUser.photoURL || '',
              role: currentUser.email?.includes('admin') ? 'admin' : 'customer',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        setUserProfile(null);
        setUserBookings([]);
        setUserFavorites([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time Firestore synchronization for user bookings
  useEffect(() => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'bookings'),
        where('userId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const bookingsData: Booking[] = [];
        snapshot.forEach((doc) => {
          bookingsData.push(doc.data() as Booking);
        });
        if (bookingsData.length > 0) {
          setUserBookings(bookingsData);
        }
      }, (err) => {
        console.warn('Bookings listener note:', err.message);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Bookings query setup:', e);
    }
  }, [user]);

  // Real-time Firestore synchronization for user favorites
  useEffect(() => {
    if (!user) return;

    try {
      const favsRef = collection(db, 'users', user.uid, 'favorites');
      const unsubscribe = onSnapshot(favsRef, (snapshot) => {
        const favIds: string[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.vehicleId) favIds.push(data.vehicleId);
        });
        setUserFavorites(favIds);
      }, (err) => {
        console.warn('Favorites listener note:', err.message);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Favorites query setup:', e);
    }
  }, [user]);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const userDocRef = doc(db, 'users', result.user.uid);
        const docSnap = await getDoc(userDocRef);
        if (!docSnap.exists()) {
          const newProfile: UserProfile = {
            id: result.user.uid,
            email: result.user.email || '',
            displayName: result.user.displayName || 'VIP Guest',
            photoURL: result.user.photoURL || '',
            role: result.user.email?.includes('admin') ? 'admin' : 'customer',
            createdAt: new Date().toISOString()
          };
          await setDoc(userDocRef, newProfile);
          setUserProfile(newProfile);
        }
      }
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await updateProfile(cred.user, { displayName: name });
      const newProfile: UserProfile = {
        id: cred.user.uid,
        email: cred.user.email || '',
        displayName: name,
        photoURL: '',
        role: 'customer',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      setUserProfile(newProfile);
    }
  };

  const signInAsDemoClient = async () => {
    try {
      try {
        await signInWithEmailAndPassword(auth, 'vip.client@veloxdrive.com', 'VeloxVIP2025!');
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials') {
          const cred = await createUserWithEmailAndPassword(auth, 'vip.client@veloxdrive.com', 'VeloxVIP2025!');
          if (cred.user) {
            await updateProfile(cred.user, { displayName: 'Adrian Vance (VIP Member)' });
            const newProfile: UserProfile = {
              id: cred.user.uid,
              email: 'vip.client@veloxdrive.com',
              displayName: 'Adrian Vance (VIP Member)',
              photoURL: '',
              role: 'customer',
              createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'users', cred.user.uid), newProfile);
            setUserProfile(newProfile);
          }
        } else {
          throw err;
        }
      }
    } catch (e: any) {
      console.warn('Demo client fallback session active:', e);
      // Resilient fallback session if external network is restricted
      const fallbackUser = {
        uid: 'vip-demo-client-uid',
        email: 'vip.client@veloxdrive.com',
        displayName: 'Adrian Vance (VIP Member)',
        photoURL: ''
      } as any;
      setUser(fallbackUser);
      setUserProfile({
        id: fallbackUser.uid,
        email: fallbackUser.email,
        displayName: fallbackUser.displayName,
        photoURL: '',
        role: 'customer',
        createdAt: new Date().toISOString()
      });
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {}
    setUser(null);
    setUserProfile(null);
  };

  const saveBookingToFirestore = async (booking: Booking) => {
    try {
      const docRef = doc(db, 'bookings', booking.id);
      await setDoc(docRef, {
        ...booking,
        userId: user ? user.uid : 'guest-session',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Firestore save booking error:', err);
    }
  };

  const toggleFirestoreFavorite = async (vehicleId: string) => {
    if (!user) return;
    try {
      const favDocRef = doc(db, 'users', user.uid, 'favorites', vehicleId);
      if (userFavorites.includes(vehicleId)) {
        await deleteDoc(favDocRef);
      } else {
        await setDoc(favDocRef, {
          id: vehicleId,
          userId: user.uid,
          vehicleId,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Firestore toggle favorite error:', err);
    }
  };

  const saveReviewToFirestore = async (vehicleId: string, rating: number, comment: string) => {
    if (!user) return;
    try {
      const reviewId = `rev-${Date.now()}`;
      await setDoc(doc(db, 'reviews', reviewId), {
        id: reviewId,
        vehicleId,
        userId: user.uid,
        userName: userProfile?.displayName || user.displayName || 'Verified Driver',
        rating,
        comment,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Firestore save review error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInAsDemoClient,
        signOut,
        userBookings,
        saveBookingToFirestore,
        userFavorites,
        toggleFirestoreFavorite,
        saveReviewToFirestore
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
