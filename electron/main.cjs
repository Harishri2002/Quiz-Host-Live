const { app, BrowserWindow, ipcMain, dialog, screen, protocol } = require('electron');
const path = require('path');
const fileManager = require('./fileManager.cjs');

let mainWindow = null;
const isDev = !app.isPackaged;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 700,
        title: 'Quiz-Host Live',
        icon: path.join(__dirname, '..', 'assets', 'icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
            // Required when loading local file:// resources (images, audio) on Windows
            webSecurity: isDev ? true : false,
            allowRunningInsecureContent: false,
        },
        show: false,
        backgroundColor: '#1A1A2E',
    });

    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(indexPath);
    }

    // If the file fails to load, retry once then report
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        if (!isDev) {
            console.error('Failed to load:', errorCode, errorDescription);
            // Retry loading after a short delay
            setTimeout(() => {
                if (mainWindow) mainWindow.loadFile(indexPath);
            }, 500);
        }
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    // Register custom protocol for loading local media files securely
    protocol.registerFileProtocol('media', (request, callback) => {
        const filePath = decodeURIComponent(request.url.replace('media://', ''));
        callback({ path: path.normalize(`${filePath}`) });
    });

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
        filters: [{ name: 'Quiz-Host Live Game', extensions: ['qmg'] }],
    });
    if (result.canceled) return null;
    const gameData = fileManager.createNewGame(result.filePath);
    return { filePath: result.filePath, data: gameData };
});

ipcMain.handle('file:open', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Open Quiz Game',
        filters: [{ name: 'Quiz-Host Live Game', extensions: ['qmg'] }],
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
        filters: [{ name: 'Quiz-Host Live Game', extensions: ['qmg'] }],
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

ipcMain.handle('file:export', async (event, { gameFilePath }) => {
    const defaultName = path.basename(gameFilePath).replace('.qmg', ' Package.qmgz');
    const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Export Game Package (with Media)',
        defaultPath: defaultName,
        filters: [{ name: 'Quiz-Host Live Game Package', extensions: ['qmgz', 'zip'] }],
    });
    if (result.canceled) return null;

    return fileManager.exportGamePackage(gameFilePath, result.filePath);
});

ipcMain.handle('file:import', async () => {
    // 1. Select the .qmgz or .zip file
    const openResult = await dialog.showOpenDialog(mainWindow, {
        title: 'Import Game Package',
        filters: [{ name: 'Quiz-Host Live Game Package', extensions: ['qmgz', 'zip'] }],
        properties: ['openFile'],
    });
    if (openResult.canceled || openResult.filePaths.length === 0) return null;
    const sourceZip = openResult.filePaths[0];

    // 2. Select a destination directory to extract to
    const destResult = await dialog.showOpenDialog(mainWindow, {
        title: 'Select Destination Folder for Extracted Game',
        properties: ['openDirectory', 'createDirectory']
    });
    if (destResult.canceled || destResult.filePaths.length === 0) return null;
    const destFolder = destResult.filePaths[0];

    return fileManager.importGamePackage(sourceZip, destFolder);
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

ipcMain.handle('file:getMediaPath', async (event, { gameFilePath }) => {
    if (!gameFilePath) return null;
    return path.join(path.dirname(gameFilePath), '_media');
});
