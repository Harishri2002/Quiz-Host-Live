import { useEffect, useState } from 'react';

const SYNC_CHANNEL = 'quiz_lab_sync';
const pingChannel = new BroadcastChannel('quiz_lab_ping');

/**
 * Syncs a Zustand store across multiple browser windows using BroadcastChannel.
 * The Host window broadcasts its full state on 'ping', and broadcasts individual updates.
 * The Projector window receives updates and applies them to its local store.
 */
export function setupStoreSync(storeName, useStore) {
    const channel = new BroadcastChannel(`${SYNC_CHANNEL}_${storeName}`);

    // Flag to prevent infinite loops during state sync
    let isApplyingSync = false;

    // Listen for changes from other windows
    channel.onmessage = (event) => {
        const { type, state } = event.data;

        if (type === 'SYNC_STATE') {
            isApplyingSync = true;
            useStore.setState(state, true); // true = replace entire state or merge, depending on usage
            isApplyingSync = false;
        }
    };

    // Subscribe to local store changes and broadcast them
    useStore.subscribe((state) => {
        // If this change was triggered by a sync from another window, don't broadcast it back
        if (isApplyingSync) return;

        // Only broadcast if we are not the projector (Host dictates state)
        // We check URL params directly here to avoid circular dep with uiStore
        const isProjector = new URLSearchParams(window.location.search).get('projector') === 'true';
        if (!isProjector) {
            // Strip functions from state to prevent DataCloneError
            const cleanState = JSON.parse(JSON.stringify(state));
            channel.postMessage({ type: 'SYNC_STATE', state: cleanState });
        }
    });

    // If we are a newly opened Projector, request full state from Host
    const isProjector = new URLSearchParams(window.location.search).get('projector') === 'true';
    if (isProjector) {
        pingChannel.postMessage({ type: 'REQUEST_FULL_STATE', store: storeName });
    }

    // If we are the Host, listen for requests for full state and send it
    pingChannel.onmessage = (event) => {
        if (!isProjector && event.data.type === 'REQUEST_FULL_STATE' && event.data.store === storeName) {
            const cleanState = JSON.parse(JSON.stringify(useStore.getState()));
            channel.postMessage({ type: 'SYNC_STATE', state: cleanState });
        }
    };

    return channel;
}

/**
 * A custom hook to replace useState for component-level state that needs to sync over BroadcastChannel.
 * Useful for ephemeral state like timers, selected options, etc.
 * 
 * @param {string} key Unique identifier for this state across windows
 * @param {any} initialValue Initial state value
 * @returns [state, setState] Like useState
 */
export function useSyncState(key, initialValue) {
    const [state, setLocalState] = useState(initialValue);
    const isProjector = new URLSearchParams(window.location.search).get('projector') === 'true';

    useEffect(() => {
        const channel = new BroadcastChannel(`${SYNC_CHANNEL}_component_${key}`);

        channel.onmessage = (event) => {
            if (event.data.type === 'SYNC') {
                setLocalState(event.data.value);
            } else if (event.data.type === 'REQUEST_STATE' && !isProjector) {
                // Projector requested state, Host sends it
                channel.postMessage({ type: 'SYNC', value: state });
            }
        };

        // If projector, request initial value
        if (isProjector) {
            channel.postMessage({ type: 'REQUEST_STATE' });
        }

        return () => channel.close();
    }, [key, isProjector, state]); // Notice 'state' is in deps so Host sends current value when requested

    const setSyncState = (newValue) => {
        // Only Host should really be updating component sync state
        if (!isProjector) {
            const valueToSet = typeof newValue === 'function' ? newValue(state) : newValue;
            setLocalState(valueToSet);
            const channel = new BroadcastChannel(`${SYNC_CHANNEL}_component_${key}`);
            channel.postMessage({ type: 'SYNC', value: valueToSet });
            channel.close();
        }
    };

    // Allow projector to force local updates if strictly necessary (rare)
    const setForceLocalState = (newValue) => {
        const valueToSet = typeof newValue === 'function' ? newValue(state) : newValue;
        setLocalState(valueToSet);
    };

    return [state, isProjector ? setForceLocalState : setSyncState];
}
