import { useEffect, useState } from 'react';

/**
 * Stripped down syncManager. Projector Mode has been removed.
 * setupStoreSync is now a no-op.
 */
export function setupStoreSync(storeName, useStore) {
    // No-op
    return null;
}

/**
 * A custom hook that previously synced state across windows.
 * Now it just acts as a wrapper around useState, so we don't have to refactor
 * every component that imports useSyncState.
 * 
 * @param {string} key Unique identifier (ignored now)
 * @param {any} initialValue Initial state value
 * @returns [state, setState] Like useState
 */
export function useSyncState(key, initialValue) {
    return useState(initialValue);
}
