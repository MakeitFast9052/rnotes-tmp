import { invoke, stat, textarea, filenameInput, preview, autosave, } from '../api/settings.js';
import { fileTypes, getExtension, translate, renderMultimedia, } from '../api/f-end.js';
import { activeTabs, addTab, switchTab, currentTab, } from '../js/editor/tabs.js';
export const { open, save } = window.__TAURI__.dialog;

// APIs for File Handling
export async function saveFile() {
    let filename = filenameInput.value;
    let extension = getExtension(filename);

    if (!filename || filename == '') { saveFileAs(); return; }  // Empty filename input means they need to pick a filename

    if (fileTypes.IMAGE.includes(extension) || fileTypes.AUDIO.includes(extension) || fileTypes.VIDEO.includes(extension)) { stat('# Cannot save Multimedia Files'); return; }

    let content = textarea.value;
    let msg = await invoke('save_file', { filepath: filename, content: content });
    stat(msg);
}

export async function saveFileAs() {
    let filepath = await save({ defaultPath: filenameInput.value });
    if (filepath) {
        let msg = await invoke('save_file', { filename: filepath.trim(), content: textarea.value });
        stat(msg);
    }
}

export async function autoSaveFn() {
    if (autosave == 'never') { return; }

    if (autosave == 'always') {
        for (let [key, [filename, content]] of activeTabs) {
            try {
                await invoke('save_file', { filepath: filename, content: content });
            } catch (error) {
                stat(`! Failed to autosave: ${error}`);
                return;
            }
        }
        stat(': Autosaved all files');
    } else if (autosave == 'auto') {
        if (activeTabs.has(currentTab)) {
            let [filename, content] = activeTabs.get(currentTab);
            try {
                await invoke('save_file', { filepath: filename, content: content });
            } catch (error) {
                stat(`! Failed to autosave: ${error}`);
                return;
            }
        }
        stat(': Autosaved current file');
    }
}

export async function openFile() {
    let filepath = await open({ multiple: false, directory: false });
    console.log(filepath);
    if (!filepath) return;

    let extension = getExtension(filepath);
    if (fileTypes.IMAGE.includes(extension) || fileTypes.AUDIO.includes(extension) || fileTypes.VIDEO.includes(extension)) { 
        if (filenameInput.value.trim() !== '' || textarea.value.trim() !== '') {
            addTab(filepath, '');
        } else {
            filenameInput.value = filepath;
        }
        translate(); 
        return;
    }

    let [msg, content] = await invoke('open_file', { filepath: filepath });
    if (content || content == '') {
        if (filenameInput.value.trim() !== '' || textarea.value.trim() !== '') {
            addTab(filepath, content.trim());
        } else {
            filenameInput.value = filepath;
            textarea.value = content.trim();
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
        let [msg, files] = await invoke('open_folder', { dirPath: dir_path });
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
 * At least 1 KNOWN ERROR exists in b-end handling, to do with opening files.
 *
 * `openFolder` attempts to open binary files, which fails (ideally, the b-end
 * would return blank content, which would be imitated in tab handling to ensure
 * the files aren't replaced by 'You cannot edit a multimedia file'...).
 * */
