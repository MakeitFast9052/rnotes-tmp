import { invoke, stat, filename_input, textarea, save_session } from '../../api/settings.js';
import { translate, adjust_zoom, } from '../../api/f-end.js';
import { tab_count, current_tab, load_cache, switch_tab, save_tab, add_tab, rm_tab, cache_tabs } from '../editor/tabs.js';
import { save_file, save_file_as, autosave_fn, open_file, open_folder, open_settings } from '../../api/b-end.js';

const dialogs = {
    keybinds: document.querySelector('dialog.kbd-shortcuts'),
};

// Function map
const actionMap = {
    save_file,
    open_file,
    open_settings,
    add_tab: () => add_tab('', ''),
    rm_tab,
    previous_tab: () => switch_tab(--current_tab),
    next_tab: () => switch_tab(++current_tab),
    zoom_in: () => adjust_zoom('+'),
    reset_zoom: () => adjust_zoom('='),
    zoom_out: () => adjust_zoom('-'),
    reload: () => location.reload(),
    open_folder,
};

// Keybind dialog
document.querySelector('#v-kbd').addEventListener('click', () => { dialogs.keybinds.showModal(); });
dialogs.keybinds.querySelector('button.close').addEventListener('click', () => { dialogs.keybinds.close(); });

function init_kbd() {
    const buttons = dialogs.keybinds.querySelectorAll('.kbd-entry button');
    let activeIndex = 0;

    buttons.forEach((btn) => {
        const action = btn.dataset.action;
        if (action && actionMap[action]) {
            btn.addEventListener('click', actionMap[action]);
        }
    });

    function highlightButton(index) {
        buttons.forEach((btn, i) => {
            btn.style.outline = i === index ? '0.12rem solid var(--primary-accent)' : 'none';
        });
    }

    highlightButton(activeIndex);

    dialogs.keybinds.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();

        if (key === 'arrowdown') {
            activeIndex = (activeIndex + 1) % buttons.length;
            highlightButton(activeIndex);
            event.preventDefault();
        } else if (key === 'arrowup') {
            activeIndex = (activeIndex - 1 + buttons.length) % buttons.length;
            highlightButton(activeIndex);
            event.preventDefault();
        } else if (key === 'enter') {
            const activeButton = buttons[activeIndex];
            const action = activeButton.dataset.action;
            if (action && actionMap[action]) {
                actionMap[action]();
            }
            event.preventDefault();
        } else if (key === 'escape') {
            dialogs.keybinds.close();
            event.preventDefault();
        }
    });

    buttons.forEach((btn, index) => {
        btn.addEventListener('mouseenter', () => highlightButton(index));
    });
}

init_kbd();
