const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // File operations
    file: {
        new: () => ipcRenderer.invoke('file:new'),
        open: () => ipcRenderer.invoke('file:open'),
        save: (filePath, data) => ipcRenderer.invoke('file:save', { filePath, data }),
        saveAs: (data) => ipcRenderer.invoke('file:saveAs', { data }),
        getRecent: () => ipcRenderer.invoke('file:getRecent'),
        openPath: (filePath) => ipcRenderer.invoke('file:openPath', filePath),
        copyMedia: (sourcePath, gameFilePath) =>
            ipcRenderer.invoke('file:copyMedia', { sourcePath, gameFilePath }),
        selectMedia: (type) => ipcRenderer.invoke('file:selectMedia', { type }),
        getMediaPath: (gameFilePath) => ipcRenderer.invoke('file:getMediaPath', { gameFilePath }),
        exportJSON: (opts) => ipcRenderer.invoke('file:exportJSON', opts),
    },

    // Window controls
    window: {
        toggleFullscreen: () => ipcRenderer.invoke('window:toggleFullscreen'),
        exitFullscreen: () => ipcRenderer.invoke('window:exitFullscreen'),
        getDisplays: () => ipcRenderer.invoke('window:getDisplays'),
    },

    // Platform detection
    platform: process.platform,
    isElectron: true,
});
