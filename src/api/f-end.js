import { stat, invoke, textarea, filename_input, linenumbers, preview, } from '../api/settings.js';
import { update_linenumbers, get_wordcount, sync_scroll, } from '../js/editor/main.js';
import { save_tab, } from '../js/editor/tabs.js';
import init, { write_markdown, } from '../api/wasm/writer.js';
const { readFile } = window.__TAURI__.fs;

let zoom_lvl = 1;

// Closest thing (in JS) to an Enum for storing Filetypes
export const file_types = {
    BINARY: ['exe', 'out', 'rpm', 'deb', 'bin', 'dll', 'app', 'com', 'msi', 'apk', 'aab', 'dmg', 'iso', 'jar', 'war', 'class', 'img', 'o', 'd'],
    WEB: ['html', 'htm', 'svg', 'mhtm', 'mhtml', 'xml', 'php', 'xhtml'],
    ASCIIDOC: ['ad', 'adoc', 'asciidoc'],
    PLAINTEXT: ['txt', 'log', 'npmignore', 'gitignore', 'csv', 'tsv', 'ini'],
    CODE: ['js', 'ts', 'py', 'java', 'c', 'cp', 'cpp', 'cs', 'go', 'rb', 'php', 'swift', 'kt', 'css', 'json', 'json5', 'yaml', 'toml', 'sh', 'bash', 'pl', 'r', 'sql', 'dart', 'scala', 'elixir', 'rs', 'haskell', 'clj', 'cljc', 'vb', 'objective-c', 'groovy', 'lua', 'pas', 'plsql', 'sol', 'scss', 'less', 'm'],
    LATEX: ['tex', 'latex', 'cls', 'sty'],
    IMAGE: ['jpg', 'jpeg', 'png', 'ico', 'jfif', 'bruh', 'gif', 'bmp', 'tiff', 'webp', 'heif', 'heic'], 
    AUDIO: ['mp3', 'wav', 'aac', 'ogg', 'oga', 'flac', 'm4a', 'wma', 'opus'],
    VIDEO: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'mpeg', 'mpg', '3gp'],
};

export function extract_filename(path) { const name = path.split('/').pop(); return name.split('\\').pop(); }

export function get_extension(name) { const parts = name.toLowerCase().split('.'); return parts.length > 1 ? parts.pop() : ''; }

// Render multimedia based on file extension
export function render_multimedia(binary_data, extension) {
    const blob = new Blob([binary_data]);
    const url = URL.createObjectURL(blob);

    if (file_types.IMAGE.includes(extension)) {
        preview.innerHTML = `<img src="${url}" title="image preview" alt="image preview" style="max-width:100%; height:auto;" />`;
    } else if (file_types.AUDIO.includes(extension)) {
        preview.innerHTML = `<audio controls" alt="audio player">><source src="${url}" type="audio/${extension}">Your WebView does not support the audio tag.</audio>`;
    } else if (file_types.VIDEO.includes(extension)) {
        preview.innerHTML = `<video controls style="max-width:100%;" alt="video preview"><source src="${url}" type="video/${extension}">Your WebView does not support the video tag.</video>`;
    }

    URL.revokeObjectURL(url);
}

// Event Loop
export async function translate() {
    await init({});

    const input = textarea.value.trim() || 'This document is empty.';
    const extension = get_extension(filename_input.value.trim());

    if (!extension || filename_input.value.trim() == '') {
        textarea.disabled = false;
        preview.innerHTML = `<h3>This file seems to have no extension.</h3><hr>${write_markdown(input)}`;
    } else if (file_types.BINARY.includes(extension)) {
        preview.innerHTML = `<p>Rnotes does not support Binary file reading.</p>`;
    } else if (file_types.WEB.includes(extension)) {
        textarea.disabled = false;
        preview.innerHTML = input;
    } else if (file_types.ASCIIDOC.includes(extension)) {
        textarea.disabled = false;
        preview.innerHTML = `<h1>Rnotes does not support AsciiDoc yet.</h1><hr><pre>${input}</pre>`;
    } else if (file_types.PLAINTEXT.includes(extension)) {
        textarea.disabled = false;
        preview.innerHTML = `<pre>${input}</pre>`;
    } else if (file_types.CODE.includes(extension)) {
        textarea.disabled = false;
        preview.innerHTML = `<code><pre>${input}</pre></code>`;
    } else if (file_types.LATEX.includes(extension)) {
        textarea.disabled = false;
        preview.innerHTML = `<h1>LaTeX files are not supported for rendering.</h1><hr><pre>${input}</pre>`;
    } else if (file_types.IMAGE.includes(extension) || file_types.AUDIO.includes(extension) || file_types.VIDEO.includes(extension)) {
        const binary_data = await readFile(filename_input.value);
        render_multimedia(binary_data, extension);
        textarea.value = 'You cannot edit a Multimedia file.';
        textarea.disabled = true;
    } else {
        const converted_md = write_markdown(input);
        preview.innerHTML = converted_md;
    }
    update_linenumbers();
    get_wordcount();
    sync_scroll();
    save_tab();
}

// Adjust zoom function
export function adjust_zoom(cmd = '=') {
    switch (cmd) {
        case '+':
            zoom_lvl += 0.1;
            break;
        case '-':
            zoom_lvl -= 0.1;
            break;
        case '=':
        default:
            zoom_lvl = 1;
            break;
    }

    [linenumbers, textarea, filename_input, preview].forEach(el => {
        el.style.fontSize = `${zoom_lvl}rem`;
        el.style.lineHeight = `${zoom_lvl}rem`;
    });
}
