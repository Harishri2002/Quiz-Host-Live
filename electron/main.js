const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
const path = require('path');
const fileManager = require('./fileManager');

let mainWindow = null;
const isDev = !app.isPackaged;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 700,
        title: 'Quiz-Lab',
        icon: path.join(__dirname, '..', 'assets', 'icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        show: false,
        backgroundColor: '#1A1A2E',
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createMainWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// ── IPC Handlers ──────────────────────────────────────

// File Operations
ipcMain.handle('file:new', async () => {
    const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Create New Quiz Game',
        defaultPath: 'Untitled Quiz.qmg',
        filters: [{ name: 'Quiz-Lab Game', extensions: ['qmg'] }],
    });
    if (result.canceled) return null;
    const gameData = fileManager.createNewGame(result.filePath);
    return { filePath: result.filePath, data: gameData };
});

ipcMain.handle('file:open', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Open Quiz Game',
        filters: [{ name: 'Quiz-Lab Game', extensions: ['qmg'] }],
        properties: ['openFile'],
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    const filePath = result.filePaths[0];
    const data = fileManager.loadGame(filePath);
    return { filePath, data };
});

ipcMain.handle('file:save', async (event, { filePath, data }) => {
    return fileManager.saveGame(filePath, data);
});

ipcMain.handle('file:saveAs', async (event, { data }) => {
    const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Save Quiz Game As',
        defaultPath: `${data.meta?.title || 'Untitled Quiz'}.qmg`,
        filters: [{ name: 'Quiz-Lab Game', extensions: ['qmg'] }],
    });
    if (result.canceled) return null;
    fileManager.saveGame(result.filePath, data);
    return result.filePath;
});

ipcMain.handle('file:getRecent', async () => {
    return fileManager.getRecentGames();
});

ipcMain.handle('file:openPath', async (event, filePath) => {
    const data = fileManager.loadGame(filePath);
    return { filePath, data };
});

// Window controls
ipcMain.handle('window:toggleFullscreen', () => {
    if (mainWindow) {
        mainWindow.setFullScreen(!mainWindow.isFullScreen());
        return mainWindow.isFullScreen();
    }
    return false;
});

ipcMain.handle('window:exitFullscreen', () => {
    if (mainWindow) {
        mainWindow.setFullScreen(false);
    }
});

ipcMain.handle('window:getDisplays', () => {
    const displays = screen.getAllDisplays();
    return displays.map((d, i) => ({
        id: d.id,
        label: `Display ${i + 1} (${d.size.width}×${d.size.height})`,
        width: d.size.width,
        height: d.size.height,
        primary: d.id === screen.getPrimaryDisplay().id,
    }));
});

// Media file handling
ipcMain.handle('file:copyMedia', async (event, { sourcePath, gameFilePath }) => {
    return fileManager.copyMediaFile(sourcePath, gameFilePath);
});

ipcMain.handle('file:selectMedia', async (event, { type }) => {
    const filters = type === 'image'
        ? [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'] }]
        : [{ name: 'Audio', extensions: ['mp3', 'wav', 'ogg', 'm4a'] }];

    const result = await dialog.showOpenDialog(mainWindow, {
        title: `Select ${type === 'image' ? 'Image' : 'Audio'} File`,
        filters,
        properties: ['openFile'],
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
});
