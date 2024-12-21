import { invoke, stat, filename_input, textarea, save_session } from '../../api/settings.js';
import { translate, adjust_zoom, } from '../../api/f-end.js';
import { tab_count, current_tab, load_cache, switch_tab, save_tab, add_tab, rm_tab, cache_tabs } from '../editor/tabs.js';
import { save_file, save_file_as, autosave_fn, open_file, open_folder, open_settings } from '../../api/b-end.js';

// const { unregisterAll, register } = window.__TAURI__.globalShortcut; // Refer to Devnotes

// Keybinds (kinda crappy I know but deal with it)
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey) {
        if (event.key === 's') { save_file() }
        if (event.key === 'o') { open_file() }
        if (event.key === ',') { open_settings() }
        if (event.key === 't') { add_tab('', '') }
        if (event.key === 'w') { rm_tab() }
        if (event.key === 'p') { let tmp = current_tab; switch_tab(--tmp); }
        if (event.key === 'n') { let tmp = current_tab; switch_tab(++tmp); }
        if (event.key === '+') { adjust_zoom('+') }
        if (event.key === '=') { adjust_zoom('=') }
        if (event.key === '-') { adjust_zoom('-') }
        if (event.key === 'r') { location.reload() }
        if (event.shiftKey) { if (event.key === 'o') { open_folder() } }
    }
});

// App initialization
translate();
load_cache();
autosave_fn();

// NewTab Trigger
document.querySelector('button.NewTab').addEventListener('click', () => { add_tab('', '') });

// Navbar Event Listeners
document.querySelector('#f-new').addEventListener('click', () => { add_tab('', '') });
document.querySelector('#f-save').addEventListener('click', save_file);
document.querySelector('#f-save_as').addEventListener('click', save_file_as);
document.querySelector('#f-open').addEventListener('click', open_file);
document.querySelector('#f-open_folder').addEventListener('click', open_folder);

document.querySelector('#v-zoom_i').addEventListener('click', () => { adjust_zoom('+') });
document.querySelector('#v-zoom_o').addEventListener('click', () => { adjust_zoom('*') });

document.querySelector('#v-settings').addEventListener('click', open_settings);

// Preview Event Listeners
document.querySelector('input.filename').addEventListener('input', () => { save_tab(); });
document.querySelector('textarea.textarea').addEventListener('input', () => { save_tab(); });

// Time-based Triggers
if (save_session == 'always') { setInterval(() => { cache_tabs() }, 1000); }
else if (save_session == 'auto') { setInterval(() => { cache_tabs() }, 8000); }

setInterval(() => { autosave_fn(); translate() }, 3500);
