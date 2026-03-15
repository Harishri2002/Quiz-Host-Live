import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { EVENT_DEFAULTS } from '../utils/eventTypes';

// Helper: check if we're in Electron
const isElectron = () => typeof window !== 'undefined' && window.electronAPI?.isElectron;

const defaultGameData = {
    version: '1.0.0',
    meta: {
        title: 'Untitled Quiz',
        createdAt: new Date().toISOString(),
        lastSaved: new Date().toISOString(),
        teams: ['Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta'],
    },
    settings: {
        theme: 'dark_galaxy',
        audioLevels: { master: 80, sfx: 100, bgm: 50 },
        display: { scaling: 100, safeZone: 0 },
        autoSaveInterval: 30,
        showTeamNames: true,
        showLiveScores: true,
    },
    sequence: [],
    state: {
        gameStarted: false,
        currentEventIndex: 0,
        currentQuestionIndex: 0,
        scores: {},
    },
};

function initScores(teams) {
    const scores = {};
    teams.forEach((team) => {
        scores[team] = 0;
    });
    return scores;
}

const useGameStore = create((set, get) => ({
    // Current game data
    gameData: null,
    filePath: null,
    isDirty: false,
    lastSavedAt: null,
    saveStatus: 'idle', // idle | saving | saved | error

    // ── Game Lifecycle ───────────────────────────

    createNewGame: async () => {
        if (isElectron()) {
            const result = await window.electronAPI.file.new();
            if (result) {
                set({
                    gameData: result.data,
                    filePath: result.filePath,
                    isDirty: false,
                    lastSavedAt: new Date().toISOString(),
                });
                return true;
            }
            return false;
        }
        // Browser fallback
        const data = JSON.parse(JSON.stringify(defaultGameData));
        data.meta.createdAt = new Date().toISOString();
        data.state.scores = initScores(data.meta.teams);
        set({ gameData: data, filePath: null, isDirty: false });
        return true;
    },

    openGame: async () => {
        if (isElectron()) {
            const result = await window.electronAPI.file.open();
            if (result) {
                set({
                    gameData: result.data,
                    filePath: result.filePath,
                    isDirty: false,
                    lastSavedAt: result.data.meta?.lastSaved,
                });
                return true;
            }
            return false;
        }
        return false;
    },

    openGameByPath: async (filePath) => {
        if (isElectron()) {
            try {
                const result = await window.electronAPI.file.openPath(filePath);
                if (result) {
                    set({
                        gameData: result.data,
                        filePath: result.filePath,
                        isDirty: false,
                        lastSavedAt: result.data.meta?.lastSaved,
                    });
                    return true;
                }
            } catch (err) {
                console.error('Failed to open game:', err);
            }
        }
        return false;
    },

    saveGame: async () => {
        const { gameData, filePath } = get();
        if (!gameData) return false;

        set({ saveStatus: 'saving' });

        if (isElectron() && filePath) {
            const result = await window.electronAPI.file.save(filePath, gameData);
            if (result?.success) {
                set({
                    isDirty: false,
                    saveStatus: 'saved',
                    lastSavedAt: new Date().toISOString(),
                });
                setTimeout(() => set({ saveStatus: 'idle' }), 2000);
                return true;
            }
            set({ saveStatus: 'error' });
            return false;
        }

        // Browser fallback: download as JSON
        if (!isElectron()) {
            const blob = new Blob([JSON.stringify(gameData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${gameData.meta.title || 'quiz'}.qmg`;
            a.click();
            URL.revokeObjectURL(url);
            set({ isDirty: false, saveStatus: 'saved' });
            setTimeout(() => set({ saveStatus: 'idle' }), 2000);
            return true;
        }

        return false;
    },

    closeGame: () => {
        set({ gameData: null, filePath: null, isDirty: false, saveStatus: 'idle' });
    },

    // ── Meta Updates ───────────────────────────

    updateTitle: (title) => {
        set((s) => ({
            gameData: { ...s.gameData, meta: { ...s.gameData.meta, title } },
            isDirty: true,
        }));
    },

    updateTeams: (teams) => {
        set((s) => {
            const oldScores = s.gameData.state.scores;
            const newScores = {};
            teams.forEach((team) => {
                newScores[team] = oldScores[team] ?? 0;
            });
            return {
                gameData: {
                    ...s.gameData,
                    meta: { ...s.gameData.meta, teams },
                    state: { ...s.gameData.state, scores: newScores },
                },
                isDirty: true,
            };
        });
    },

    // ── Settings ───────────────────────────

    updateSettings: (updates) => {
        set((s) => ({
            gameData: {
                ...s.gameData,
                settings: { ...s.gameData.settings, ...updates },
            },
            isDirty: true,
        }));
    },

    // ── Sequence Management ───────────────────────────

    addEvent: (eventType, config = {}) => {
        const defaults = EVENT_DEFAULTS[eventType] || {};
        const newEvent = {
            id: `evt_${uuidv4().slice(0, 8)}`,
            type: eventType,
            config: { ...defaults.config, ...config },
            questions: [],
        };

        set((s) => {
            if (s.gameData.sequence.length >= 10) return s;
            return {
                gameData: {
                    ...s.gameData,
                    sequence: [...s.gameData.sequence, newEvent],
                },
                isDirty: true,
            };
        });

        return get().gameData.sequence[get().gameData.sequence.length - 1];
    },

    removeEvent: (eventId) => {
        set((s) => ({
            gameData: {
                ...s.gameData,
                sequence: s.gameData.sequence.filter((e) => e.id !== eventId),
            },
            isDirty: true,
        }));
    },

    reorderEvents: (fromIndex, toIndex) => {
        set((s) => {
            const sequence = [...s.gameData.sequence];
            const [moved] = sequence.splice(fromIndex, 1);
            sequence.splice(toIndex, 0, moved);
            return {
                gameData: { ...s.gameData, sequence },
                isDirty: true,
            };
        });
    },

    updateEvent: (eventId, updates) => {
        set((s) => ({
            gameData: {
                ...s.gameData,
                sequence: s.gameData.sequence.map((e) =>
                    e.id === eventId ? { ...e, ...updates } : e
                ),
            },
            isDirty: true,
        }));
    },

    updateEventConfig: (eventId, configUpdates) => {
        set((s) => ({
            gameData: {
                ...s.gameData,
                sequence: s.gameData.sequence.map((e) =>
                    e.id === eventId
                        ? { ...e, config: { ...e.config, ...configUpdates } }
                        : e
                ),
            },
            isDirty: true,
        }));
    },

    // ── Question Management ───────────────────────────

    addQuestion: (eventId, question) => {
        const q = {
            id: `q_${uuidv4().slice(0, 8)}`,
            ...question,
        };
        set((s) => ({
            gameData: {
                ...s.gameData,
                sequence: s.gameData.sequence.map((e) =>
                    e.id === eventId
                        ? { ...e, questions: [...(e.questions || []), q] }
                        : e
                ),
            },
            isDirty: true,
        }));
        return q;
    },

    updateQuestion: (eventId, questionId, updates) => {
        set((s) => ({
            gameData: {
                ...s.gameData,
                sequence: s.gameData.sequence.map((e) =>
                    e.id === eventId
                        ? {
                            ...e,
                            questions: (e.questions || []).map((q) =>
                                q.id === questionId ? { ...q, ...updates } : q
                            ),
                        }
                        : e
                ),
            },
            isDirty: true,
        }));
    },

    removeQuestion: (eventId, questionId) => {
        set((s) => ({
            gameData: {
                ...s.gameData,
                sequence: s.gameData.sequence.map((e) =>
                    e.id === eventId
                        ? { ...e, questions: (e.questions || []).filter((q) => q.id !== questionId) }
                        : e
                ),
            },
            isDirty: true,
        }));
    },

    reorderQuestions: (eventId, fromIndex, toIndex) => {
        set((s) => ({
            gameData: {
                ...s.gameData,
                sequence: s.gameData.sequence.map((e) => {
                    if (e.id !== eventId) return e;
                    const questions = [...(e.questions || [])];
                    const [moved] = questions.splice(fromIndex, 1);
                    questions.splice(toIndex, 0, moved);
                    return { ...e, questions };
                }),
            },
            isDirty: true,
        }));
    },

    // ── Game State (In-Game) ───────────────────────────

    startGame: () => {
        set((s) => ({
            gameData: {
                ...s.gameData,
                state: {
                    ...s.gameData.state,
                    gameStarted: true,
                    currentEventIndex: 0,
                    currentQuestionIndex: 0,
                },
            },
            isDirty: true,
        }));
    },

    nextQuestion: () => {
        set((s) => ({
            gameData: {
                ...s.gameData,
                state: {
                    ...s.gameData.state,
                    currentQuestionIndex: s.gameData.state.currentQuestionIndex + 1,
                },
            },
            isDirty: true,
        }));
    },

    nextEvent: () => {
        set((s) => ({
            gameData: {
                ...s.gameData,
                state: {
                    ...s.gameData.state,
                    currentEventIndex: s.gameData.state.currentEventIndex + 1,
                    currentQuestionIndex: 0,
                },
            },
            isDirty: true,
        }));
    },

    addScore: (teamName, points) => {
        set((s) => ({
            gameData: {
                ...s.gameData,
                state: {
                    ...s.gameData.state,
                    scores: {
                        ...s.gameData.state.scores,
                        [teamName]: (s.gameData.state.scores[teamName] || 0) + points,
                    },
                },
            },
            isDirty: true,
        }));
    },

    deductScore: (teamName, points) => {
        set((s) => ({
            gameData: {
                ...s.gameData,
                state: {
                    ...s.gameData.state,
                    scores: {
                        ...s.gameData.state.scores,
                        [teamName]: (s.gameData.state.scores[teamName] || 0) - points,
                    },
                },
            },
            isDirty: true,
        }));
    },

    endGame: () => {
        set((s) => ({
            gameData: {
                ...s.gameData,
                state: { ...s.gameData.state, gameStarted: false },
            },
            isDirty: true,
        }));
    },

    resetScores: () => {
        set((s) => {
            const scores = {};
            s.gameData.meta.teams.forEach((team) => {
                scores[team] = 0;
            });
            return {
                gameData: {
                    ...s.gameData,
                    state: { ...s.gameData.state, scores },
                },
                isDirty: true,
            };
        });
    },
}));

import { setupStoreSync } from '../utils/syncManager';
setupStoreSync('gameStore', useGameStore);

export default useGameStore;
