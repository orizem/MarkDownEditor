# Advanced Markdown Editor

A powerful, feature-rich Markdown editor built with Electron, featuring VS Code-like editing capabilities and live preview.

## ✨ Features

### 🖊️ Advanced Editor
- **CodeMirror 6 Integration**: VS Code-like editing experience with advanced features
- **Multi-Selection**: Ctrl+D for selecting multiple occurrences (like VS Code)
- **Line Operations**: Duplicate lines (Shift+Alt+Up/Down), move lines (Alt+Up/Down)
- **Built-in Search**: Native CodeMirror search functionality (Ctrl+F)
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

### 🗂️ Tab Management
- **Multiple Tabs**: Open and work with multiple files simultaneously
- **Tab Navigation**: Ctrl+Tab and Ctrl+Shift+Tab to switch between tabs
- **Drag & Drop Tabs**: Reorder tabs by dragging them
- **Smart Tab Titles**: Shows file names with unsaved change indicators
- **Tab Context**: Each tab maintains its own content and state

### 💾 File Management & Auto-save
- **File Association**: Can be set as default handler for .md files
- **Drag & Drop**: Open files by dragging them to the editor
- **Smart Auto-save**: Automatic saving 3 seconds after stopping typing
- **Auto-save Status**: Visual indicators for save status (Ready/Saving/Saved/Error)
- **Manual Save**: Traditional Ctrl+S and Save As functionality
- **Multiple File Formats**: Support for .md and .markdown files

### 📤 Export Features
- **PDF Export**: Export your markdown as professionally styled PDF files
- **HTML Export**: Generate clean, styled HTML from your markdown
- **Styled Output**: Exports include proper formatting, code highlighting, and typography
- **Smart File Naming**: Auto-suggests export names based on current file

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm

### Key Dependencies
- **Electron**: Desktop app framework
- **CodeMirror 6**: Advanced code editor
- **Marked**: Markdown parsing and rendering
- **Highlight.js**: Syntax highlighting for code blocks
- **Various CodeMirror packages**: Language support, themes, features

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

### Tab Management
- **Ctrl/Cmd + T**: New tab
- **Ctrl/Cmd + W**: Close current tab
- **Ctrl + Tab**: Switch to next tab
- **Ctrl + Shift + Tab**: Switch to previous tab

### View Controls
- **Ctrl/Cmd + P**: Toggle preview panel
- **Ctrl/Cmd + E**: Toggle editor panel
- **Ctrl/Cmd + Shift + S**: Toggle sync scroll

### VS Code-like Editor Features
- **Ctrl/Cmd + F**: Search (native CodeMirror)
- **Ctrl/Cmd + D**: Select next occurrence (multi-selection)
- **Shift + Alt + Up/Down**: Duplicate line up/down
- **Alt + Up/Down**: Move line up/down
- **Ctrl/Cmd + Shift + K**: Delete current line
- **Tab**: Indent with tab support

### Development
- **F12**: Toggle developer tools ⚠️ (opens but may not close properly)
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

### Preferences & Auto-save
All preferences and auto-save functionality:
- **Preferences Location**:
  - Windows: `%USERPROFILE%\.markdown-editor-prefs.json`
  - macOS/Linux: `~/.markdown-editor-prefs.json`
- **Auto-save Behavior**:
  - Saves 3 seconds after you stop typing
  - Maximum 30-second intervals for safety
  - Only works on files that have been saved at least once
  - Visual status indicators in the bottom bar

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

### Export Not Working
- **Issue**: PDF or HTML export fails
- **Solution**: Check file permissions for target directory
- **Check**: Developer console for export-related errors
- **Note**: Export requires write access to chosen save location

### Auto-save Issues
- **Issue**: Auto-save not working
- **Solution**: Ensure file has been manually saved at least once
- **Check**: Status bar shows "Auto-save: Ready" when enabled
- **Note**: Auto-save only works on previously saved files

### Tab Issues
- **Issue**: Tabs not switching properly
- **Solution**: Use Ctrl+Tab/Ctrl+Shift+Tab for navigation
- **Check**: Multiple files should show as separate tabs
- **Note**: Each tab maintains independent content and state

### Build Failures
- **Clear Dependencies**: `rm -rf node_modules && npm install`
- **Update Node.js**: Ensure Node.js v16+ is installed
- **Check Permissions**: Ensure write access to project directory

## 🔄 Updates & Features

### Recent Additions
- ✅ CodeMirror 6 integration with full VS Code features
- ✅ **Multiple tabs support** with drag & drop and keyboard navigation
- ✅ **Export to PDF/HTML** with professional styling
- ✅ **Smart auto-save system** with visual status indicators
- ✅ **Panel resizing** for outline and editor panels
- ✅ **Custom frameless title bar** with integrated window controls
- ✅ Content Security Policy implementation
- ✅ Enhanced scroll synchronization
- ✅ Comprehensive theme system with 8+ themes
- ✅ Custom theme creator with live preview

### Planned Features
- 🔌 Plugin system architecture
- 📊 Visual table editor
- 🔍 Advanced find and replace with regex support
- 📱 Responsive design improvements
- 🎨 More built-in themes
- 📋 Clipboard integration enhancements
- 🔗 Link preview and validation

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