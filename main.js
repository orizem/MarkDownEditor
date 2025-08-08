const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;
let currentFilePath = null;

function createWindow(filePath = null) {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  mainWindow.loadFile('index.html');

  // If file path provided (opened with file), load it
  if (filePath) {
    mainWindow.webContents.on('did-finish-load', () => {
      loadFile(filePath);
    });
  }

  createMenu();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('new-file');
            currentFilePath = null;
          }
        },
        {
          label: 'Open',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog({
              properties: ['openFile'],
              filters: [
                { name: 'Markdown Files', extensions: ['md', 'markdown'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });

            if (!result.canceled && result.filePaths[0]) {
              loadFile(result.filePaths[0]);
            }
          }
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('save-file');
          }
        },
        {
          label: 'Save As',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow.webContents.send('save-as-file');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Preview',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            mainWindow.webContents.send('toggle-preview');
          }
        },
        {
          label: 'Toggle Editor',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow.webContents.send('toggle-editor');
          }
        },
        { type: 'separator' },
        {
          label: 'Themes',
          submenu: [
            {
              label: 'Dark Theme',
              click: () => {
                mainWindow.webContents.send('set-theme', 'dark');
              }
            },
            {
              label: 'Light Theme',
              click: () => {
                mainWindow.webContents.send('set-theme', 'light');
              }
            },
            {
              label: 'Monokai',
              click: () => {
                mainWindow.webContents.send('set-theme', 'monokai');
              }
            },
            {
              label: 'Dracula',
              click: () => {
                mainWindow.webContents.send('set-theme', 'dracula');
              }
            },
            {
              label: 'Nord',
              click: () => {
                mainWindow.webContents.send('set-theme', 'nord');
              }
            },
            {
              label: 'Solarized Dark',
              click: () => {
                mainWindow.webContents.send('set-theme', 'solarized-dark');
              }
            },
            {
              label: 'Solarized Light',
              click: () => {
                mainWindow.webContents.send('set-theme', 'solarized-light');
              }
            },
            {
              label: 'GitHub',
              click: () => {
                mainWindow.webContents.send('set-theme', 'github');
              }
            },
            { type: 'separator' },
            {
              label: 'Custom Theme...',
              click: () => {
                mainWindow.webContents.send('set-theme', 'custom');
              }
            }
          ]
        },
        {
          label: 'Toggle Sync Scroll',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow.webContents.send('toggle-sync-scroll');
          }
        },
        {
          label: 'Toggle Show Lines',
          accelerator: 'CmdOrCtrl+L',
          click: () => {
            mainWindow.webContents.send('toggle-show-lines');
          }
        },
        { type: 'separator' },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        },
        {
          label: 'Toggle DevTools',
          accelerator: 'F12',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

async function loadFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    currentFilePath = filePath;
    mainWindow.webContents.send('file-opened', {
      content,
      filePath
    });
    mainWindow.setTitle(`Markdown Editor - ${path.basename(filePath)}`);
  } catch (error) {
    dialog.showErrorBox('Error', `Failed to open file: ${error.message}`);
  }
}

// IPC Handlers
ipcMain.handle('get-current-file', () => currentFilePath);

ipcMain.handle('save-file', async (event, { content, filePath }) => {
  try {
    const targetPath = filePath || currentFilePath;
    
    if (!targetPath) {
      const result = await dialog.showSaveDialog({
        filters: [
          { name: 'Markdown Files', extensions: ['md'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        defaultExt: 'md'
      });

      if (result.canceled) return null;
      
      await fs.writeFile(result.filePath, content, 'utf-8');
      currentFilePath = result.filePath;
      mainWindow.setTitle(`Markdown Editor - ${path.basename(result.filePath)}`);
      return result.filePath;
    }

    await fs.writeFile(targetPath, content, 'utf-8');
    return targetPath;
  } catch (error) {
    dialog.showErrorBox('Error', `Failed to save file: ${error.message}`);
    return null;
  }
});

ipcMain.handle('save-as-file', async (event, content) => {
  try {
    const result = await dialog.showSaveDialog({
      filters: [
        { name: 'Markdown Files', extensions: ['md'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      defaultExt: 'md'
    });

    if (result.canceled) return null;

    await fs.writeFile(result.filePath, content, 'utf-8');
    currentFilePath = result.filePath;
    mainWindow.setTitle(`Markdown Editor - ${path.basename(result.filePath)}`);
    return result.filePath;
  } catch (error) {
    dialog.showErrorBox('Error', `Failed to save file: ${error.message}`);
    return null;
  }
});

// Handle file open on Windows/Linux
app.on('ready', () => {
  // Check if app was opened with a file
  const filePath = process.argv.find(arg => arg.endsWith('.md'));
  createWindow(filePath);
});

// Handle file open on macOS
app.on('open-file', (event, filePath) => {
  event.preventDefault();
  
  if (mainWindow) {
    loadFile(filePath);
  } else {
    app.on('ready', () => {
      createWindow(filePath);
    });
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Set as default handler for .md files (Windows)
if (process.platform === 'win32' && process.argv.length >= 2) {
  const filePath = process.argv[1];
  if (filePath && filePath.endsWith('.md')) {
    app.on('ready', () => {
      if (mainWindow) {
        loadFile(filePath);
      }
    });
  }
}