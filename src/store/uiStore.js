import { create } from 'zustand';

const useUIStore = create((set) => ({
    // Navigation
    currentScreen: 'launch', // launch | setup | game | finale
    setupTab: 'info',        // info | sequence | editor | test

    // Active editing state
    activeEventId: null,

    // Modals
    activeModal: null, // null | 'question-edit' | 'settings' | 'confirm-exit' | 'csv-import' | 'question-bank'
    modalData: null,

    // Notifications
    notification: null, // { type: 'success'|'error'|'info', message: '' }

    // Game UI state
    isPaused: false,
    showFullScoreboard: false,
    selectedOption: null,
    answerRevealed: false,
    isProjector: false,

    // ── Navigation ───────────────────────────

    navigateTo: (screen) => set({ currentScreen: screen }),

    setSetupTab: (tab) => set({ setupTab: tab }),

    setActiveEvent: (eventId) => set({ activeEventId: eventId, setupTab: 'editor' }),

    // ── Modals ───────────────────────────

    openModal: (modalName, data = null) => set({ activeModal: modalName, modalData: data }),

    closeModal: () => set({ activeModal: null, modalData: null }),

    // ── Notifications ───────────────────────────

    showNotification: (type, message, duration = 3000) => {
        set({ notification: { type, message } });
        if (duration > 0) {
            setTimeout(() => set({ notification: null }), duration);
        }
    },

    clearNotification: () => set({ notification: null }),

    // ── Game UI ───────────────────────────

    togglePause: () => set((s) => ({ isPaused: !s.isPaused })),

    setPaused: (paused) => set({ isPaused: paused }),

    toggleFullScoreboard: () => set((s) => ({ showFullScoreboard: !s.showFullScoreboard })),

    selectOption: (index) => set({ selectedOption: index }),

    revealAnswer: () => set({ answerRevealed: true }),

    resetQuestionUI: () => set({ selectedOption: null, answerRevealed: false }),

    setProjectorMode: (isProjector) => set({ isProjector }),

    // ── Reset ───────────────────────────

    resetUI: () =>
        set({
            currentScreen: 'launch',
            setupTab: 'info',
            activeEventId: null,
            activeModal: null,
            modalData: null,
            isPaused: false,
            showFullScoreboard: false,
            selectedOption: null,
            answerRevealed: false,
        }),
}));

import { setupStoreSync } from '../utils/syncManager';
setupStoreSync('uiStore', useUIStore);

export default useUIStore;
