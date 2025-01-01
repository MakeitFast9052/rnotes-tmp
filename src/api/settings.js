// WARNING: This MUST be the first module loaded, and it must be deferred!
export const { invoke } = window.__TAURI__.core;

// Global DOM consts
export const textarea = document.querySelector('textarea.textarea');
export const filenameInput = document.querySelector('input.filename');
export const preview = document.querySelector('div.preview');
export const statline = document.querySelector('footer div.statusline');
export const lineNumbers = document.querySelector('div.linenumbers');
export const wordcount = document.querySelector('div.wordcount');

// Advanced settings' global vars
export let debugLogging = 'auto';
export let saveSession = 'auto';
export let autosave = 'auto';

// Statline Update fn -- console calls are commented out in release
export async function stat(msg) {
    if (!msg) { console.error('Invalid msg in `stat()`'); return; }
    statline.className = 'statusline';

    if (debugLogging == 'always') { await invoke('stat', { data: msg }); }

    if (msg.startsWith(': ')) { console.log(msg); statline.classList.add('success'); }
    else if (msg.startsWith('! ')) { console.error(msg); statline.classList.add('error'); if (debugLogging !== 'never') { await invoke('stat', { data: msg }); } }
    else if (msg.startsWith('# ')) { console.warn(msg); statline.classList.add('info'); if (debugLogging !== 'never' && debugLogging !== 'sometimes') { await invoke('stat', { data: msg }); } }

    statline.innerHTML = msg.slice(2);
}

async function loadSettings() {
    try {
        const [msg, content] = await invoke('settings', { kind: 'load', data: '' });
        stat(msg);

        if (content) {
            handleSettings(content);
        } else {
            stat('# No settings content found');
        }
    } catch (error) {
        stat(`! Failed to load settings: ${error.message}`);
    }
}

// Main settings fn -- all roads lead to Rome...
function handleSettings(content) {
    try {
        const settings = JSON.parse(content);
        console.log('Parsed settings:', settings);

        generalSettings(settings.general);
        if (document.body.classList.contains('editor')) { 
            editorSettings(settings.editor); 
        }
        advancedSettings(settings.advanced);

        stat(': Loaded settings successfully');
    } catch (error) {
        console.error('JSON Parse Error:', error);
        stat('! Invalid settings file format');
    }
}

// Apply general settings
function generalSettings(general) {
    const root = document.querySelector('html');

    if (general.colorscheme) {
        const [primary, secondary] = general.colorscheme.split('-');

        root.style.setProperty('--primary-accent', primary);
        root.style.setProperty('--secondary-accent', secondary);
    } else {
        root.style.setProperty('--primary-accent', '#ffA500');
        root.style.setProperty('--secondary-accent', '#ff6347');
    }

    root.classList.toggle('force-dark', general.theme == 'dark');

    root.classList.remove('mono', 'legib', 'sans', 'serif');
    if (['mono', 'legib', 'sans', 'serif', 'hwrite'].includes(general.font)) {
        root.classList.add(general.font);
    } else {
        root.classList.add('legib');
    }
}

// Apply editor settings -- only if the editor is open, though
function editorSettings(editor) {
    const wordwrap = editor.wordwrap || 'soft';
    textarea.style.whiteSpace = 
        wordwrap === 'off' ? 'pre' : 
        wordwrap === 'soft' ? 'break-spaces' : 
        wordwrap === 'hard' ? 'pre-wrap' : 'pre-wrap';

    statline.style.display = editor.statusline === 'true' || editor.statusline === true ? 'block' : 'none';
    lineNumbers.style.display = editor.linenumbers === 'true' || editor.linenumbers === true ? 'block' : 'none';
    wordcount.style.display = editor.wordcount === 'true' || editor.wordcount === true ? 'block' : 'none';

    if (editor.linenumbers != true && editor.wordwrap != 'off') { textarea.style.whiteSpace = 'pre' }
}

// Apply advanced settings
function advancedSettings(advanced) {
    debugLogging = advanced.debug || 'auto';
    saveSession = advanced.cache || 'auto';
    autosave = advanced.autosave || 'auto';

    if (debugLogging !== 'auto' && debugLogging !== 'always' && debugLogging !== 'never') { debugLogging = 'auto'; }
    if (saveSession !== 'auto' && saveSession !== 'always' && saveSession !== 'never') { saveSession = 'auto'; }
    if (autosave !== 'auto' && autosave !== 'always' && autosave !== 'never') { autosave = 'auto'; }
}

window.addEventListener('DOMContentLoaded', loadSettings);
