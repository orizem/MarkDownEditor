const { ipcRenderer } = require("electron");
const path = require("path");
const fs = require("fs");

let codeEditor = null;
const editorContainer = document.getElementById("editorContainer");
const preview = document.getElementById("preview");
const fileName = document.getElementById("fileName");
const wordCount = document.getElementById("wordCount");
const toggleEditorBtn = document.getElementById("toggleEditor");
const togglePreviewBtn = document.getElementById("togglePreview");
const editorPanel = document.getElementById("editorPanel");
const previewPanel = document.getElementById("previewPanel");
const saveBtn = document.getElementById("saveBtn");
const openBtn = document.getElementById("openBtn");
const themeSelect = document.getElementById("themeSelect");
const syncScrollCheckbox = document.getElementById("syncScroll");
const themeModal = document.getElementById("themeModal");
const closeModalBtn = document.querySelector(".close-modal");
const applyThemeBtn = document.getElementById("applyTheme");
const resetThemeBtn = document.getElementById("resetTheme");

let currentFilePath = null;
let hasUnsavedChanges = false;
let isUpdatingScroll = false;

// Theme definitions
const themes = {
  dark: {
    "--bg-primary": "#1e1e1e",
    "--bg-secondary": "#252526",
    "--bg-tertiary": "#2d2d30",
    "--border-color": "#3e3e42",
    "--text-primary": "#d4d4d4",
    "--text-secondary": "#cccccc",
    "--text-tertiary": "#858585",
    "--accent-primary": "#007acc",
    "--accent-hover": "#1177bb",
    "--accent-active": "#0e639c",
    "--heading-color": "#569cd6",
    "--link-color": "#3794ff",
    "--code-bg": "#2d2d30",
    "--code-text": "#ce9178",
    "--scrollbar-bg": "#1e1e1e",
    "--scrollbar-thumb": "#424242",
    "--scrollbar-thumb-hover": "#4f4f4f",
    "--scrollbar-thumb-active": "#5a5a5a",
    "hljs-theme": "github-dark",
  },
  light: {
    "--bg-primary": "#ffffff",
    "--bg-secondary": "#f3f3f3",
    "--bg-tertiary": "#e8e8e8",
    "--border-color": "#d4d4d4",
    "--text-primary": "#333333",
    "--text-secondary": "#555555",
    "--text-tertiary": "#777777",
    "--accent-primary": "#0066cc",
    "--accent-hover": "#0052a3",
    "--accent-active": "#004080",
    "--heading-color": "#0066cc",
    "--link-color": "#0066cc",
    "--code-bg": "#f5f5f5",
    "--code-text": "#d73a49",
    "--scrollbar-bg": "#ffffff",
    "--scrollbar-thumb": "#c1c1c1",
    "--scrollbar-thumb-hover": "#a8a8a8",
    "--scrollbar-thumb-active": "#888888",
    "hljs-theme": "github",
  },
  monokai: {
    "--bg-primary": "#272822",
    "--bg-secondary": "#3e3d32",
    "--bg-tertiary": "#45443c",
    "--border-color": "#75715e",
    "--text-primary": "#f8f8f2",
    "--text-secondary": "#f8f8f2",
    "--text-tertiary": "#75715e",
    "--accent-primary": "#66d9ef",
    "--accent-hover": "#52c7dd",
    "--accent-active": "#3eb5cb",
    "--heading-color": "#a6e22e",
    "--link-color": "#66d9ef",
    "--code-bg": "#3e3d32",
    "--code-text": "#e6db74",
    "--scrollbar-bg": "#272822",
    "--scrollbar-thumb": "#75715e",
    "--scrollbar-thumb-hover": "#908c79",
    "--scrollbar-thumb-active": "#a6a296",
    "hljs-theme": "monokai",
  },
  dracula: {
    "--bg-primary": "#282a36",
    "--bg-secondary": "#44475a",
    "--bg-tertiary": "#363849",
    "--border-color": "#6272a4",
    "--text-primary": "#f8f8f2",
    "--text-secondary": "#f8f8f2",
    "--text-tertiary": "#6272a4",
    "--accent-primary": "#bd93f9",
    "--accent-hover": "#aa7ce6",
    "--accent-active": "#9765d3",
    "--heading-color": "#50fa7b",
    "--link-color": "#8be9fd",
    "--code-bg": "#44475a",
    "--code-text": "#f1fa8c",
    "--scrollbar-bg": "#282a36",
    "--scrollbar-thumb": "#44475a",
    "--scrollbar-thumb-hover": "#6272a4",
    "--scrollbar-thumb-active": "#7b8cc5",
    "hljs-theme": "dracula",
  },
  nord: {
    "--bg-primary": "#2e3440",
    "--bg-secondary": "#3b4252",
    "--bg-tertiary": "#434c5e",
    "--border-color": "#4c566a",
    "--text-primary": "#eceff4",
    "--text-secondary": "#e5e9f0",
    "--text-tertiary": "#d8dee9",
    "--accent-primary": "#88c0d0",
    "--accent-hover": "#75adbf",
    "--accent-active": "#629aae",
    "--heading-color": "#8fbcbb",
    "--link-color": "#81a1c1",
    "--code-bg": "#3b4252",
    "--code-text": "#d08770",
    "--scrollbar-bg": "#2e3440",
    "--scrollbar-thumb": "#4c566a",
    "--scrollbar-thumb-hover": "#5e6779",
    "--scrollbar-thumb-active": "#707888",
    "hljs-theme": "nord",
  },
  "solarized-dark": {
    "--bg-primary": "#002b36",
    "--bg-secondary": "#073642",
    "--bg-tertiary": "#004052",
    "--border-color": "#586e75",
    "--text-primary": "#839496",
    "--text-secondary": "#93a1a1",
    "--text-tertiary": "#657b83",
    "--accent-primary": "#268bd2",
    "--accent-hover": "#1e6fa7",
    "--accent-active": "#16537c",
    "--heading-color": "#b58900",
    "--link-color": "#268bd2",
    "--code-bg": "#073642",
    "--code-text": "#cb4b16",
    "--scrollbar-bg": "#002b36",
    "--scrollbar-thumb": "#586e75",
    "--scrollbar-thumb-hover": "#657b83",
    "--scrollbar-thumb-active": "#839496",
    "hljs-theme": "solarized-dark",
  },
  "solarized-light": {
    "--bg-primary": "#fdf6e3",
    "--bg-secondary": "#eee8d5",
    "--bg-tertiary": "#e7e0cd",
    "--border-color": "#93a1a1",
    "--text-primary": "#657b83",
    "--text-secondary": "#586e75",
    "--text-tertiary": "#93a1a1",
    "--accent-primary": "#268bd2",
    "--accent-hover": "#1e6fa7",
    "--accent-active": "#16537c",
    "--heading-color": "#b58900",
    "--link-color": "#268bd2",
    "--code-bg": "#eee8d5",
    "--code-text": "#cb4b16",
    "--scrollbar-bg": "#fdf6e3",
    "--scrollbar-thumb": "#93a1a1",
    "--scrollbar-thumb-hover": "#839496",
    "--scrollbar-thumb-active": "#657b83",
    "hljs-theme": "solarized-light",
  },
  github: {
    "--bg-primary": "#ffffff",
    "--bg-secondary": "#f6f8fa",
    "--bg-tertiary": "#e1e4e8",
    "--border-color": "#d1d5da",
    "--text-primary": "#24292e",
    "--text-secondary": "#586069",
    "--text-tertiary": "#6a737d",
    "--accent-primary": "#0366d6",
    "--accent-hover": "#0256c7",
    "--accent-active": "#0246b8",
    "--heading-color": "#24292e",
    "--link-color": "#0366d6",
    "--code-bg": "#f6f8fa",
    "--code-text": "#e36209",
    "--scrollbar-bg": "#ffffff",
    "--scrollbar-thumb": "#d1d5da",
    "--scrollbar-thumb-hover": "#c1c5cb",
    "--scrollbar-thumb-active": "#b1b5bb",
    "hljs-theme": "github",
  },
};

// Load saved preferences
function loadPreferences() {
  const prefsPath = path.join(
    require("os").homedir(),
    ".markdown-editor-prefs.json"
  );
  try {
    if (fs.existsSync(prefsPath)) {
      const prefs = JSON.parse(fs.readFileSync(prefsPath, "utf8"));
      if (prefs.theme) {
        themeSelect.value = prefs.theme;
        applyTheme(prefs.theme);
      }
      if (prefs.customTheme) {
        themes.custom = prefs.customTheme;
      }
      if (prefs.syncScroll !== undefined) {
        syncScrollCheckbox.checked = prefs.syncScroll;
      }
    }
  } catch (err) {
    console.error("Error loading preferences:", err);
  }
}

// Save preferences
function savePreferences() {
  const prefsPath = path.join(
    require("os").homedir(),
    ".markdown-editor-prefs.json"
  );
  const prefs = {
    theme: themeSelect.value,
    customTheme: themes.custom || null,
    syncScroll: syncScrollCheckbox.checked,
  };
  try {
    fs.writeFileSync(prefsPath, JSON.stringify(prefs, null, 2));
  } catch (err) {
    console.error("Error saving preferences:", err);
  }
}

// Apply theme
function applyTheme(themeName) {
  const theme = themes[themeName] || themes.dark;
  const root = document.documentElement;

  for (const [property, value] of Object.entries(theme)) {
    if (property === "hljs-theme") {
      // Update highlight.js theme
      const hljsLink = document.getElementById("hljs-theme");
      hljsLink.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${value}.min.css`;
    } else {
      root.style.setProperty(property, value);
    }
  }

  // Re-render preview to apply new code highlighting
  updatePreview();
}

// Configure marked
marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  gfm: true,
});

// Update preview
function updatePreview() {
  if (!codeEditor) return;
  const markdown = codeEditor.getValue();
  preview.innerHTML = marked.parse(markdown);
  updateWordCount();
}

// Update word count
function updateWordCount() {
  if (!codeEditor) return;
  const text = codeEditor.getValue();
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  wordCount.textContent = `${words} words`;
}

// Mark file as modified
function markAsModified() {
  if (!hasUnsavedChanges) {
    hasUnsavedChanges = true;
    updateTitle();
  }
}

// Update window title
function updateTitle() {
  const baseName = currentFilePath
    ? path.basename(currentFilePath)
    : "Untitled.md";
  fileName.textContent = hasUnsavedChanges ? `${baseName} •` : baseName;
}

// Synchronized scrolling
function syncScroll(source, target) {
  if (!syncScrollCheckbox.checked || isUpdatingScroll) return;

  isUpdatingScroll = true;
  const scrollPercentage =
    source.scrollTop / (source.scrollHeight - source.clientHeight);
  target.scrollTop =
    scrollPercentage * (target.scrollHeight - target.clientHeight);

  setTimeout(() => {
    isUpdatingScroll = false;
  }, 10);
}

// Editor input handler - will be set up after CodeMirror initialization
// Scroll sync handlers - will be set up after CodeMirror initialization

// Theme change handler
themeSelect.addEventListener("change", () => {
  const selectedTheme = themeSelect.value;
  if (selectedTheme === "custom") {
    // Show custom theme modal
    themeModal.style.display = "block";
    loadCustomThemeValues();
  } else {
    applyTheme(selectedTheme);
    savePreferences();
  }
});

// Load custom theme values into modal
function loadCustomThemeValues() {
  const currentTheme = themes.custom || themes.dark;
  const colorInputs = [
    "bg-primary",
    "bg-secondary",
    "bg-tertiary",
    "border-color",
    "text-primary",
    "accent-primary",
    "heading-color",
    "link-color",
    "code-bg",
    "code-text",
  ];

  colorInputs.forEach((id) => {
    const colorInput = document.getElementById(`color-${id}`);
    const textInput = document.getElementById(`text-${id}`);
    const value = currentTheme[`--${id}`] || "#000000";

    if (colorInput && textInput) {
      colorInput.value = value;
      textInput.value = value;

      // Sync color and text inputs
      colorInput.addEventListener("input", (e) => {
        textInput.value = e.target.value;
      });

      textInput.addEventListener("input", (e) => {
        if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
          colorInput.value = e.target.value;
        }
      });
    }
  });
}

// Apply custom theme
applyThemeBtn.addEventListener("click", () => {
  const customTheme = {
    "--bg-primary": document.getElementById("text-bg-primary").value,
    "--bg-secondary": document.getElementById("text-bg-secondary").value,
    "--bg-tertiary": document.getElementById("text-bg-tertiary").value,
    "--border-color": document.getElementById("text-border-color").value,
    "--text-primary": document.getElementById("text-text-primary").value,
    "--text-secondary":
      document.getElementById("text-text-primary").value,
    "--text-tertiary": document.getElementById("text-border-color").value,
    "--accent-primary": document.getElementById("text-accent-primary")
      .value,
    "--accent-hover": document.getElementById("text-accent-primary")
      .value,
    "--accent-active": document.getElementById("text-accent-primary")
      .value,
    "--heading-color":
      document.getElementById("text-heading-color").value,
    "--link-color": document.getElementById("text-link-color").value,
    "--code-bg": document.getElementById("text-code-bg").value,
    "--code-text": document.getElementById("text-code-text").value,
    "--scrollbar-bg": document.getElementById("text-bg-primary").value,
    "--scrollbar-thumb":
      document.getElementById("text-border-color").value,
    "--scrollbar-thumb-hover":
      document.getElementById("text-border-color").value,
    "--scrollbar-thumb-active":
      document.getElementById("text-border-color").value,
    "hljs-theme": "default",
  };

  themes.custom = customTheme;
  applyTheme("custom");
  savePreferences();
  themeModal.style.display = "none";
});

// Reset theme
resetThemeBtn.addEventListener("click", () => {
  loadCustomThemeValues();
});

// Close modal
closeModalBtn.addEventListener("click", () => {
  themeModal.style.display = "none";
  if (!themes.custom) {
    themeSelect.value = "dark";
  }
});

// Close modal when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === themeModal) {
    themeModal.style.display = "none";
    if (!themes.custom) {
      themeSelect.value = "dark";
    }
  }
});

// Toggle panels
toggleEditorBtn.addEventListener("click", () => {
  editorPanel.classList.toggle("hidden");
  toggleEditorBtn.classList.toggle("active");
  if (
    !previewPanel.classList.contains("hidden") &&
    editorPanel.classList.contains("hidden")
  ) {
    previewPanel.style.flex = "1";
  } else if (
    !editorPanel.classList.contains("hidden") &&
    !previewPanel.classList.contains("hidden")
  ) {
    editorPanel.style.flex = "1";
    previewPanel.style.flex = "1";
  }
});

togglePreviewBtn.addEventListener("click", () => {
  previewPanel.classList.toggle("hidden");
  togglePreviewBtn.classList.toggle("active");
  if (
    !editorPanel.classList.contains("hidden") &&
    previewPanel.classList.contains("hidden")
  ) {
    editorPanel.style.flex = "1";
  } else if (
    !editorPanel.classList.contains("hidden") &&
    !previewPanel.classList.contains("hidden")
  ) {
    editorPanel.style.flex = "1";
    previewPanel.style.flex = "1";
  }
});

// Save functionality
async function saveFile() {
  if (!codeEditor) return;
  const result = await ipcRenderer.invoke("save-file", {
    content: codeEditor.getValue(),
    filePath: currentFilePath,
  });

  if (result) {
    currentFilePath = result;
    hasUnsavedChanges = false;
    updateTitle();
  }
}

async function saveAsFile() {
  if (!codeEditor) return;
  const result = await ipcRenderer.invoke("save-as-file", codeEditor.getValue());

  if (result) {
    currentFilePath = result;
    hasUnsavedChanges = false;
    updateTitle();
  }
}

saveBtn.addEventListener("click", saveFile);

openBtn.addEventListener("click", () => {
  ipcRenderer.send("open-file-dialog");
});

// IPC event handlers
ipcRenderer.on("file-opened", (event, { content, filePath }) => {
  if (codeEditor) {
    codeEditor.setValue(content);
    // CRITICAL: Clear undo history so Ctrl+Z doesn't revert to default text
    codeEditor.clearHistory();
    currentFilePath = filePath;
    hasUnsavedChanges = false;
    updatePreview();
    updateTitle();
  }
});

ipcRenderer.on("new-file", () => {
  if (codeEditor) {
    codeEditor.setValue("");
    // Clear undo history for new files too
    codeEditor.clearHistory();
    currentFilePath = null;
    hasUnsavedChanges = false;
    updatePreview();
    updateTitle();
  }
});

ipcRenderer.on("save-file", saveFile);
ipcRenderer.on("save-as-file", saveAsFile);

ipcRenderer.on("toggle-preview", () => {
  togglePreviewBtn.click();
});

ipcRenderer.on("toggle-editor", () => {
  toggleEditorBtn.click();
});

ipcRenderer.on("set-theme", (event, themeName) => {
  themeSelect.value = themeName;
  if (themeName === "custom") {
    themeModal.style.display = "block";
    loadCustomThemeValues();
  } else {
    applyTheme(themeName);
    savePreferences();
  }
});

ipcRenderer.on("toggle-sync-scroll", () => {
  syncScrollCheckbox.checked = !syncScrollCheckbox.checked;
  savePreferences();
});

const showLinesCheckbox = document.getElementById("showLines");
if (showLinesCheckbox) {
  ipcRenderer.on("toggle-show-lines", () => {
    showLinesCheckbox.checked = !showLinesCheckbox.checked;
    savePreferences();
  });
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case "s":
        e.preventDefault();
        saveFile();
        break;
      case "S":
        e.preventDefault();
        saveAsFile();
        break;
      case "l":
        e.preventDefault();
        if (showLinesCheckbox) {
          showLinesCheckbox.checked = !showLinesCheckbox.checked;
        }
        break;
      case "L":
        e.preventDefault();
        if (showLinesCheckbox) {
          showLinesCheckbox.checked = !showLinesCheckbox.checked;
        }
        break;
    }
  }
});

// Save preferences on change
syncScrollCheckbox.addEventListener("change", savePreferences);

// Initialize CodeMirror 6 with ALL VS Code features using CommonJS!
function initializeCodeEditor() {
  try {
    // Load CodeMirror 6 modules using require (works in Electron)
    const { EditorView, basicSetup } = require('codemirror');
    const { EditorState } = require('@codemirror/state');
    const { markdown } = require('@codemirror/lang-markdown');
    const { oneDark } = require('@codemirror/theme-one-dark');
    const { 
      searchKeymap, 
      highlightSelectionMatches, 
      search,
      selectNextOccurrence 
    } = require('@codemirror/search');
    const { 
      defaultKeymap, 
      history, 
      historyKeymap,
      indentWithTab,
      selectLine,
      copyLineUp,
      copyLineDown,
      deleteLine,
      moveLineUp,
      moveLineDown
    } = require('@codemirror/commands');
    const { keymap } = require('@codemirror/view');
    const { autocompletion, completionKeymap } = require('@codemirror/autocomplete');

    // VS Code-like extensions with ALL features
    const extensions = [
      basicSetup,
      markdown(),
      oneDark,
      history(),
      search({ top: true }),
      highlightSelectionMatches(),
      autocompletion(),
      keymap.of([
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...completionKeymap,
        indentWithTab,
        // VS Code shortcuts
        { key: "Ctrl-s", run: () => { saveFile(); return true; } },
        { key: "Cmd-s", run: () => { saveFile(); return true; } },
        { key: "Ctrl-d", run: selectNextOccurrence }, // Multi-selection like VS Code
        { key: "Cmd-d", run: selectNextOccurrence },
        { key: "Ctrl-l", run: selectLine }, // Select line
        { key: "Cmd-l", run: selectLine },
        { key: "Shift-Alt-Up", run: copyLineUp }, // Duplicate line up
        { key: "Shift-Alt-Down", run: copyLineDown }, // Duplicate line down
        { key: "Ctrl-Shift-k", run: deleteLine }, // Delete line
        { key: "Cmd-Shift-k", run: deleteLine },
        { key: "Alt-Up", run: moveLineUp }, // Move line up
        { key: "Alt-Down", run: moveLineDown }, // Move line down
        { key: "Ctrl-f", run: () => { 
          // Focus search - CodeMirror 6 handles this automatically
          return false; 
        }},
      ]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          updatePreview();
          markAsModified();
        }
      }),
      // Theme integration
      EditorView.theme({
        '&': {
          height: '100%'
        },
        '.cm-scroller': {
          'font-family': 'Consolas, Monaco, Courier New, monospace',
          'font-size': '14px'
        }
      })
    ];

    const initialDoc = `# Start typing your markdown here...

## Welcome to Markdown Editor

Start typing to see a live preview on the right.

### Features
- 🔍 **Search & Replace** (Ctrl+F / Ctrl+H)
- ⚡ **Multi-selection** (Ctrl+D like VS Code)
- 📋 **Duplicate lines** (Shift+Alt+Up/Down)
- ⬆️ **Move lines** (Alt+Up/Down)
- 🗑️ **Delete line** (Ctrl+Shift+K)
- 🔄 **Auto-completion**
- 🎯 **All VS Code shortcuts**

\`\`\`javascript
// Advanced code editing with VS Code features
console.log('Hello, advanced Markdown editor!');
\`\`\``;

    const state = EditorState.create({
      doc: initialDoc,
      extensions: extensions
    });

    codeEditor = new EditorView({
      state,
      parent: document.getElementById('editor')
    });

    // Add getValue and setValue methods for compatibility
    codeEditor.getValue = () => codeEditor.state.doc.toString();
    codeEditor.setValue = (value) => {
      codeEditor.dispatch({
        changes: {
          from: 0,
          to: codeEditor.state.doc.length,
          insert: value
        }
      });
    };
    codeEditor.clearHistory = () => {
      // Clear history by recreating the state
      const newState = EditorState.create({
        doc: codeEditor.state.doc.toString(),
        extensions: extensions
      });
      codeEditor.setState(newState);
    };

    console.log('CodeMirror 6 Editor with ALL VS Code features initialized successfully!');
    console.log('Available shortcuts:');
    console.log('- Ctrl+F: Search');
    console.log('- Ctrl+H: Search & Replace'); 
    console.log('- Ctrl+D: Multi-selection (like VS Code)');
    console.log('- Shift+Alt+Up/Down: Duplicate line');
    console.log('- Alt+Up/Down: Move line');
    console.log('- Ctrl+Shift+K: Delete line');
    console.log('- Ctrl+L: Select line');
    
    // Set up scroll synchronization for CodeMirror 6
    const cmScrollContainer = codeEditor.scrollDOM;
    if (cmScrollContainer && preview) {
      cmScrollContainer.addEventListener("scroll", () => {
        syncScroll(cmScrollContainer, preview);
      });
      
      preview.addEventListener("scroll", () => {
        syncScroll(preview, cmScrollContainer);
      });
    }
    
    // Initial setup
    loadPreferences();
    updatePreview();
    
  } catch (error) {
    console.error('CodeMirror 6 failed to load:', error);
    console.log('Falling back to simple textarea...');
    
    // Fallback to textarea if CodeMirror 6 fails
    const editorDiv = document.getElementById('editor');
    editorDiv.innerHTML = `<textarea id="fallback-textarea" style="width: 100%; height: 100%; border: none; outline: none; padding: 20px; font-family: Consolas, Monaco, Courier New, monospace; font-size: 14px; background: var(--bg-primary); color: var(--text-primary); resize: none; line-height: 1.6;"># Start typing your markdown here...

## Welcome to Markdown Editor

Start typing to see a live preview on the right.

### Features
- 🎨 Multiple themes (Dark, Light, Monokai, Dracula, etc.)
- 🎯 Custom theme creator
- 🔄 Synchronized scrolling
- 📝 Live preview
- 💾 File association support

\`\`\`javascript
// Code blocks are supported
console.log('Hello, Markdown!');
\`\`\`</textarea>`;

    const textarea = document.getElementById('fallback-textarea');
    
    // Add textarea functionality
    codeEditor = {
      getValue: () => textarea.value,
      setValue: (value) => { textarea.value = value; },
      clearHistory: () => {} // No history in textarea
    };
    
    textarea.addEventListener('input', () => {
      updatePreview();
      markAsModified();
    });
    
    // Set up scroll synchronization for textarea fallback
    if (textarea && preview) {
      textarea.addEventListener("scroll", () => {
        syncScroll(textarea, preview);
      });
      
      preview.addEventListener("scroll", () => {
        syncScroll(preview, textarea);
      });
    }
    
    loadPreferences();
    updatePreview();
  }
}

// Initialize CodeMirror 6
initializeCodeEditor();