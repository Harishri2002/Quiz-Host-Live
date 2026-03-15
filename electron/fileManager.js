const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { app } = require('electron');

const RECENT_FILE = path.join(app.getPath('userData'), 'recent-games.json');
const MAX_RECENT = 5;

/**
 * Create a new empty game file
 */
function createNewGame(filePath) {
    const gameData = {
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

    // Initialize scores for all teams
    gameData.meta.teams.forEach((team) => {
        gameData.state.scores[team] = 0;
    });

    saveGame(filePath, gameData);
    addToRecent(filePath, gameData.meta.title);
    return gameData;
}

/**
 * Load a game file and verify integrity
 */
function loadGame(filePath) {
    try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);
        addToRecent(filePath, data.meta?.title || 'Unknown Game');
        return data;
    } catch (err) {
        throw new Error(`Failed to load game file: ${err.message}`);
    }
}

/**
 * Save game file atomically (write to temp → rename)
 */
function saveGame(filePath, data) {
    try {
        data.meta.lastSaved = new Date().toISOString();
        const json = JSON.stringify(data, null, 2);
        const tempPath = filePath + '.tmp';
        fs.writeFileSync(tempPath, json, 'utf-8');
        fs.renameSync(tempPath, filePath);
        addToRecent(filePath, data.meta?.title || 'Unknown Game');
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

/**
 * Copy a media file into the game's _media folder
 */
function copyMediaFile(sourcePath, gameFilePath) {
    try {
        const gameDir = path.dirname(gameFilePath);
        const gameName = path.basename(gameFilePath, '.qmg');
        const mediaDir = path.join(gameDir, `${gameName}_media`);

        if (!fs.existsSync(mediaDir)) {
            fs.mkdirSync(mediaDir, { recursive: true });
        }

        const ext = path.extname(sourcePath);
        const hash = crypto.randomBytes(4).toString('hex');
        const destName = `media_${hash}${ext}`;
        const destPath = path.join(mediaDir, destName);

        fs.copyFileSync(sourcePath, destPath);
        return destName;
    } catch (err) {
        throw new Error(`Failed to copy media file: ${err.message}`);
    }
}

/**
 * Get recent games list
 */
function getRecentGames() {
    try {
        if (!fs.existsSync(RECENT_FILE)) return [];
        const data = JSON.parse(fs.readFileSync(RECENT_FILE, 'utf-8'));
        // Filter out games that no longer exist on disk
        return data.filter((g) => fs.existsSync(g.filePath));
    } catch {
        return [];
    }
}

/**
 * Add a game to the recent list
 */
function addToRecent(filePath, title) {
    try {
        let recents = getRecentGames();
        recents = recents.filter((g) => g.filePath !== filePath);
        recents.unshift({
            filePath,
            title,
            lastOpened: new Date().toISOString(),
        });
        recents = recents.slice(0, MAX_RECENT);
        fs.writeFileSync(RECENT_FILE, JSON.stringify(recents, null, 2), 'utf-8');
    } catch {
        // Non-critical, ignore errors
    }
}

module.exports = {
    createNewGame,
    loadGame,
    saveGame,
    copyMediaFile,
    getRecentGames,
};
