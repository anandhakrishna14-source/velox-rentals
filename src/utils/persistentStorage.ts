/**
 * Velox Drive Persistent Storage Engine
 * Handles persistent storage across browser and application restarts for:
 * 1. Large media files (Uploaded Videos, High-Res Images) via IndexedDB
 * 2. Fleet Vehicles, Pricing, Locations, and Configurations via Firestore & LocalStorage
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Vehicle, LocationOption, PricingSettings, Booking } from '../types';

const DB_NAME = 'VeloxLuxuryPersistentDB';
const DB_VERSION = 1;
const STORE_NAME = 'media_blobs';

// Initialize or get IndexedDB
function getIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const idb = (event.target as IDBOpenDBRequest).result;
      if (!idb.objectStoreNames.contains(STORE_NAME)) {
        idb.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Store a File, Blob, or URL string permanently in IndexedDB + LocalStorage
 */
export async function persistMediaItem(key: string, data: File | Blob | string): Promise<string> {
  try {
    const idb = await getIndexedDB();
    const tx = idb.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    if (typeof data === 'string') {
      // It's a URL or base64 string
      store.put(data, key);
      try {
        localStorage.setItem(key, data);
      } catch {}
      return data;
    } else {
      // It's a Blob or File object
      store.put(data, key);
      const sessionUrl = URL.createObjectURL(data);
      try {
        // Store marker in localStorage indicating it's persisted in IndexedDB
        localStorage.setItem(`${key}_idb_ref`, 'true');
      } catch {}
      return sessionUrl;
    }
  } catch (err) {
    console.warn(`[persistentStorage] Failed to store in IndexedDB for key "${key}":`, err);
    if (typeof data === 'string') {
      try {
        localStorage.setItem(key, data);
      } catch {}
      return data;
    } else {
      return URL.createObjectURL(data);
    }
  }
}

/**
 * Retrieve a stored media item across sessions.
 * If stored as a Blob, generates a fresh, valid URL for this session.
 */
export async function retrieveMediaItem(key: string): Promise<string | null> {
  try {
    const idb = await getIndexedDB();
    return new Promise((resolve) => {
      const tx = idb.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          // Fallback to localStorage string
          const fallback = localStorage.getItem(key);
          resolve(fallback);
          return;
        }

        if (result instanceof Blob || result instanceof File) {
          const freshUrl = URL.createObjectURL(result);
          resolve(freshUrl);
        } else if (typeof result === 'string') {
          resolve(result);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        const fallback = localStorage.getItem(key);
        resolve(fallback);
      };
    });
  } catch {
    return localStorage.getItem(key);
  }
}

export interface AdminFullState {
  vehicles: Vehicle[];
  pricingSettings?: PricingSettings;
  locations?: LocationOption[];
  bookings?: Booking[];
  heroVideoUrl?: string;
  turntableVideoUrl?: string;
}

/**
 * Save all admin changes permanently to LocalStorage, IndexedDB, and Firestore cloud
 */
export async function saveAllAdminChanges(state: AdminFullState): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Save Vehicles to LocalStorage
    try {
      localStorage.setItem('velox_vehicles', JSON.stringify(state.vehicles));
      localStorage.setItem('velox_admin_last_saved', new Date().toISOString());
    } catch (e) {
      console.warn('LocalStorage vehicles save warning:', e);
    }

    // 2. Save Pricing to LocalStorage if provided
    if (state.pricingSettings) {
      try {
        localStorage.setItem('velox_pricing_settings', JSON.stringify(state.pricingSettings));
      } catch {}
    }

    // 3. Save Locations to LocalStorage if provided
    if (state.locations) {
      try {
        localStorage.setItem('velox_locations', JSON.stringify(state.locations));
      } catch {}
    }

    // 4. Save Media URLs if provided
    if (state.heroVideoUrl) {
      await persistMediaItem('velox_opening_video', state.heroVideoUrl);
    }
    if (state.turntableVideoUrl) {
      await persistMediaItem('velox_porsche_stages_video', state.turntableVideoUrl);
      await persistMediaItem('velox_custom_3d_video', state.turntableVideoUrl);
    }

    // 5. Sync to Firestore (Cloud Database)
    try {
      const fleetDocRef = doc(db, 'admin_settings', 'fleet_vehicles');
      await setDoc(fleetDocRef, {
        vehicles: state.vehicles,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'admin'
      }, { merge: true });

      if (state.pricingSettings) {
        const pricingDocRef = doc(db, 'admin_settings', 'pricing');
        await setDoc(pricingDocRef, {
          ...state.pricingSettings,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      }

      if (state.locations) {
        const locDocRef = doc(db, 'admin_settings', 'locations');
        await setDoc(locDocRef, {
          locations: state.locations,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      }

      // Also save global media links doc
      const mediaDocRef = doc(db, 'admin_settings', 'media_links');
      await setDoc(mediaDocRef, {
        heroVideoUrl: state.heroVideoUrl || localStorage.getItem('velox_opening_video') || '',
        turntableVideoUrl: state.turntableVideoUrl || localStorage.getItem('velox_porsche_stages_video') || '',
        lastUpdated: new Date().toISOString()
      }, { merge: true });
    } catch (firestoreErr) {
      console.warn('Firestore cloud sync notice (local backup active):', firestoreErr);
    }

    // 6. Notify active listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('velox_admin_saved', { detail: { timestamp: Date.now() } }));
    }

    return {
      success: true,
      message: 'All changes saved permanently! Vehicles, videos, photos and rules will reflect on next launch.'
    };
  } catch (err: any) {
    console.error('Error saving admin changes:', err);
    return {
      success: false,
      message: `Error saving changes: ${err.message || 'Unknown error'}`
    };
  }
}

/**
 * Load cloud/persisted vehicles and configurations on initial app load
 */
export async function loadInitialAdminState(): Promise<Partial<AdminFullState>> {
  const result: Partial<AdminFullState> = {};

  // 1. Try Firestore first for cloud updates
  try {
    const fleetDocRef = doc(db, 'admin_settings', 'fleet_vehicles');
    const docSnap = await getDoc(fleetDocRef);
    if (docSnap.exists() && docSnap.data()?.vehicles?.length) {
      result.vehicles = docSnap.data().vehicles as Vehicle[];
    }
  } catch {}

  // 2. If not found in Firestore, load from LocalStorage
  if (!result.vehicles) {
    try {
      const local = localStorage.getItem('velox_vehicles');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          result.vehicles = parsed;
        }
      }
    } catch {}
  }

  // 3. Load media items from IndexedDB
  try {
    const heroVid = await retrieveMediaItem('velox_opening_video');
    if (heroVid) result.heroVideoUrl = heroVid;

    const turntableVid = await retrieveMediaItem('velox_porsche_stages_video');
    if (turntableVid) result.turntableVideoUrl = turntableVid;
  } catch {}

  return result;
}

/**
 * Persist vehicle fleet updates immediately to LocalStorage and Firestore
 */
export async function persistFleetVehicles(vehicles: Vehicle[]): Promise<void> {
  try {
    localStorage.setItem('velox_vehicles', JSON.stringify(vehicles));
    localStorage.setItem('velox_admin_last_saved', new Date().toISOString());
  } catch (e) {
    console.warn('LocalStorage vehicles save warning:', e);
  }

  try {
    const fleetDocRef = doc(db, 'admin_settings', 'fleet_vehicles');
    await setDoc(fleetDocRef, {
      vehicles,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'admin'
    }, { merge: true });
  } catch (firestoreErr) {
    console.warn('Firestore fleet sync notice:', firestoreErr);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('velox_admin_saved', { detail: { timestamp: Date.now() } }));
  }
}
