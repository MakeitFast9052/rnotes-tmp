// WARNING: This MUST be the first module loaded, and it must be deferred!
export const { invoke } = window.__TAURI__.core;

// Global DOM consts
export const textarea = document.querySelector('textarea.textarea');
export const filename_input = document.querySelector('input.filename');
export const preview = document.querySelector('div.preview');
export const statline = document.querySelector('footer div.statusline');
export const linenumbers = document.querySelector('div.linenumbers');
export const wordcount = document.querySelector('div.wordcount');

// Advanced settings' global vars
export let debug_logging = 'auto';
export let save_session = 'auto';
export let autosave = 'auto';

// Statline Update fn -- console calls are commented out in release
export async function stat(msg) {
    if (!msg) { console.error('Invalid msg in `stat()`'); return; }
    statline.className = 'statusline';

    if (debug_logging == 'always') { await invoke('stat', { data: msg }); }

    if (msg.startsWith(': ')) { console.log(msg); statline.classList.add('success'); }
    else if (msg.startsWith('! ')) { console.error(msg); statline.classList.add('error'); if (debug_logging !== 'never') { await invoke('stat', { data: msg }); } }
    else if (msg.startsWith('# ')) { console.warn(msg); statline.classList.add('info'); if (debug_logging !== 'never' && debug_logging !== 'sometimes') { await invoke('stat', { data: msg }); } }

    statline.innerHTML = msg.slice(2);
}

async function load_settings() {
    try {
        const [msg, content] = await invoke('settings', { kind: 'load', data: '' });
        stat(msg);

        if (content) {
            handle_settings(content);
        } else {
            stat('# No settings content found');
        }
    } catch (error) {
        stat(`! Failed to load settings: ${error.message}`);
    }
}

// Main settings fn -- all roads lead to Rome...
function handle_settings(content) {
    try {
        const settings = JSON.parse(content);
        console.log('Parsed settings:', settings);

        general_settings(settings.general);
        if (document.body.classList.contains('editor')) { 
            editor_settings(settings.editor); 
        }
        advanced_settings(settings.advanced);

        stat(': Loaded settings successfully');
    } catch (error) {
        console.error('JSON Parse Error:', error);
        stat('! Invalid settings file format');
    }
}

// Apply general settings
function general_settings(general) {
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
function editor_settings(editor) {
    const wordwrap = editor.wordwrap || 'soft';
    textarea.style.whiteSpace = 
        wordwrap === 'off' ? 'pre' : 
        wordwrap === 'soft' ? 'break-spaces' : 
        wordwrap === 'hard' ? 'pre-wrap' : 'pre-wrap';

    statline.style.display = editor.statusline === 'true' || editor.statusline === true ? 'block' : 'none';
    linenumbers.style.display = editor.linenumbers === 'true' || editor.linenumbers === true ? 'block' : 'none';
    wordcount.style.display = editor.wordcount === 'true' || editor.wordcount === true ? 'block' : 'none';

    if (editor.linenumbers != true && editor.wordwrap != 'off') { textarea.style.whiteSpace = 'pre' }
}

// Apply advanced settings
function advanced_settings(advanced) {
    debug_logging = advanced.debug || 'auto';
    save_session = advanced.cache || 'auto';
    autosave = advanced.autosave || 'auto';

    if (debug_logging !== 'auto' && debug_logging !== 'always' && debug_logging !== 'never') { debug_logging = 'auto'; }
    if (save_session !== 'auto' && save_session !== 'always' && save_session !== 'never') { save_session = 'auto'; }
    if (autosave !== 'auto' && autosave !== 'always' && autosave !== 'never') { autosave = 'auto'; }
}

window.addEventListener('DOMContentLoaded', load_settings);
