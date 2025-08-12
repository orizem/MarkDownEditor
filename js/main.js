const { ipcRenderer } = require("electron");
const path = require("path");
const fs = require("fs");

let codeEditor = null;
const editorContainer = document.getElementById("editorContainer");
const preview = document.getElementById("preview");
const fileName = document.getElementById("fileName");
const wordCount = document.getElementById("wordCount");
const autoSaveStatus = document.getElementById("autoSaveStatus");
const toggleOutlineBtn = document.getElementById("toggleOutline");
const toggleEditorBtn = document.getElementById("toggleEditor");
const togglePreviewBtn = document.getElementById("togglePreview");
const outlinePanel = document.getElementById("outlinePanel");
const editorPanel = document.getElementById("editorPanel");
const previewPanel = document.getElementById("previewPanel");
const outline = document.getElementById("outline");
const outlineToggle = document.getElementById("outlineToggle");
const editorToggle = document.getElementById("editorToggle");
const previewToggle = document.getElementById("previewToggle");
const themeSelect = document.getElementById("themeSelect");
const syncScrollCheckbox = document.getElementById("syncScroll");
const autoSaveToggle = document.getElementById("autoSaveToggle");
const themeModal = document.getElementById("themeModal");
const closeModalBtn = document.querySelector(".close-modal");
const applyThemeBtn = document.getElementById("applyTheme");
const resetThemeBtn = document.getElementById("resetTheme");

// Search panel elements
const searchPanel = document.getElementById("searchPanel");
const searchClose = document.getElementById("searchClose");
const searchInput = document.getElementById("searchInput");
const replaceInput = document.getElementById("replaceInput");
const caseToggle = document.getElementById("caseToggle");
const regexToggle = document.getElementById("regexToggle");
const wholeWordToggle = document.getElementById("wholeWordToggle");
const findPrev = document.getElementById("findPrev");
const findNext = document.getElementById("findNext");
const replaceBtn = document.getElementById("replaceBtn");
const replaceAllBtn = document.getElementById("replaceAllBtn");
const searchResults = document.getElementById("searchResults");

// Tab system elements
const tabContainer = document.getElementById("tabContainer");
const newTabBtn = document.getElementById("newTabBtn");
const scrollLeftBtn = document.getElementById("scrollLeftBtn");
const scrollRightBtn = document.getElementById("scrollRightBtn");

// Window control elements
const minimizeBtn = document.getElementById("minimizeBtn");
const maximizeBtn = document.getElementById("maximizeBtn");
const closeBtn = document.getElementById("closeBtn");
const appTitle = document.getElementById("appTitle");

// Resize handle elements
const outlineResizeHandle = document.getElementById("outlineResizeHandle");
const editorResizeHandle = document.getElementById("editorResizeHandle");

// These will be moved to tab-specific data
let isUpdatingScroll = false;
let currentFilePath = null;

// Auto-save functionality
let autoSaveInterval = null;
let autoSaveTimeout = null;
let isAutoSaveEnabled = true; // Auto-save enabled by default
const AUTO_SAVE_DELAY = 3000; // 3 seconds after stopping typing
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds maximum interval

// Advanced search functionality
let searchState = {
  query: '',
  matches: [],
  currentMatch: -1,
  caseSensitive: false,
  useRegex: false,
  wholeWord: false
};

// Tab management system
let tabSystem = {
  tabs: [],
  activeTabIndex: -1,
  nextTabId: 1
};

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
      if (prefs.autoSave !== undefined) {
        autoSaveToggle.checked = prefs.autoSave;
        isAutoSaveEnabled = prefs.autoSave;
      }
      if (prefs.panelSizes) {
        // Load outline size independently
        if (prefs.panelSizes.outline && outlinePanel && !outlinePanel.style.width) {
          outlinePanel.style.width = prefs.panelSizes.outline + 'px';
        }
        // Load editor width independently  
        if (prefs.panelSizes.editor && editorPanel && !editorPanel.style.width) {
          editorPanel.style.width = prefs.panelSizes.editor + 'px';
          editorPanel.style.flex = 'none';
        }
      }
    }
  } catch (err) {
    console.error("Error loading preferences:", err);
  }
}

// Helper function to get flex-basis percentage
function getFlexBasisPercentage(element) {
  if (!element) return null;
  const flexBasis = window.getComputedStyle(element).flexBasis;
  if (flexBasis && flexBasis.includes('%')) {
    return parseFloat(flexBasis);
  }
  // Only calculate if we have custom flex properties set
  if (element.style.flexBasis) {
    const container = document.querySelector('.container');
    const outlineWidth = outlinePanel.classList.contains('hidden') ? 0 : outlinePanel.offsetWidth;
    const availableWidth = container.offsetWidth - outlineWidth;
    return (element.offsetWidth / availableWidth) * 100;
  }
  return null;
}

// Save preferences
function savePreferences() {
  // Don't save preferences while resizing to prevent interference
  if (outlineResizing || editorResizing) {
    return;
  }
  
  const prefsPath = path.join(
    require("os").homedir(),
    ".markdown-editor-prefs.json"
  );
  const prefs = {
    theme: themeSelect.value,
    customTheme: themes.custom || null,
    syncScroll: syncScrollCheckbox.checked,
    autoSave: autoSaveToggle.checked,
    panelSizes: {
      outline: (outlinePanel && outlinePanel.style.width) ? outlinePanel.offsetWidth : null,
      editor: (editorPanel && editorPanel.style.width) ? editorPanel.offsetWidth : null
    }
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
  
  // Configure marked to generate proper heading IDs (same logic as outline)
  const renderer = new marked.Renderer();
  renderer.heading = function(text, level) {
    const id = text.toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with dashes
      .replace(/-+/g, '-')      // Replace multiple dashes with single
      .replace(/^-|-$/g, '');   // Remove leading/trailing dashes
    return `<h${level} id="${id}">${text}</h${level}>`;
  };
  
  preview.innerHTML = marked.parse(markdown, { renderer: renderer });
  updateWordCount();
  updateOutline(markdown);
}

// Update outline/table of contents
function updateOutline(markdown) {
  if (!outline) return;
  
  // Extract headers from markdown
  const headerRegex = /^(#{1,6})\s+(.+)$/gm;
  const headers = [];
  let match;
  
  while ((match = headerRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    
    // Improved ID generation - handle more special cases
    const id = text.toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with dashes
      .replace(/-+/g, '-')      // Replace multiple dashes with single
      .replace(/^-|-$/g, '');   // Remove leading/trailing dashes
    
    // More accurate line calculation
    const beforeMatch = markdown.substring(0, match.index);
    const line = beforeMatch.split('\n').length;
    
    headers.push({
      level,
      text,
      id,
      line
    });
  }
  
  // Generate outline HTML
  if (headers.length === 0) {
    outline.innerHTML = '<div style="color: var(--text-tertiary); font-style: italic; text-align: center; padding: 20px;">No headers found</div>';
    return;
  }
  
  outline.innerHTML = headers.map(header => 
    `<div class="outline-item h${header.level}" data-line="${header.line}" data-id="${header.id}">
      ${header.text}
    </div>`
  ).join('');
}


// Scroll preview to specific heading
function scrollPreviewToHeading(headerId) {
  if (!preview) return;
  
  // Find the heading element by ID in the preview
  let targetElement = preview.querySelector(`#${headerId}`);
  
  // If exact ID not found, try to find a heading with similar text content
  if (!targetElement) {
    const headings = preview.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const searchText = headerId.replace(/-/g, ' ').toLowerCase();
    
    for (const heading of headings) {
      if (heading.textContent.toLowerCase().includes(searchText)) {
        targetElement = heading;
        break;
      }
    }
  }
  
  if (targetElement) {
    // Calculate the target scroll position to center the heading
    const elementTop = targetElement.offsetTop;
    const previewHeight = preview.clientHeight;
    const targetScrollTop = Math.max(0, elementTop - previewHeight / 4);
    
    // Set scroll position directly for immediate effect
    preview.scrollTop = targetScrollTop;
  }
}

// Advanced Search Functions
function showSearchPanel() {
  if (searchPanel) {
    searchPanel.classList.remove('hidden');
    searchInput.focus();
  }
}

function hideSearchPanel() {
  if (searchPanel) {
    searchPanel.classList.add('hidden');
    clearSearchHighlights();
  }
}

function performSearch() {
  if (!codeEditor || !searchInput.value) {
    searchState.matches = [];
    searchState.currentMatch = -1;
    updateSearchResults();
    return;
  }

  const query = searchInput.value;
  const content = codeEditor.getValue();
  
  searchState.query = query;
  searchState.matches = [];

  try {
    let searchRegex;
    
    if (searchState.useRegex) {
      const flags = searchState.caseSensitive ? 'g' : 'gi';
      searchRegex = new RegExp(query, flags);
    } else {
      let escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      if (searchState.wholeWord) {
        escapedQuery = '\\b' + escapedQuery + '\\b';
      }
      
      const flags = searchState.caseSensitive ? 'g' : 'gi';
      searchRegex = new RegExp(escapedQuery, flags);
    }

    let match;
    while ((match = searchRegex.exec(content)) !== null) {
      searchState.matches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[0]
      });
      
      if (searchRegex.lastIndex === match.index) {
        break; // Prevent infinite loop on zero-length matches
      }
    }

    searchState.currentMatch = searchState.matches.length > 0 ? 0 : -1;
    
  } catch (error) {
    console.error('Search regex error:', error);
    searchState.matches = [];
    searchState.currentMatch = -1;
  }

  updateSearchResults();
  highlightCurrentMatch();
}

function findNextMatch() {
  if (searchState.matches.length === 0) return;
  
  searchState.currentMatch = (searchState.currentMatch + 1) % searchState.matches.length;
  updateSearchResults();
  selectCurrentMatch(); // Use selection when explicitly navigating
}

function findPreviousMatch() {
  if (searchState.matches.length === 0) return;
  
  searchState.currentMatch = searchState.currentMatch <= 0 ? 
    searchState.matches.length - 1 : 
    searchState.currentMatch - 1;
  updateSearchResults();
  selectCurrentMatch(); // Use selection when explicitly navigating
}

function highlightCurrentMatch() {
  if (!codeEditor || searchState.currentMatch === -1 || !searchState.matches[searchState.currentMatch]) return;
  
  const match = searchState.matches[searchState.currentMatch];
  
  if (codeEditor.dispatch && codeEditor.state) {
    // CodeMirror 6 - Just scroll to the match without selecting or focusing
    const pos = Math.min(match.start, codeEditor.state.doc.length);
    
    // Scroll to the position without changing selection or focus
    codeEditor.dispatch({
      effects: codeEditor.scrollIntoView(pos, { y: "center" })
    });
    
  } else if (codeEditor.scrollTop !== undefined) {
    // Textarea fallback - scroll without changing focus or selection
    const content = codeEditor.value;
    const beforeMatch = content.substring(0, match.start);
    const lineNumber = beforeMatch.split('\n').length;
    const lineHeight = parseInt(getComputedStyle(codeEditor).lineHeight) || 20;
    
    // Scroll to show the match in the middle of the viewport
    const containerHeight = codeEditor.clientHeight;
    const targetScroll = Math.max(0, (lineNumber - Math.floor(containerHeight / lineHeight / 2)) * lineHeight);
    
    codeEditor.scrollTop = targetScroll;
  }
}

function selectCurrentMatch() {
  if (!codeEditor || searchState.currentMatch === -1 || !searchState.matches[searchState.currentMatch]) return;
  
  const match = searchState.matches[searchState.currentMatch];
  
  if (codeEditor.dispatch && codeEditor.state) {
    // CodeMirror 6 - Select and scroll to match
    codeEditor.dispatch({
      selection: { anchor: match.start, head: match.end },
      effects: codeEditor.scrollIntoView({ from: match.start, to: match.end }, { y: "center" })
    });
    codeEditor.focus();
    
  } else if (codeEditor.selectionStart !== undefined) {
    // Textarea fallback - select and scroll
    codeEditor.selectionStart = match.start;
    codeEditor.selectionEnd = match.end;
    codeEditor.focus();
    
    // Scroll to match
    const content = codeEditor.value;
    const beforeMatch = content.substring(0, match.start);
    const lineNumber = beforeMatch.split('\n').length;
    const lineHeight = parseInt(getComputedStyle(codeEditor).lineHeight) || 20;
    
    const containerHeight = codeEditor.clientHeight;
    const targetScroll = Math.max(0, (lineNumber - Math.floor(containerHeight / lineHeight / 2)) * lineHeight);
    
    codeEditor.scrollTop = targetScroll;
  }
}

function clearSearchHighlights() {
  // Clear any existing highlights - implementation depends on editor type
  searchState.matches = [];
  searchState.currentMatch = -1;
  updateSearchResults();
}

function updateSearchResults() {
  if (searchResults) {
    if (searchState.matches.length === 0) {
      searchResults.textContent = searchState.query ? 'No results' : '0 of 0';
    } else {
      searchResults.textContent = `${searchState.currentMatch + 1} of ${searchState.matches.length}`;
    }
  }
}

function performReplace() {
  if (searchState.currentMatch === -1 || !replaceInput.value) return;
  
  const match = searchState.matches[searchState.currentMatch];
  const replaceText = replaceInput.value;
  
  if (codeEditor.dispatch) {
    // CodeMirror 6
    codeEditor.dispatch({
      changes: { from: match.start, to: match.end, insert: replaceText }
    });
  } else if (codeEditor.setValue) {
    // Textarea fallback
    const content = codeEditor.getValue();
    const newContent = content.substring(0, match.start) + 
                      replaceText + 
                      content.substring(match.end);
    codeEditor.setValue(newContent);
  }
  
  // Refresh search after replace
  performSearch();
}

function performReplaceAll() {
  if (searchState.matches.length === 0 || !replaceInput.value) return;
  
  const replaceText = replaceInput.value;
  const content = codeEditor.getValue();
  
  // Sort matches by position (descending) to avoid offset issues
  const sortedMatches = [...searchState.matches].sort((a, b) => b.start - a.start);
  
  if (codeEditor.dispatch) {
    // CodeMirror 6
    const changes = sortedMatches.map(match => ({
      from: match.start,
      to: match.end,
      insert: replaceText
    }));
    
    codeEditor.dispatch({ changes });
  } else if (codeEditor.setValue) {
    // Textarea fallback
    let newContent = content;
    
    for (const match of sortedMatches) {
      newContent = newContent.substring(0, match.start) + 
                   replaceText + 
                   newContent.substring(match.end);
    }
    
    codeEditor.setValue(newContent);
  }
  
  // Clear search after replace all
  searchState.matches = [];
  searchState.currentMatch = -1;
  updateSearchResults();
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

// Tab Management Functions
function createNewTab(title = "Untitled.md", content = "", filePath = null) {
  const tab = {
    id: tabSystem.nextTabId++,
    title: title,
    content: content,
    filePath: filePath,
    hasUnsavedChanges: false,
    isActive: false
  };
  
  tabSystem.tabs.push(tab);
  renderTabs();
  switchToTab(tabSystem.tabs.length - 1);
  
  return tab;
}

function switchToTab(index) {
  if (index < 0 || index >= tabSystem.tabs.length) return;
  
  // Save current tab's content if there's an active tab
  if (tabSystem.activeTabIndex !== -1 && codeEditor) {
    const activeTab = tabSystem.tabs[tabSystem.activeTabIndex];
    if (activeTab) {
      activeTab.content = codeEditor.getValue();
    }
  }
  
  // Switch to new tab
  tabSystem.activeTabIndex = index;
  const newActiveTab = tabSystem.tabs[index];
  
  // Update UI
  if (codeEditor) {
    codeEditor.setValue(newActiveTab.content);
    codeEditor.clearHistory(); // Clear undo history when switching tabs
  }
  
  // Update status
  updateTitle();
  updatePreview();
  updateWordCount();
  
  // Update tab visual state
  renderTabs();
}

function closeTab(index) {
  if (index < 0 || index >= tabSystem.tabs.length) return;
  
  const tab = tabSystem.tabs[index];
  
  // Check for unsaved changes
  if (tab.hasUnsavedChanges) {
    // In a real implementation, you'd show a confirmation dialog
    // For now, we'll just close it
  }
  
  // Remove tab
  tabSystem.tabs.splice(index, 1);
  
  // Adjust active tab index
  if (tabSystem.activeTabIndex === index) {
    // If closing the active tab, switch to adjacent tab
    if (tabSystem.tabs.length === 0) {
      // No tabs left, create a new one
      createNewTab();
      return;
    } else if (index === tabSystem.tabs.length) {
      // Closed the last tab, switch to the previous one
      tabSystem.activeTabIndex = index - 1;
    }
    // If closed tab was not the last one, activeTabIndex stays the same
    // which effectively switches to the next tab
  } else if (tabSystem.activeTabIndex > index) {
    // Closing a tab before the active one, adjust the index
    tabSystem.activeTabIndex--;
  }
  
  renderTabs();
  if (tabSystem.activeTabIndex >= 0) {
    // Force reload the current tab content after closing another tab
    const activeTab = tabSystem.tabs[tabSystem.activeTabIndex];
    if (activeTab && codeEditor) {
      codeEditor.setValue(activeTab.content);
      updateTitle();
      updatePreview();
      updateWordCount();
    }
  }
}

// Tab scrolling functionality
function updateScrollButtons() {
  if (!scrollLeftBtn || !scrollRightBtn || !tabContainer) return;
  
  const canScrollLeft = tabContainer.scrollLeft > 0;
  const canScrollRight = tabContainer.scrollLeft < (tabContainer.scrollWidth - tabContainer.clientWidth);
  
  scrollLeftBtn.disabled = !canScrollLeft;
  scrollRightBtn.disabled = !canScrollRight;
  
  // Show/hide scroll buttons based on whether scrolling is needed
  const needsScrolling = tabContainer.scrollWidth > tabContainer.clientWidth;
  scrollLeftBtn.style.display = needsScrolling ? 'flex' : 'none';
  scrollRightBtn.style.display = needsScrolling ? 'flex' : 'none';
}

function scrollTabsLeft() {
  if (tabContainer) {
    tabContainer.scrollBy({
      left: -120,
      behavior: 'smooth'
    });
  }
}

function scrollTabsRight() {
  if (tabContainer) {
    tabContainer.scrollBy({
      left: 120,
      behavior: 'smooth'
    });
  }
}

function scrollToActiveTab() {
  if (!tabContainer || tabSystem.activeTabIndex === -1) return;
  
  const activeTab = tabContainer.children[tabSystem.activeTabIndex];
  if (!activeTab) return;
  
  const containerWidth = tabContainer.clientWidth;
  const containerScrollWidth = tabContainer.scrollWidth;
  
  // If all tabs fit in the container, no need to scroll
  if (containerScrollWidth <= containerWidth) return;
  
  const tabLeft = activeTab.offsetLeft;
  const tabWidth = activeTab.offsetWidth;
  const tabRight = tabLeft + tabWidth;
  
  const scrollLeft = tabContainer.scrollLeft;
  const scrollRight = scrollLeft + containerWidth;
  
  const padding = 20; // Space to leave around the focused tab
  
  // Check if tab is fully visible with some padding
  if (tabLeft < scrollLeft + padding) {
    // Tab is cut off on the left or too close to left edge, scroll left to show it
    tabContainer.scrollTo({
      left: Math.max(0, tabLeft - padding),
      behavior: 'smooth'
    });
  } else if (tabRight > scrollRight - padding) {
    // Tab is cut off on the right or too close to right edge, scroll right to show it  
    tabContainer.scrollTo({
      left: Math.min(containerScrollWidth - containerWidth, tabRight - containerWidth + padding),
      behavior: 'smooth'
    });
  }
}

function renderTabs() {
  if (!tabContainer) return;
  
  tabContainer.innerHTML = '';
  
  tabSystem.tabs.forEach((tab, index) => {
    const tabElement = document.createElement('div');
    tabElement.className = `tab ${index === tabSystem.activeTabIndex ? 'active' : ''} ${tab.hasUnsavedChanges ? 'modified' : ''}`;
    tabElement.draggable = true;
    tabElement.dataset.tabIndex = index;
    
    const tabTitle = document.createElement('span');
    tabTitle.className = 'tab-title';
    tabTitle.textContent = tab.title;
    tabTitle.title = tab.filePath || tab.title;
    
    const tabClose = document.createElement('button');
    tabClose.className = 'tab-close';
    tabClose.innerHTML = '×';
    tabClose.title = 'Close Tab';
    
    // Tab click handler
    tabElement.addEventListener('click', (e) => {
      if (e.target !== tabClose) {
        switchToTab(index);
      }
    });

    // Tab middle-click handler to close tab
    tabElement.addEventListener('mousedown', (e) => {
      if (e.button === 1) { // Middle mouse button
        e.preventDefault();
        closeTab(index);
      }
    });
    
    // Tab close handler
    tabClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeTab(index);
    });
    
    // Drag and drop handlers
    tabElement.addEventListener('dragstart', handleTabDragStart);
    tabElement.addEventListener('dragover', handleTabDragOver);
    tabElement.addEventListener('drop', handleTabDrop);
    tabElement.addEventListener('dragend', handleTabDragEnd);
    tabElement.addEventListener('dragenter', handleTabDragEnter);
    tabElement.addEventListener('dragleave', handleTabDragLeave);
    
    tabElement.appendChild(tabTitle);
    tabElement.appendChild(tabClose);
    tabContainer.appendChild(tabElement);
  });
  
  // Update scroll buttons and focus on active tab after rendering tabs
  setTimeout(() => {
    updateScrollButtons();
    scrollToActiveTab();
  }, 0);
}

function updateTitle() {
  const activeTab = getCurrentTab();
  if (activeTab && fileName) {
    fileName.textContent = activeTab.hasUnsavedChanges ? `${activeTab.title} •` : activeTab.title;
    // Update app title bar
    if (appTitle) {
      const titleText = activeTab.hasUnsavedChanges ? `${activeTab.title} • - Markdown Editor` : `${activeTab.title} - Markdown Editor`;
      appTitle.textContent = titleText;
    }
  } else if (appTitle) {
    appTitle.textContent = "Markdown Editor";
  }
}

function getCurrentTab() {
  if (tabSystem.activeTabIndex >= 0 && tabSystem.activeTabIndex < tabSystem.tabs.length) {
    return tabSystem.tabs[tabSystem.activeTabIndex];
  }
  return null;
}

function markCurrentTabAsModified() {
  const activeTab = getCurrentTab();
  if (activeTab && !activeTab.hasUnsavedChanges) {
    activeTab.hasUnsavedChanges = true;
    updateTitle();
    renderTabs();
  }
  // Schedule auto-save when content changes
  scheduleAutoSave();
}

// Mark file as modified (updated for tab system)
function markAsModified() {
  markCurrentTabAsModified();
}

// Update window title (this will be overridden by the tab system)
// The new updateTitle function is now part of the tab management system

// Auto-save functions
function scheduleAutoSave() {
  // Clear existing timeout
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }
  
  // Only auto-save if enabled and we have a file path (don't auto-save new untitled files)
  const activeTab = getCurrentTab();
  if (isAutoSaveEnabled && activeTab && activeTab.filePath && activeTab.hasUnsavedChanges) {
    autoSaveTimeout = setTimeout(() => {
      autoSave();
    }, AUTO_SAVE_DELAY);
  }
}

async function autoSave() {
  const activeTab = getCurrentTab();
  if (!isAutoSaveEnabled || !activeTab || !activeTab.filePath || !activeTab.hasUnsavedChanges || !codeEditor) return;
  
  // Show saving status
  if (autoSaveStatus) {
    autoSaveStatus.textContent = 'Auto-save: Saving...';
    autoSaveStatus.className = 'auto-save-status saving';
  }
  
  try {
    const content = codeEditor.getValue();
    const result = await ipcRenderer.invoke("auto-save-file", {
      content: content,
      filePath: activeTab.filePath,
    });
    
    if (result) {
      activeTab.hasUnsavedChanges = false;
      activeTab.content = content;
      updateTitle();
      renderTabs();
      
      // Show saved status
      if (autoSaveStatus) {
        autoSaveStatus.textContent = 'Auto-save: Saved';
        autoSaveStatus.className = 'auto-save-status saved';
        
        // Reset to ready after 2 seconds
        setTimeout(() => {
          if (autoSaveStatus) {
            autoSaveStatus.textContent = 'Auto-save: Ready';
            autoSaveStatus.className = 'auto-save-status';
          }
        }, 2000);
      }
      
      console.log('Auto-saved successfully');
    }
  } catch (error) {
    console.error('Auto-save failed:', error);
    
    // Show error status
    if (autoSaveStatus) {
      autoSaveStatus.textContent = 'Auto-save: Error';
      autoSaveStatus.className = 'auto-save-status error';
      
      // Reset to ready after 3 seconds
      setTimeout(() => {
        if (autoSaveStatus) {
          autoSaveStatus.textContent = 'Auto-save: Ready';
          autoSaveStatus.className = 'auto-save-status';
        }
      }, 3000);
    }
  }
}

function startAutoSaveInterval() {
  // Set up periodic auto-save as backup
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }
  
  autoSaveInterval = setInterval(() => {
    const activeTab = getCurrentTab();
    if (isAutoSaveEnabled && activeTab && activeTab.filePath && activeTab.hasUnsavedChanges) {
      autoSave();
    }
  }, AUTO_SAVE_INTERVAL);
}

function stopAutoSave() {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = null;
  }
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
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
toggleOutlineBtn.addEventListener("click", () => {
  outlinePanel.classList.toggle("hidden");
  toggleOutlineBtn.classList.toggle("active");
});

// Panel close buttons
if (outlineToggle) {
  outlineToggle.addEventListener("click", () => {
    outlinePanel.classList.add("hidden");
    toggleOutlineBtn.classList.remove("active");
  });
}

if (editorToggle) {
  editorToggle.addEventListener("click", () => {
    editorPanel.classList.add("hidden");
    toggleEditorBtn.classList.remove("active");
    // Trigger the same logic as the toolbar button
    if (!previewPanel.classList.contains("hidden")) {
      previewPanel.style.flex = "1";
    }
  });
}

if (previewToggle) {
  previewToggle.addEventListener("click", () => {
    previewPanel.classList.add("hidden");
    togglePreviewBtn.classList.remove("active");
    // When preview is hidden, editor should stretch fully
    if (!editorPanel.classList.contains("hidden")) {
      editorPanel.style.width = ""; // Clear any custom width
      editorPanel.style.flex = "1"; // Stretch to fill available space
    }
  });
}

toggleEditorBtn.addEventListener("click", () => {
  editorPanel.classList.toggle("hidden");
  toggleEditorBtn.classList.toggle("active");
  
  // Only reset editor and preview panels - don't touch outline panel
  if (
    !previewPanel.classList.contains("hidden") &&
    editorPanel.classList.contains("hidden")
  ) {
    // Editor is hidden, preview takes all space
    previewPanel.style.flex = "1";
  } else if (
    !editorPanel.classList.contains("hidden") &&
    !previewPanel.classList.contains("hidden")
  ) {
    // Both visible - restore previous behavior
    const savedWidth = editorPanel.getAttribute('data-custom-width');
    if (savedWidth) {
      // Restore custom width
      editorPanel.style.width = savedWidth;
      editorPanel.style.flex = "none";
    } else {
      // Use default flex behavior
      editorPanel.style.flex = "1";
    }
    previewPanel.style.flex = "1";
  }
});

togglePreviewBtn.addEventListener("click", () => {
  previewPanel.classList.toggle("hidden");
  togglePreviewBtn.classList.toggle("active");
  
  // Only reset editor and preview panels - don't touch outline panel
  if (
    !editorPanel.classList.contains("hidden") &&
    previewPanel.classList.contains("hidden")
  ) {
    // Preview is hidden, editor stretches to fill all available space
    editorPanel.style.width = ""; // Clear any custom width
    editorPanel.style.flex = "1"; // Stretch to fill available space
  } else if (
    !editorPanel.classList.contains("hidden") &&
    !previewPanel.classList.contains("hidden")
  ) {
    // Both visible - restore previous behavior
    // Check if editor had a custom width from resizing
    const savedWidth = editorPanel.getAttribute('data-custom-width');
    if (savedWidth) {
      // Restore custom width
      editorPanel.style.width = savedWidth;
      editorPanel.style.flex = "none";
    } else {
      // Use default flex behavior
      editorPanel.style.flex = "1";
    }
    previewPanel.style.flex = "1";
  }
});

// Save functionality
async function saveFile() {
  if (!codeEditor) return;
  const activeTab = getCurrentTab();
  if (!activeTab) return;
  
  const result = await ipcRenderer.invoke("save-file", {
    content: codeEditor.getValue(),
    filePath: activeTab.filePath,
  });

  if (result) {
    activeTab.filePath = result;
    activeTab.hasUnsavedChanges = false;
    activeTab.title = path.basename(result);
    activeTab.content = codeEditor.getValue();
    updateTitle();
    renderTabs();
  }
}

async function saveAsFile() {
  if (!codeEditor) return;
  const activeTab = getCurrentTab();
  if (!activeTab) return;
  
  const result = await ipcRenderer.invoke("save-as-file", codeEditor.getValue());

  if (result) {
    activeTab.filePath = result;
    activeTab.hasUnsavedChanges = false;
    activeTab.title = path.basename(result);
    activeTab.content = codeEditor.getValue();
    updateTitle();
    renderTabs();
  }
}



// IPC event handlers
ipcRenderer.on("file-opened", (event, { content, filePath }) => {
  if (codeEditor) {
    // Open file in new tab
    const fileName = path.basename(filePath);
    createNewTab(fileName, content, filePath);
  }
});

ipcRenderer.on("new-file", () => {
  createNewTab();
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

// showLines functionality removed

// Tab navigation functions
function switchToNextTab() {
  if (tabSystem.tabs.length <= 1) return;
  const nextIndex = (tabSystem.activeTabIndex + 1) % tabSystem.tabs.length;
  switchToTab(nextIndex);
}

function switchToPreviousTab() {
  if (tabSystem.tabs.length <= 1) return;
  const prevIndex = tabSystem.activeTabIndex <= 0 ? 
    tabSystem.tabs.length - 1 : 
    tabSystem.activeTabIndex - 1;
  switchToTab(prevIndex);
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Handle Ctrl+Tab and Ctrl+Shift+Tab for tab navigation
  if (e.ctrlKey && e.key === "Tab") {
    e.preventDefault();
    if (e.shiftKey) {
      switchToPreviousTab();
    } else {
      switchToNextTab();
    }
    return;
  }

  
  // Handle Ctrl+Key shortcuts  
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
      case "f":
        // Let CodeMirror handle Ctrl+F natively - don't prevent default
        return true;
        break;
      case "t":
        e.preventDefault();
        createNewTab();
        break;
      case "w":
        e.preventDefault();
        if (tabSystem.tabs.length > 1) {
          closeTab(tabSystem.activeTabIndex);
        }
        break;
      case "n":
        e.preventDefault();
        createNewTab();
        break;
      case "o":
        e.preventDefault();
        ipcRenderer.send("open-file-dialog");
        break;
      case "e":
        e.preventDefault();
        if (toggleEditorBtn) {
          toggleEditorBtn.click();
        }
        break;
      case "p":
        e.preventDefault();
        if (togglePreviewBtn) {
          togglePreviewBtn.click();
        }
        break;
      case "r":
        e.preventDefault();
        location.reload();
        break;
    }
  }
  
  // Handle F12 for dev tools
  if (e.key === "F12") {
    e.preventDefault();
    e.stopPropagation();
    console.log('F12 pressed - toggling DevTools');
    const { ipcRenderer } = require("electron");
    ipcRenderer.send('toggle-dev-tools');
  }
});

// Save preferences on change
syncScrollCheckbox.addEventListener("change", savePreferences);

// Auto-save toggle event listener
autoSaveToggle.addEventListener("change", () => {
  isAutoSaveEnabled = autoSaveToggle.checked;
  
  // Update auto-save status display
  if (autoSaveStatus) {
    if (isAutoSaveEnabled) {
      autoSaveStatus.textContent = 'Auto-save: Ready';
      autoSaveStatus.className = 'auto-save-status';
      // Restart auto-save functionality if there are unsaved changes
      const activeTab = getCurrentTab();
      if (activeTab && activeTab.hasUnsavedChanges && activeTab.filePath) {
        scheduleAutoSave();
      }
    } else {
      autoSaveStatus.textContent = 'Auto-save: Disabled';
      autoSaveStatus.className = 'auto-save-status';
      // Stop any pending auto-saves
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = null;
      }
    }
  }
  
  savePreferences();
});

// Advanced Search Event Listeners
if (searchClose) {
  searchClose.addEventListener("click", hideSearchPanel);
}

if (searchInput) {
  searchInput.addEventListener("input", performSearch);
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        findPreviousMatch();
      } else {
        findNextMatch();
      }
      e.preventDefault();
    } else if (e.key === "Escape") {
      hideSearchPanel();
      e.preventDefault();
    }
  });
}

if (replaceInput) {
  replaceInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      performReplace();
      e.preventDefault();
    } else if (e.key === "Escape") {
      hideSearchPanel();
      e.preventDefault();
    }
  });
}

// Search option toggles
if (caseToggle) {
  caseToggle.addEventListener("click", () => {
    searchState.caseSensitive = !searchState.caseSensitive;
    caseToggle.classList.toggle("active", searchState.caseSensitive);
    performSearch();
  });
}

if (regexToggle) {
  regexToggle.addEventListener("click", () => {
    searchState.useRegex = !searchState.useRegex;
    regexToggle.classList.toggle("active", searchState.useRegex);
    performSearch();
  });
}

if (wholeWordToggle) {
  wholeWordToggle.addEventListener("click", () => {
    searchState.wholeWord = !searchState.wholeWord;
    wholeWordToggle.classList.toggle("active", searchState.wholeWord);
    performSearch();
  });
}

// Search navigation buttons
if (findPrev) {
  findPrev.addEventListener("click", findPreviousMatch);
}

if (findNext) {
  findNext.addEventListener("click", findNextMatch);
}

// Replace buttons
if (replaceBtn) {
  replaceBtn.addEventListener("click", performReplace);
}

if (replaceAllBtn) {
  replaceAllBtn.addEventListener("click", performReplaceAll);
}

// Tab drag and drop functionality
let draggedTabIndex = -1;

function handleTabDragStart(e) {
  draggedTabIndex = parseInt(e.target.dataset.tabIndex);
  e.target.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', e.target.outerHTML);
}

function handleTabDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleTabDragEnter(e) {
  e.preventDefault();
  const targetIndex = parseInt(e.target.closest('.tab')?.dataset.tabIndex);
  if (targetIndex !== draggedTabIndex && targetIndex !== undefined) {
    e.target.closest('.tab').classList.add('drag-over');
  }
}

function handleTabDragLeave(e) {
  e.target.closest('.tab')?.classList.remove('drag-over');
}

function handleTabDrop(e) {
  e.preventDefault();
  const targetIndex = parseInt(e.target.closest('.tab')?.dataset.tabIndex);
  
  if (targetIndex !== draggedTabIndex && targetIndex !== undefined) {
    // Reorder tabs
    const draggedTab = tabSystem.tabs[draggedTabIndex];
    tabSystem.tabs.splice(draggedTabIndex, 1);
    tabSystem.tabs.splice(targetIndex, 0, draggedTab);
    
    // Update active tab index
    if (tabSystem.activeTabIndex === draggedTabIndex) {
      tabSystem.activeTabIndex = targetIndex;
    } else if (draggedTabIndex < tabSystem.activeTabIndex && targetIndex >= tabSystem.activeTabIndex) {
      tabSystem.activeTabIndex--;
    } else if (draggedTabIndex > tabSystem.activeTabIndex && targetIndex <= tabSystem.activeTabIndex) {
      tabSystem.activeTabIndex++;
    }
    
    renderTabs();
  }
  
  // Clean up drag state
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('drag-over', 'dragging');
  });
  draggedTabIndex = -1;
}

function handleTabDragEnd(e) {
  e.target.classList.remove('dragging');
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('drag-over');
  });
  draggedTabIndex = -1;
}

// Panel resizing functionality
let outlineResizing = false;
let editorResizing = false;

function initializeResizablePanels() {
  // Shared variables for both resizers
  let outlineStartX = 0;
  let outlineStartWidth = 0;
  let editorStartX = 0;
  let editorStartWidth = 0;
  
  // Outline panel resize - completely independent
  if (outlineResizeHandle && outlinePanel) {
    outlineResizeHandle.addEventListener('mousedown', (e) => {
      outlineResizing = true;
      outlineStartX = e.clientX;
      outlineStartWidth = outlinePanel.offsetWidth;
      document.body.classList.add('resizing');
      outlineResizeHandle.classList.add('resizing');
      e.preventDefault();
      e.stopPropagation();
    });
  }

  // Editor panel resize - completely independent
  if (editorResizeHandle && editorPanel) {
    editorResizeHandle.addEventListener('mousedown', (e) => {
      editorResizing = true;
      editorStartX = e.clientX;
      editorStartWidth = editorPanel.offsetWidth;
      document.body.classList.add('resizing');
      editorResizeHandle.classList.add('resizing');
      e.preventDefault();
      e.stopPropagation();
    });
  }

  // Global mouse move handler - handle both resizers independently
  document.addEventListener('mousemove', (e) => {
    // Handle outline resizing
    if (outlineResizing) {
      const deltaX = e.clientX - outlineStartX;
      const newWidth = outlineStartWidth + deltaX;
      const minWidth = 200;
      const maxWidth = Math.min(400, window.innerWidth * 0.4);
      
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        outlinePanel.style.width = newWidth + 'px';
      }
      e.preventDefault();
    }
    
    // Handle editor resizing - use width like outline panel
    if (editorResizing) {
      const deltaX = e.clientX - editorStartX;
      const containerWidth = document.querySelector('.container').offsetWidth;
      const outlineWidth = outlinePanel.classList.contains('hidden') ? 0 : outlinePanel.offsetWidth;
      const availableWidth = containerWidth - outlineWidth;
      const newWidth = editorStartWidth + deltaX;
      const minWidth = 300;
      const maxWidth = availableWidth - 300; // Leave minimum space for preview
      
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        // Use fixed width instead of flex to avoid interference with outline
        editorPanel.style.width = newWidth + 'px';
        editorPanel.style.flex = 'none';
        // Save the custom width for later restoration
        editorPanel.setAttribute('data-custom-width', newWidth + 'px');
        // Preview stays flex: 1 to take remaining space
      }
      e.preventDefault();
    }
  });

  // Global mouse up handler
  document.addEventListener('mouseup', () => {
    if (outlineResizing || editorResizing) {
      outlineResizing = false;
      editorResizing = false;
      document.body.classList.remove('resizing');
      if (outlineResizeHandle) outlineResizeHandle.classList.remove('resizing');
      if (editorResizeHandle) editorResizeHandle.classList.remove('resizing');
      
      // Save panel sizes to preferences
      savePreferences();
    }
  });
}

// Title bar menu functionality
const fileMenu = document.getElementById("fileMenu");
const editMenu = document.getElementById("editMenu");  
const viewMenu = document.getElementById("viewMenu");
const fileDropdown = document.getElementById("fileDropdown");
const editDropdown = document.getElementById("editDropdown");
const viewDropdown = document.getElementById("viewDropdown");

// Menu dropdown handlers
function toggleDropdown(menu, dropdown) {
  const isCurrentlyVisible = dropdown.classList.contains('show');
  
  // Hide all dropdowns first
  document.querySelectorAll('.dropdown-menu').forEach(d => d.classList.remove('show'));
  document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
  
  // If the dropdown was not visible, show it
  if (!isCurrentlyVisible) {
    dropdown.classList.add('show');
    menu.classList.add('active');
  }
}

function hideAllDropdowns() {
  document.querySelectorAll('.dropdown-menu').forEach(d => d.classList.remove('show'));
  document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
}

if (fileMenu && fileDropdown) {
  fileMenu.addEventListener('click', () => toggleDropdown(fileMenu, fileDropdown));
}

if (editMenu && editDropdown) {
  editMenu.addEventListener('click', () => toggleDropdown(editMenu, editDropdown));
}

if (viewMenu && viewDropdown) {
  viewMenu.addEventListener('click', () => toggleDropdown(viewMenu, viewDropdown));
}

// Click outside to close dropdowns
document.addEventListener('click', (e) => {
  if (!e.target.closest('.title-bar-menu')) {
    hideAllDropdowns();
  }
});

// Handle menu actions
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('menu-option')) {
    const action = e.target.dataset.action;
    handleMenuAction(action);
    hideAllDropdowns();
  }
});

function handleMenuAction(action) {
  switch (action) {
    case 'new':
      createNewTab();
      break;
    case 'open':
      ipcRenderer.send("open-file-dialog");
      break;
    case 'save':
      saveFile();
      break;
    case 'save-as':
      saveAsFile();
      break;
    case 'export-md':
      exportMarkdown();
      break;
    case 'export-pdf':
      exportPdf();
      break;
    case 'export-html':
      exportHtml();
      break;
    case 'exit':
      ipcRenderer.send("window-close");
      break;
    case 'undo':
      document.execCommand('undo');
      break;
    case 'redo':
      document.execCommand('redo');
      break;
    case 'cut':
      document.execCommand('cut');
      break;
    case 'copy':
      document.execCommand('copy');
      break;
    case 'paste':
      document.execCommand('paste');
      break;
    case 'toggle-preview':
      togglePreviewBtn.click();
      break;
    case 'toggle-editor':
      toggleEditorBtn.click();
      break;
    case 'reload':
      location.reload();
      break;
    case 'devtools':
      // This would need IPC to main process
      break;
  }
}

// Export functions
async function exportMarkdown() {
  if (!codeEditor) return;
  const activeTab = getCurrentTab();
  if (!activeTab) return;
  
  const result = await ipcRenderer.invoke("save-as-file", codeEditor.getValue());
  if (result) {
    console.log('Markdown exported successfully to:', result);
  }
}

async function exportPdf() {
  if (!codeEditor) return;
  
  try {
    const activeTab = getCurrentTab();
    const currentFilePath = activeTab ? activeTab.filePath : null;
    
    console.log('Exporting PDF from menu...');
    
    const result = await ipcRenderer.invoke("export-pdf", {
      content: codeEditor.getValue(),
      currentFilePath: currentFilePath
    });
    
    if (result) {
      console.log('PDF exported successfully to:', result);
    } else {
      console.error('PDF export failed');
    }
  } catch (error) {
    console.error('PDF export error:', error);
  }
}

async function exportHtml() {
  if (!codeEditor) return;
  
  try {
    const activeTab = getCurrentTab();
    const currentFilePath = activeTab ? activeTab.filePath : null;
    
    console.log('Exporting HTML from menu...');
    
    const result = await ipcRenderer.invoke("export-html", {
      content: codeEditor.getValue(),
      currentFilePath: currentFilePath
    });
    
    if (result) {
      console.log('HTML exported successfully to:', result);
    } else {
      console.error('HTML export failed');
    }
  } catch (error) {
    console.error('HTML export error:', error);
  }
}

// Window control event listeners
if (minimizeBtn) {
  minimizeBtn.addEventListener("click", () => {
    ipcRenderer.send("window-minimize");
  });
}

if (maximizeBtn) {
  maximizeBtn.addEventListener("click", () => {
    ipcRenderer.send("window-maximize");
  });
}

if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    ipcRenderer.send("window-close");
  });
}

// Tab system event listeners
if (newTabBtn) {
  newTabBtn.addEventListener("click", () => createNewTab());
}

// Tab scroll button event listeners
if (scrollLeftBtn) {
  scrollLeftBtn.addEventListener("click", scrollTabsLeft);
}

if (scrollRightBtn) {
  scrollRightBtn.addEventListener("click", scrollTabsRight);
}

// Tab container scroll event listener
if (tabContainer) {
  tabContainer.addEventListener("scroll", updateScrollButtons);
  
  // Mouse wheel scrolling for tabs
  tabContainer.addEventListener("wheel", (e) => {
    if (e.deltaY !== 0) {
      e.preventDefault();
      tabContainer.scrollBy({
        left: e.deltaY * 2,
        behavior: 'smooth'
      });
    }
  });
  
  // Window resize handler to update scroll buttons
  window.addEventListener('resize', () => {
    setTimeout(updateScrollButtons, 0);
  });
}

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
    
    // Initialize resizable panels
    initializeResizablePanels();
    
    // Initialize tab system with first tab
    createNewTab();
    
    // Start auto-save functionality
    startAutoSaveInterval();
    
    // Update auto-save status display based on initial setting
    if (autoSaveStatus && autoSaveToggle) {
      if (isAutoSaveEnabled) {
        autoSaveStatus.textContent = 'Auto-save: Ready';
        autoSaveStatus.className = 'auto-save-status';
        console.log('Auto-save enabled: saves after 3s of inactivity, max 30s intervals');
      } else {
        autoSaveStatus.textContent = 'Auto-save: Disabled';
        autoSaveStatus.className = 'auto-save-status';
        console.log('Auto-save disabled by user preference');
      }
    }
    
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
    
    // Initialize resizable panels for fallback
    initializeResizablePanels();
    
    // Initialize tab system with first tab for textarea fallback
    createNewTab();
    
    // Start auto-save functionality for textarea fallback
    startAutoSaveInterval();
    
    // Update auto-save status display based on initial setting for fallback
    if (autoSaveStatus && autoSaveToggle) {
      if (isAutoSaveEnabled) {
        autoSaveStatus.textContent = 'Auto-save: Ready';
        autoSaveStatus.className = 'auto-save-status';
        console.log('Auto-save enabled: saves after 3s of inactivity, max 30s intervals');
      } else {
        autoSaveStatus.textContent = 'Auto-save: Disabled';
        autoSaveStatus.className = 'auto-save-status';
        console.log('Auto-save disabled by user preference');
      }
    }
  }
}

// Initialize CodeMirror 6
initializeCodeEditor();