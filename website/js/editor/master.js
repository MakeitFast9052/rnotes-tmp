import { stat, filename_input, textarea, save_session } from '../../api/settings.js';
import { translate, zoom_in, zoom_out } from '../../api/f-end.js';
import { tab_count, current_tab, load_cache, switch_tab, add_tab, rm_tab, cache_tabs } from '../editor/tabs.js';

// Keybinds (kinda crappy I know but deal with it)
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey) {
        if (event.altKey) {
            if (event.key === 't') { add_tab('', '') }
            if (event.key === 'w') { rm_tab() }
            if (event.key === 'p') { let tmp = current_tab; switch_tab(--tmp); }
            if (event.key === 'n') { let tmp = current_tab; switch_tab(++tmp); }
            if (event.key === '+') { zoom_in() }
            if (event.key === '-') { zoom_out() }
        }
    }
});

// App initialization
translate();

// NewTab Trigger
document.querySelector('.NewTab').addEventListener('click', () => { add_tab('', '') });

// Navbar Event Listeners
document.querySelector('#v-zoom_i').addEventListener('click', () => { zoom_in() });
document.querySelector('#v-zoom_o').addEventListener('click', () => { zoom_out() });

// Preview Event Listeners
document.querySelector('input.filename').addEventListener('input', () => { 
    translate(); 
});
document.querySelector('textarea.textarea').addEventListener('input', () => { 
    translate(); 
});

// Time-based Triggers
setInterval(() => { translate() }, 3500);
