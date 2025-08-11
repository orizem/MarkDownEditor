const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;
let currentFilePath = null;

function createWindow(filePath = null) {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false, // Remove the default window frame
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

  // Don't create native menu - we'll integrate it into the custom title bar
  Menu.setApplicationMenu(null);

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

// Window control IPC handlers
ipcMain.on('window-minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.on('toggle-dev-tools', () => {
  if (mainWindow) {
    if (mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools();
    } else {
      mainWindow.webContents.openDevTools();
    }
  }
});

// IPC Handlers
ipcMain.handle('get-current-file', () => currentFilePath);

ipcMain.on('open-file-dialog', async (event) => {
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
});

ipcMain.handle('auto-save-file', async (event, { content, filePath }) => {
  try {
    if (!filePath) return null;
    
    await fs.writeFile(filePath, content, 'utf-8');
    return filePath;
  } catch (error) {
    console.error('Auto-save error:', error);
    return null;
  }
});

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

// Export handlers
ipcMain.handle('export-pdf', async (event, { content, currentFilePath }) => {
  try {
    // Create a temporary HTML file with the markdown rendered
    const marked = require('marked');
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Markdown Export</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
        }
        h1, h2, h3, h4, h5, h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
        }
        h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
        h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
        h3 { font-size: 1.25em; }
        code {
            background: #f6f8fa;
            border-radius: 3px;
            font-size: 85%;
            margin: 0;
            padding: 0.2em 0.4em;
        }
        pre {
            background: #f6f8fa;
            border-radius: 6px;
            font-size: 85%;
            line-height: 1.45;
            overflow: auto;
            padding: 16px;
        }
        pre code {
            background: transparent;
            border: 0;
            display: inline;
            line-height: inherit;
            margin: 0;
            overflow: visible;
            padding: 0;
            word-wrap: normal;
        }
        blockquote {
            border-left: 4px solid #dfe2e5;
            color: #6a737d;
            padding-left: 16px;
        }
        table {
            border-collapse: collapse;
            margin: 16px 0;
            width: 100%;
        }
        table th, table td {
            border: 1px solid #dfe2e5;
            padding: 8px 12px;
            text-align: left;
        }
        table th {
            background: #f6f8fa;
            font-weight: 600;
        }
        @media print {
            body { margin: 0; padding: 20px; }
        }
    </style>
</head>
<body>
${marked.parse(content)}
</body>
</html>`;
    
    // Show save dialog for PDF
    const result = await dialog.showSaveDialog({
      filters: [
        { name: 'PDF Files', extensions: ['pdf'] },
      ],
      defaultPath: currentFilePath ? 
        currentFilePath.replace(/\.md$/, '.pdf') : 
        'document.pdf',
      defaultExtension: 'pdf'
    });

    if (result.canceled) return null;

    // Create a new BrowserWindow to render the PDF
    const pdfWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    // Load the HTML content
    await pdfWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent));

    // Generate PDF
    const pdfData = await pdfWindow.webContents.printToPDF({
      marginsType: 1, // default margins
      printBackground: false,
      printSelectionOnly: false,
      landscape: false,
      pageSize: 'A4'
    });

    // Save PDF file
    await fs.writeFile(result.filePath, pdfData);

    // Close the temporary window
    pdfWindow.close();

    return result.filePath;
  } catch (error) {
    console.error('PDF export error:', error);
    dialog.showErrorBox('Export Error', `Failed to export PDF: ${error.message}`);
    return null;
  }
});

ipcMain.handle('export-html', async (event, { content, currentFilePath }) => {
  try {
    const marked = require('marked');
    
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Markdown Export</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
        }
        h1, h2, h3, h4, h5, h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
        }
        h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
        h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
        h3 { font-size: 1.25em; }
        code {
            background: #f6f8fa;
            border-radius: 3px;
            font-size: 85%;
            margin: 0;
            padding: 0.2em 0.4em;
        }
        pre {
            background: #f6f8fa;
            border-radius: 6px;
            font-size: 85%;
            line-height: 1.45;
            overflow: auto;
            padding: 16px;
        }
        pre code {
            background: transparent;
            border: 0;
            display: inline;
            line-height: inherit;
            margin: 0;
            overflow: visible;
            padding: 0;
            word-wrap: normal;
        }
        blockquote {
            border-left: 4px solid #dfe2e5;
            color: #6a737d;
            padding-left: 16px;
        }
        table {
            border-collapse: collapse;
            margin: 16px 0;
            width: 100%;
        }
        table th, table td {
            border: 1px solid #dfe2e5;
            padding: 8px 12px;
            text-align: left;
        }
        table th {
            background: #f6f8fa;
            font-weight: 600;
        }
    </style>
</head>
<body>
${marked.parse(content)}
</body>
</html>`;

    // Show save dialog for HTML
    const result = await dialog.showSaveDialog({
      filters: [
        { name: 'HTML Files', extensions: ['html'] },
      ],
      defaultPath: currentFilePath ? 
        currentFilePath.replace(/\.md$/, '.html') : 
        'document.html',
      defaultExtension: 'html'
    });

    if (result.canceled) return null;

    // Save HTML file
    await fs.writeFile(result.filePath, htmlContent, 'utf-8');

    return result.filePath;
  } catch (error) {
    console.error('HTML export error:', error);
    dialog.showErrorBox('Export Error', `Failed to export HTML: ${error.message}`);
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