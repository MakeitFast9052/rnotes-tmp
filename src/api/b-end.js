import { invoke, stat, textarea, filenameInput, preview, autosave, } from '../api/settings.js';
import { fileTypes, getExtension, translate, renderMultimedia, } from '../api/f-end.js';
import { activeTabs, addTab, switchTab, currentTab, } from '../js/editor/tabs.js';
export const { open, save } = window._TAURI__.dialog;

// APIs for File Handling
export async function saveFile() {
    let filename = filenameInput.value;
    let extension = getExtension(filename);

    if (!filename || filename == '') { saveFileAs(); return; }

    if (fileTypes.IMAGE.includes(extension) || fileTypes.AUDIO.includes(extension) || fileTypes.VIDEO.includes(extension)) { stat('# Cannot save Multimedia Files'); return; }

    let content = textarea.value;
    let msg = await invoke('saveFile', { filepath: filename, content: content });
    stat(msg);
}

export async function saveFileAs() {
    let filepath = await save({ defaultPath: filenameInput.value });
    if (filepath) {
        let msg = await invoke('saveFile', { filename: filepath.trim(), content: textarea.value });
        stat(msg);
    }
}

export async function autosaveFn() {
    if (autosave == 'never') { return; }

    if (autosave == 'always') {
        for (let [key, [filename, content]] of activeTabs) {
            try {
                await invoke('saveFile', { filepath: filename, content: content });
            } catch (error) {
                stat(`! Failed to autosave: ${error}`);
            }
        }
        stat(': Autosaved all files');
    } else if (autosave == 'auto') {
        if (activeTabs.has(currentTab)) {
            let [filename, content] = activeTabs.get(currentTab);
            try {
                await invoke('saveFile', { filepath: filename, content: content });
            } catch (error) {
                stat(`! Failed to autosave: ${error}`);
            }
        }
        stat(': Autosaved current file');
    }
}

export async function openFile() {
    let filepath = await open({ multiple: false, directory: false, });
    console.log(filepath);
    if (!filepath) return;

    let extension = getExtension(filepath);
    if (fileTypes.IMAGE.includes(extension) || fileTypes.AUDIO.includes(extension) || fileTypes.VIDEO.includes(extension)) { 
        if (textarea.value.trim() !== '') {
            addTab(filepath, '');
        } else {
            filenameInput.value = filepath;
        }
        translate(); return;
    }

    let [msg, content] = await invoke('openFile', { filepath: filepath });
    if (content) {
        if (textarea.value.trim() !== '') {
            addTab(filepath, content);
        } else {
            filenameInput.value = filepath;
            textarea.value = content.trim('\n');
        }
        stat(msg);
        translate();
        switchTab(currentTab);
    }
}

export async function openFolder() {
    let dir_path = await open({ multiple: false, directory: true });
    if (!dir_path) return;

    try {
        let [msg, files] = await invoke('openFolder', { dirPath: dir_path });
        stat(msg);

        if (files && typeof files === 'object') {
            Object.entries(files).forEach(([filename, content]) => {
                addTab(`${dir_path}/${filename}`, content);
            });
        } else {
            stat('! One of: a. Corrupted return type OR b. No return at all: Check the previous logs');
        }

        translate();
    } catch (error) {
        stat('! Failed to open folder');
    }
}

// Opening the Settings Window
export async function openSettings() {
    let msg = await invoke('settings', { kind: 'open', data: '' });
    stat(msg);
}

/* DevNotes:
 * 
 * At least 2 KNOWN ERRORS exist in b-end handling, both to do with opening
 * files.
 *
 * Both `openFile` is and `openFolder` fail to open Binary files (they should
 * skip them) and because blank files return an empty string, JS tends to ignore
 * them (if-clause checking for content).
 *
 * `openFolder` attempts to open binary files, which fails (ideally it would return
 * blank content, which would be imitated in tab handling...).
 * */
