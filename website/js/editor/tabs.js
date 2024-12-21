// Tab Handling (yes this needs a separate file)
import { stat, filename_input, textarea, preview, save_session } from '../../api/settings.js';
import { extract_filename, get_extension, translate } from '../../api/f-end.js';

export let current_tab = 0;
export let tab_count = 0;

export let active_tabs = new Map(); // Key: Tab ID, Value: [filename, content]

// Load saved session -- if any
export async function load_cache() {
    try {
        active_tabs = new Map();
        add_tab('', '');
    } catch (error) {
        stat(`! Error loading session: ${error.message}`);
        active_tabs = new Map();
        tab_count = 0;
        add_tab('', '');
    }
}

// Add a new tab with provided filename-content as an Array
export function add_tab(filename = '', content = '') {
    save_tab(current_tab);
    tab_count += 1;
    active_tabs.set(tab_count, [filename.trim(), content]);
    switch_tab(tab_count);
    if (save_session == 'sometimes') { cache_tabs(); }
}

// Switch to tab by key + wrapping logic
export async function switch_tab(key = current_tab) {
    if (key < 1) {
        key = tab_count;
    } else if (key > tab_count) {
        key = 1;
    }

    if (!active_tabs.has(key)) { return null; }

    save_tab(current_tab);
    const [filename, content] = active_tabs.get(key);
    filename_input.value = filename;
    textarea.value = content;
    current_tab = key;
    save_tab(current_tab);
    translate();
    // if (save_session == 'always') { cache_tabs(); } // bc switch_tab is called on every translate
}

// Save a Tab's contents
function save_tab(key = current_tab) {
    if (!active_tabs.has(key)) { return null; }
    const textvalue = textarea.disabled ? '' : textarea.value;
    active_tabs.set(key, [filename_input.value, textvalue]);

    const tab_handle = document.querySelector('div.tabhandle');
    tab_handle.innerHTML = '';

    for (const [tab_key, [filename]] of active_tabs) {
        const tab_element = document.createElement('button');
        tab_element.textContent = filename ? extract_filename(filename) : 'New Tab';
        tab_element.className = 'tab-button';

        if (tab_key === current_tab) {
            tab_element.classList.add('active');
        }

        tab_element.addEventListener('click', () => {
            switch_tab(tab_key);
        });

        tab_handle.appendChild(tab_element);
    }
    const newTab = document.createElement('button');
    newTab.classList = 'NewTab';
    newTab.textContent = '+';
    tab_handle.appendChild(newTab);
}

// Cache Tabs to Disk (based on settings)
export async function cache_tabs() {
    return; // :)
}

// Ripple remove current tab
export function rm_tab() {
    if (!active_tabs.has(current_tab)) {
        stat(`# Tab does not exist: ${current_tab}`);
        return;
    }

     if (tab_count == 1) { const tmp = current_tab; add_tab('', ''); rm_tab(tmp); return; }
    active_tabs.delete(current_tab);

    const updated_tabs = new Map();
    let new_key = 1;
    active_tabs.forEach(([filename, content], old_key) => {
        updated_tabs.set(new_key, [filename, content]);
        new_key++;
    });
    active_tabs = updated_tabs;

    tab_count = active_tabs.size;

    if (tab_count === 0) {
        add_tab('', '');
    } else {
        current_tab = current_tab > tab_count ? tab_count : current_tab;
        switch_tab(current_tab);
    }

    save_tab();
    cache_tabs();

    stat(`: Removed tab ${current_tab}`);
}

