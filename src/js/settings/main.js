import { invoke, stat } from '../../api/settings.js';

const settings_form = document.querySelector('form.settings');
const default_settings = {
    general: {
        colorscheme: '#ffa500-#ff6347',
        theme: 'system',
        font: 'legib'
    },
    editor: {
        wordcount: 'true',
        linenumbers: 'false',
        wordwrap: 'hard',
        tabs: 'top'
    },
    advanced: {
        debug: 'auto',
        autosave: 'always',
        cache: 'auto'
    }
};

// Load settings to the DOM
async function load_settings() {
    const [msg, content] = await invoke('settings', { kind: 'load', data: '' });
    stat(msg);

    if (!content) {
        console.warn("No settings content found");
        return;
    }

    const settings = JSON.parse(content);

    // General Settings
    document.querySelector(`input[name="general.theme"][value="${settings.general.theme}"]`)?.click();
    const [primary, secondary] = settings.general.colorscheme.split('-');
    document.querySelector('input#primary').value = primary;
    document.querySelector('input#secondary').value = secondary;
    document.querySelector(`input[name="general.font"][value="${settings.general.font}"]`)?.click();

    // Editor Settings
    for (const key of ['wordcount', 'statusline', 'linenumbers']) {
        document.querySelector(`input[name="editor.${key}"]`).checked = settings.editor[key] === 'true';
    }
    document.querySelector(`select[name="editor.wordwrap"]`).value = settings.editor.wordwrap;

    // Advanced Settings
    for (const key of ['debug', 'autosave', 'cache']) {
        document.querySelector(`input[name="advanced.${key}"][value="${settings.advanced[key]}"]`)?.click();
    }
}

// Save settings
async function save_settings() {
    const form_data = new FormData(settings_form);
    let form_json = {};

    form_data.forEach((value, key) => {
        const keys = key.split('.');
        keys.reduce((array, part, index) => {
            if (index == keys.length - 1) {
                array[part] = value;
            } else {
                array[part] = array[part] || {};
            }
            return array[part];
        }, form_json);
    });

    form_json = JSON.stringify(form_json);

    const [msg] = await invoke('settings', { kind: 'save', data: form_json });
    stat(msg);
    console.log(`Form Data: ${form_json}`);
}

// Handling the colorschemes
function fmt_colorscheme() {
    const primary = document.querySelector('input#primary[type="color"]').value;
    const secondary = document.querySelector('input#secondary[type="color"]').value;

    document.querySelector('input[name="general.colorscheme"]').value = `${primary}-${secondary}`;
}

const primary_accent = document.querySelector('input#primary[type="color"]');
const secondary_accent = document.querySelector('input#secondary[type="color"]');

// Event Listeners
primary_accent.addEventListener('input', fmt_colorscheme);
secondary_accent.addEventListener('input', fmt_colorscheme);

// Submission Listener
settings_form.addEventListener('submit', (e) => { 
    fmt_colorscheme(); 
    save_settings(); 
});

// Load settings on page load
document.addEventListener('DOMContentLoaded', load_settings);
