import { invoke, stat, filenameInput, textarea, saveSession } from '../../api/settings.js';
import { translate, adjustZoom } from '../../api/f-end.js';
import { tabCount, currentTab, loadCache, switchTab, saveTab, addTab, rmTab, cacheTabs } from '../editor/tabs.js';
import { saveFile, saveFileAs, autoSaveFn, openFile, openFolder, openSettings } from '../../api/b-end.js';

// const { unregisterAll, register } = window.__TAURI__.globalShortcut; // Refer to Devnotes

// Keybinds (kinda crappy I know but deal with it)
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey) {
        if (event.key === 's') { saveFile(); }
        if (event.key === 'o') { openFile(); }
        if (event.shiftKey) { if (event.key === 'o') { openFolder(); } }
        if (event.key === ',') { openSettings(); }
        if (event.key === 't') { addTab('', ''); }
        if (event.key === 'w') { rmTab(); }
        if (event.key === 'p') { let tmp = currentTab; switchTab(--tmp); }
        if (event.key === 'n') { let tmp = currentTab; switchTab(++tmp); }
        if (event.key === '+') { adjustZoom('+'); }
        if (event.key === '=') { adjustZoom('='); }
        if (event.key === '-') { adjustZoom('-'); }
        if (event.key === 'r') { location.reload(); }
    }
});

// App initialization
translate();
loadCache();
autoSaveFn();

// NewTab Trigger
document.querySelector('button.NewTab').addEventListener('click', () => { addTab('', ''); });

// Navbar Event Listeners
document.querySelector('#f-new').addEventListener('click', () => { addTab('', ''); });
document.querySelector('#f-save').addEventListener('click', saveFile);
document.querySelector('#f-save_as').addEventListener('click', saveFileAs);
document.querySelector('#f-open').addEventListener('click', openFile);
document.querySelector('#f-open_folder').addEventListener('click', openFolder);

document.querySelector('#v-zoom_i').addEventListener('click', () => { adjustZoom('+'); });
document.querySelector('#v-zoom_o').addEventListener('click', () => { adjustZoom('*'); });

document.querySelector('#v-settings').addEventListener('click', openSettings);

// Preview Event Listeners
document.querySelector('input.filename').addEventListener('input', () => { saveTab(); });
document.querySelector('textarea.textarea').addEventListener('input', () => { saveTab(); });

// Time-based Triggers
if (saveSession === 'always') { 
    setInterval(() => { cacheTabs(); }, 1000); 
} else if (saveSession === 'auto') { 
    setInterval(() => { cacheTabs(); }, 8000); 
}

setInterval(() => { autoSaveFn(); translate(); }, 3500);
