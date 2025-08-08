# Markdown Editor - Setup & Usage Guide

## Features
- 📝 **Live Preview**: See your markdown rendered in real-time as you type
- 🎨 **Syntax Highlighting**: Code blocks with syntax highlighting support
- 🌙 **Dark Theme**: Easy on the eyes for extended editing sessions
- 📁 **File Association**: Set as default .md file handler
- ⌨️ **Keyboard Shortcuts**: Quick access to common functions
- 💾 **Auto-save indication**: Visual feedback for unsaved changes

## Installation Steps

### 1. Project Setup

Create a new folder for your project and save these files:
- `package.json` - Package configuration
- `main.js` - Main process code
- `index.html` - UI and renderer process
- Create an `assets` folder for icons (optional)

### 2. Install Dependencies

Open terminal in your project folder and run:

```bash
# Install dependencies
npm install

# Install Electron and builder globally (optional)
npm install -g electron
npm install -g electron-builder
```

### 3. Test the Application

```bash
# Run in development mode
npm start
```

### 4. Build the Application

```bash
# For Windows
npm run build-win

# For macOS
npm run build-mac

# For Linux
npm run build-linux
```

The built application will be in the `dist` folder.

## Setting as Default .md File Handler

### Windows
1. After building, install the application using the generated installer
2. Right-click any .md file
3. Select "Open with" → "Choose another app"
4. Select "Markdown Editor" and check "Always use this app to open .md files"

### macOS
1. Right-click any .md file
2. Select "Get Info"
3. In "Open with" section, select "Markdown Editor"
4. Click "Change All..." to set for all .md files

### Linux
1. Right-click any .md file
2. Select "Properties" → "Open With"
3. Choose "Markdown Editor" as default

## Keyboard Shortcuts

- **Ctrl/Cmd + N**: New file
- **Ctrl/Cmd + O**: Open file
- **Ctrl/Cmd + S**: Save file
- **Ctrl/Cmd + Shift + S**: Save as
- **Ctrl/Cmd + P**: Toggle preview panel
- **Ctrl/Cmd + E**: Toggle editor panel
- **F12**: Toggle developer tools

## Creating Icons (Optional)

For a professional look, create icon files:
- **Windows**: `icon.ico` (256x256)
- **macOS**: `icon.icns` (512x512)
- **Linux**: `icon.png` (512x512)

Place these in the `assets` folder.

## Project Structure

```
markdown-editor/
├── assets/
│   ├── icon.ico
│   ├── icon.icns
│   └── icon.png
├── dist/           (generated after build)
├── node_modules/   (generated after npm install)
├── index.html
├── main.js
├── package.json
└── package-lock.json
```

## Customization

### Change Theme Colors
Edit the CSS in `index.html` to customize colors:
- Background: `#1e1e1e` (main background)
- Accent: `#007acc` (buttons and status bar)
- Text: `#d4d4d4` (main text color)

### Add Features
You can extend the editor with:
- Export to PDF/HTML
- Multiple tabs support
- Plugin system
- Custom themes
- Markdown extensions

## Troubleshooting

### Application won't open .md files
- Ensure the application is properly installed (not just running from development)
- Check file associations in your OS settings

### Preview not updating
- Check browser console (F12) for errors
- Ensure marked.js is properly loaded

### Build fails
- Clear `node_modules` and run `npm install` again
- Ensure you have the latest version of Node.js
- Check that all required files are present

## License
MIT License - Feel free to modify and distribute as needed.