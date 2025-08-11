# Advanced Markdown Editor

A powerful, feature-rich Markdown editor built with Electron, featuring VS Code-like editing capabilities and live preview.

## ✨ Features

### 🖊️ Advanced Editor
- **CodeMirror 6 Integration**: VS Code-like editing experience with advanced features
- **Multi-Selection**: Ctrl+D for selecting multiple occurrences (like VS Code)
- **Line Operations**: Duplicate lines (Shift+Alt+Up/Down), move lines (Alt+Up/Down)
- **Advanced Search**: Built-in search and replace functionality (Ctrl+F, Ctrl+H)
- **Auto-completion**: Intelligent code and text completion
- **Syntax Highlighting**: Full syntax highlighting for code blocks
- **Textarea Fallback**: Automatic fallback to textarea if CodeMirror fails to load

### 🎨 Themes & Customization
- **8 Built-in Themes**: Dark, Light, Monokai, Dracula, Nord, Solarized Dark/Light, GitHub
- **Custom Theme Creator**: Create and save your own themes with color picker
- **Live Theme Switching**: Change themes instantly without restart
- **Persistent Preferences**: Theme and settings automatically saved

### 📝 Live Preview
- **Real-time Rendering**: See your markdown rendered as you type
- **Synchronized Scrolling**: Optional scroll sync between editor and preview
- **GitHub Flavored Markdown**: Full GFM support with tables, task lists, etc.
- **Code Highlighting**: Syntax highlighting for code blocks in preview

### 🔒 Security & Performance
- **Content Security Policy**: Secure CSP implementation for enhanced security
- **External JavaScript**: Separated JavaScript for better security and maintainability
- **Optimized Performance**: Efficient rendering and memory management

### 💾 File Management
- **File Association**: Can be set as default handler for .md files
- **Drag & Drop**: Open files by dragging them to the editor
- **Auto-save Indication**: Visual feedback for unsaved changes
- **Multiple File Formats**: Support for .md and .markdown files

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm

### Setup
1. Clone or download the project
2. Open terminal in project folder
3. Install dependencies:
   ```bash
   npm install
   ```

### Development
```bash
# Run in development mode
npm start
```

### Building
```bash
# Build for Windows
npm run build-win

# Build for macOS  
npm run build-mac

# Build for Linux
npm run build-linux
```

## ⌨️ Keyboard Shortcuts

### File Operations
- **Ctrl/Cmd + N**: New file
- **Ctrl/Cmd + O**: Open file
- **Ctrl/Cmd + S**: Save file
- **Ctrl/Cmd + Shift + S**: Save as

### View Controls
- **Ctrl/Cmd + P**: Toggle preview panel
- **Ctrl/Cmd + E**: Toggle editor panel
- **Ctrl/Cmd + Shift + S**: Toggle sync scroll
- **Ctrl/Cmd + L**: Toggle line numbers

### VS Code-like Editor Features
- **Ctrl/Cmd + F**: Search
- **Ctrl/Cmd + H**: Search and replace
- **Ctrl/Cmd + D**: Select next occurrence (multi-selection)
- **Ctrl/Cmd + L**: Select current line
- **Shift + Alt + Up/Down**: Duplicate line up/down
- **Alt + Up/Down**: Move line up/down
- **Ctrl/Cmd + Shift + K**: Delete current line
- **Tab**: Indent with tab support

### Development
- **F12**: Toggle developer tools
- **Ctrl/Cmd + R**: Reload application

## 📁 Project Structure

```
markdown-editor/
├── assets/              # Application icons
│   ├── icon.ico        # Windows icon
│   ├── icon.icns       # macOS icon
│   └── icon.png        # Linux icon
├── js/                 # JavaScript files
│   └── main.js         # Renderer process code
├── dist/               # Built applications (after build)
├── node_modules/       # Dependencies
├── index.html          # Main UI file
├── main.js             # Electron main process
├── package.json        # Package configuration
├── package-lock.json   # Dependency lock file
└── README.md          # This file
```

## 🎨 Themes

### Built-in Themes
- **Dark**: Default dark theme with blue accents
- **Light**: Clean light theme for daytime use
- **Monokai**: Classic Monokai color scheme
- **Dracula**: Popular Dracula theme
- **Nord**: Arctic, north-bluish color palette
- **Solarized Dark/Light**: Precision colors for machines and people
- **GitHub**: GitHub's clean color scheme

### Custom Themes
1. Select "Custom Theme..." from theme dropdown
2. Use color pickers to customize colors
3. Click "Apply Theme" to save and use
4. Themes are automatically saved and persist between sessions

## 🔧 Configuration

### Setting as Default .md Handler

#### Windows
1. Build and install the application
2. Right-click any .md file
3. Select "Open with" → "Choose another app"
4. Select "Markdown Editor" and check "Always use this app"

#### macOS
1. Right-click any .md file
2. Select "Get Info"
3. In "Open with" section, select "Markdown Editor"
4. Click "Change All..." to apply to all .md files

#### Linux
1. Right-click any .md file
2. Select "Properties" → "Open With"
3. Choose "Markdown Editor" as default

### Preferences
All preferences are automatically saved to:
- **Windows**: `%USERPROFILE%\.markdown-editor-prefs.json`
- **macOS/Linux**: `~/.markdown-editor-prefs.json`

## 🛠️ Troubleshooting

### Editor Not Loading
- **Issue**: CodeMirror 6 fails to load
- **Solution**: App automatically falls back to textarea editor
- **Check**: Developer console (F12) for specific error messages

### Open Button Not Working  
- **Issue**: File dialog doesn't appear
- **Solution**: Ensure IPC handlers are properly set up
- **Check**: Main process console for IPC errors

### Scroll Sync Not Working
- **Issue**: Editor and preview don't scroll together
- **Solution**: Toggle sync scroll checkbox, restart if needed
- **Note**: Works with both CodeMirror and textarea fallback

### Theme Not Persisting
- **Issue**: Theme resets after restart
- **Solution**: Check write permissions for preferences file
- **Location**: See Preferences section above

### Build Failures
- **Clear Dependencies**: `rm -rf node_modules && npm install`
- **Update Node.js**: Ensure Node.js v16+ is installed
- **Check Permissions**: Ensure write access to project directory

## 🔄 Updates & Features

### Recent Additions
- ✅ CodeMirror 6 integration with full VS Code features
- ✅ Content Security Policy implementation
- ✅ External JavaScript separation for better security
- ✅ Enhanced scroll synchronization
- ✅ Comprehensive theme system with 8+ themes
- ✅ Custom theme creator with live preview

### Planned Features
- 📄 Export to PDF/HTML
- 📑 Multiple tabs support
- 🔌 Plugin system
- 📊 Table editor
- 🔍 Advanced find and replace with regex
- 📱 Responsive design improvements

## 📄 License

MIT License - Feel free to modify and distribute as needed.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and feature requests, please:
1. Check the troubleshooting section
2. Open developer tools (F12) to check for errors
3. Create an issue with detailed information about your system and the problem

---

**Built with ❤️ using Electron, CodeMirror 6, and modern web technologies.**