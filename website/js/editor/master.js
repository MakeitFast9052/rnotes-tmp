import { stat, filenameInput, textarea, saveSession } from '../../api/settings.js';
import { translate, adjustZoom } from '../../api/f-end.js';
import { tabCount, currentTab, loadCache, switchTab, addTab, rmTab, } from '../editor/tabs.js';

// Keybinds (kinda crappy I know but deal with it)
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey) {
        if (event.altKey) {
            if (event.key === 't') { addTab('', ''); }
            if (event.key === 'w') { rmTab(); }
            if (event.key === 'p') { let tmp = currentTab; switchTab(--tmp); }
            if (event.key === 'n') { let tmp = currentTab; switchTab(++tmp); }
            if (event.key === '+') { adjustZoom('+'); }
            if (event.key === '=') { adjustZoom('='); }
            if (event.key === '-') { adjustZoom('-'); }
        }
    }
});

// App initialization
translate();
loadCache();

// NewTab Trigger
document.querySelector('button.NewTab').addEventListener('click', () => { addTab('', ''); });

// Navbar Event Listeners
document.querySelector('#v-zoom_i').addEventListener('click', () => { adjustZoom('+'); });
document.querySelector('#v-zoom_r').addEventListener('click', () => { adjustZoom('='); });
document.querySelector('#v-zoom_o').addEventListener('click', () => { adjustZoom('-'); });

// Preview Event Listeners
document.querySelector('input.filename').addEventListener('input', () => { 
    translate(); 
});
document.querySelector('textarea.textarea').addEventListener('input', () => { 
    translate(); 
});

// Time-based Triggers
setInterval(() => { translate(); }, 3500);
