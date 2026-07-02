/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc, 
  setDoc, 
  getDoc, 
  getDocFromCache,
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore';
import config from '../firebase-applet-config.json';
import { ActivityLog, KarmaButterflyNFT } from './types';

// Initialize Firebase App using injected configurations
const app = initializeApp(config);

// Initialize Firestore with robust offline persistent cache and long-polling for sandbox environment compatibility
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  experimentalForceLongPolling: true
});

export { db };

// Interface for user sync data
export interface UserKarmaProfile {
  address: string;
  solBalance: number;
  claimableKarma: number;
  stakedAmount: number;
  multiplier: number;
  maxMultiplier: number;
  stakingStartTimestamp: number | null;
  nft: KarmaButterflyNFT | null;
  dailyClaimCooldownEnd: number | null;
  lastClaimedTimestamp?: number | null;
  updatedAt: number;
}

/**
 * Save user profile state securely to Firestore
 */
export async function saveUserProfile(profile: UserKarmaProfile) {
  try {
    const userRef = doc(db, 'users', profile.address);
    await setDoc(userRef, {
      ...profile,
      updatedAt: Date.now()
    }, { merge: true });
    console.log(`Saved user profile for ${profile.address}`);
  } catch (err: any) {
    if (err?.code === 'unavailable' || String(err).includes('offline')) {
      console.warn('Firestore is currently offline. Profile changes are cached locally and will sync when client reconnects.');
    } else {
      console.error('Error saving user profile to Firestore:', err);
    }
  }
}

/**
 * Load user profile from Firestore or return null if not found
 */
export async function loadUserProfile(address: string): Promise<UserKarmaProfile | null> {
  const userRef = doc(db, 'users', address);
  
  // First attempt: try normal getDoc (which contacts server or uses cache if configured)
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserKarmaProfile;
    }
    return null;
  } catch (err: any) {
    // If we're offline, attempt to load directly from local persistence cache
    const isOffline = err?.code === 'unavailable' || String(err).includes('offline');
    if (isOffline) {
      console.warn('Network offline or unavailable during Firestore fetch. Falling back to local persistent cache...');
      try {
        const cachedSnap = await getDocFromCache(userRef);
        if (cachedSnap.exists()) {
          console.log('Successfully retrieved user profile from offline persistent cache.');
          return cachedSnap.data() as UserKarmaProfile;
        }
      } catch (cacheErr) {
        console.warn('Profile not found in local offline cache:', cacheErr);
      }
      return null;
    }
    
    console.error('Error loading user profile from Firestore:', err);
    return null;
  }
}

/**
 * Add an activity log permanently to Firestore
 */
export async function saveActivityLog(log: ActivityLog) {
  try {
    const logRef = doc(db, 'activity_logs', log.id);
    await setDoc(logRef, {
      ...log,
      timestamp: log.timestamp || Date.now()
    });
  } catch (err: any) {
    if (err?.code === 'unavailable' || String(err).includes('offline')) {
      // Squelch offline logs warnings
    } else {
      console.error('Error saving activity log to Firestore:', err);
    }
  }
}

/**
 * Retrieve the latest logs from Firestore
 */
export async function fetchActivityLogs(limitCount = 30): Promise<ActivityLog[]> {
  try {
    const q = query(
      collection(db, 'activity_logs'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    const results: ActivityLog[] = [];
    snap.forEach((doc) => {
      results.push(doc.data() as ActivityLog);
    });
    return results;
  } catch (err) {
    console.error('Error retrieving logs from Firestore, returning local:', err);
    return [];
  }
}
