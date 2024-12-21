import { invoke, stat, textarea, filename_input, preview, autosave, } from '../api/settings.js';
import { file_types, get_extension, translate, render_multimedia, } from '../api/f-end.js';
import { active_tabs, add_tab, switch_tab, current_tab, } from '../js/editor/tabs.js';
export const { open, save } = window.__TAURI__.dialog;

// APIs for File Handling
export async function save_file() {
    let filename = filename_input.value;
    let extension = get_extension(filename);

    if (!filename || filename == '') { save_file_as(); return; }

    if (file_types.IMAGE.includes(extension) || file_types.AUDIO.includes(extension) || file_types.VIDEO.includes(extension)) { stat('# Cannot save Multimedia Files'); return; }

    let content = textarea.value;
    let msg = await invoke('save_file', { filepath: filename, content: content });
    stat(msg);
}

export async function save_file_as() {
    let filepath = await save({ defaultPath: filename_input.value });
    if (filepath) {
        let msg = await invoke('save_file', { filename: filepath.trim(), content: textarea.value });
        stat(msg);
    }
}

export async function autosave_fn() {
    if (autosave == 'never') { return; }

    if (autosave == 'always') {
        for (let [key, [filename, content]] of active_tabs) {
            try {
                await invoke('save_file', { filepath: filename, content: content });
            } catch (error) {
                stat(`! Failed to autosave: ${error}`);
            }
        }
        stat(': Autosaved all files');
    } else if (autosave == 'auto') {
        if (active_tabs.has(current_tab)) {
            let [filename, content] = active_tabs.get(current_tab);
            try {
                await invoke('save_file', { filepath: filename, content: content });
            } catch (error) {
                stat(`! Failed to autosave: ${error}`);
            }
        }
        stat(': Autosaved current file');
    }
}

export async function open_file() {
    let filepath = await open({ multiple: false, directory: false, });
    console.log(filepath);
    if (!filepath) return;

    let extension = get_extension(filepath);
    if (file_types.IMAGE.includes(extension) || file_types.AUDIO.includes(extension) || file_types.VIDEO.includes(extension)) { 
        if (textarea.value.trim() !== '') {
            add_tab(filepath, '');
        } else {
            filename_input.value = filepath;
        }
        translate(); return;
    }

    let [msg, content] = await invoke('open_file', { filepath: filepath });
    if (content) {
        if (textarea.value.trim() !== '') {
            add_tab(filepath, content);
        } else {
            filename_input.value = filepath;
            textarea.value = content.trim('\n');
        }
        stat(msg);
        translate();
        switch_tab(current_tab);
    }
}

export async function open_folder() {
    let dir_path = await open({ multiple: false, directory: true });
    if (!dir_path) return;

    try {
        let [msg, files] = await invoke('open_folder', { dirPath: dir_path });
        stat(msg);

        if (files && typeof files === 'object') {
            Object.entries(files).forEach(([filename, content]) => {
                add_tab(`${dir_path}/${filename}`, content);
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
export async function open_settings() {
    let msg = await invoke('settings', { kind: 'open', data: '' });
    stat(msg);
}

/* DevNotes:
 * 
 * At least 2 KNOWN ERRORS exist in b-end handling, both to do with opening
 * files.
 *
 * Both `open_file` is and `open_folder` fail to open Binary files (they should
 * skip them) and because blank files return an empty string, JS tends to ignore
 * them (if-clause checking for content).
 *
 * `open_folder` attempts to open binary files, which fails (ideally it would return
 * blank content, which would be imitated in tab handling...).
 * */
