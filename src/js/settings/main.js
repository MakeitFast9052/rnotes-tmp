import { invoke, stat } from '../../api/settings.js';

const settingsForm = document.querySelector('form.settings');
const defaultSettings = {
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
async function loadSettings() {
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
async function saveSettings() {
    const formData = new FormData(settingsForm);
    let formJson = {};

    formData.forEach((value, key) => {
        const keys = key.split('.');
        keys.reduce((array, part, index) => {
            if (index == keys.length - 1) {
                array[part] = value;
            } else {
                array[part] = array[part] || {};
            }
            return array[part];
        }, formJson);
    });

    formJson = JSON.stringify(formJson);

    const [msg] = await invoke('settings', { kind: 'save', data: formJson });
    stat(msg);
    console.log(`Form Data: ${formJson}`);
}

// Handling the colorschemes
function fmtColorscheme() {
    const primary = document.querySelector('input#primary[type="color"]').value;
    const secondary = document.querySelector('input#secondary[type="color"]').value;

    document.querySelector('input[name="general.colorscheme"]').value = `${primary}-${secondary}`;
}

const primaryAccent = document.querySelector('input#primary[type="color"]');
const secondaryAccent = document.querySelector('input#secondary[type="color"]');

// Event Listeners
primaryAccent.addEventListener('input', fmtColorscheme);
secondaryAccent.addEventListener('input', fmtColorscheme);

// Submission Listener
settingsForm.addEventListener('submit', (e) => { 
    fmtColorscheme(); 
    saveSettings(); 
});

// Load settings on page load
document.addEventListener('DOMContentLoaded', loadSettings);
