import { stat, textarea, filenameInput, lineNumbers, preview } from '../api/settings.js';
import { currentTab, switchTab } from '../js/editor/tabs.js';
import { updateLineNumbers, getWordCount, syncScroll } from '../js/editor/main.js';
import init, { write_markdown } from '../api/wasm/writer.js';

let zoomLvl = 1;

// Closest thing (in JS) to an Enum for storing Filetypes
export const fileTypes = {
    BINARY: ['exe', 'out', 'rpm', 'deb', 'bin', 'dll', 'app', 'com', 'msi', 'apk', 'aab', 'dmg', 'iso', 'jar', 'war', 'class', 'img', 'o', 'd'],
    WEB: ['html', 'htm', 'svg', 'mhtm', 'mhtml', 'xml', 'php', 'xhtml'],
    ASCIIDOC: ['ad', 'adoc', 'asciidoc'],
    PLAINTEXT: ['txt', 'log', 'npmignore', 'gitignore', 'csv', 'tsv', 'ini'],
    CODE: ['js', 'ts', 'py', 'java', 'c', 'cp', 'cpp', 'cs', 'go', 'rb', 'php', 'swift', 'kt', 'css', 'json', 'yaml', 'toml', 'sh', 'bash', 'pl', 'r', 'sql', 'dart', 'scala', 'elixir', 'rs', 'haskell', 'clj', 'cljc', 'vb', 'objective-c', 'groovy', 'lua', 'pas', 'plsql', 'sol', 'scss', 'less', 'm', 'yaml', 'toml'],
    LATEX: ['tex', 'latex', 'cls', 'sty'],
    IMAGE: ['jpg', 'jpeg', 'png', 'ico', 'jfif', 'bruh', 'gif', 'bmp', 'tiff', 'webp', 'heif', 'heic'], 
    AUDIO: ['mp3', 'wav', 'aac', 'ogg', 'oga', 'flac', 'm4a', 'wma', 'opus'],
    VIDEO: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'mpeg', 'mpg', '3gp'],
};

export function extractFilename(path) { 
    const name = path.split('/').pop(); 
    return name.split('\\').pop(); 
}

export function getExtension(name) { 
    const parts = name.toLowerCase().split('.'); 
    return parts.length > 1 ? parts.pop() : ''; 
}

// Render multimedia based on file extension
export function renderMultimedia(binaryData, extension) {
    const blob = new Blob([binaryData]);
    const url = URL.createObjectURL(blob);

    if (fileTypes.IMAGE.includes(extension)) {
        preview.innerHTML = `<img src="${url}" title="image preview" alt="image preview" style="max-width:100%; height:auto;" />`;
    } else if (fileTypes.AUDIO.includes(extension)) {
        preview.innerHTML = `<audio controls alt="audio player"><source src="${url}" type="audio/${extension}">Your WebView does not support the audio tag.</audio>`;
    } else if (fileTypes.VIDEO.includes(extension)) {
        preview.innerHTML = `<video controls style="max-width:100%;" alt="video preview"><source src="${url}" type="video/${extension}">Your WebView does not support the video tag.</video>`;
    }

    URL.revokeObjectURL(url);
}

// Event Loop
export async function translate() {
    await init({});

    const input = textarea.value.trim() || 'This document is empty.';
    const extension = getExtension(filenameInput.value.trim());

    if (!extension || filenameInput.value.trim() == '') {
        textarea.disabled = false;
        preview.innerHTML = `<h3>This file seems to have no extension.</h3><hr>${write_markdown(input)}`;
    } else if (fileTypes.WEB.includes(extension)) {
        textarea.disabled = false;
        preview.innerHTML = input;
    } else if (fileTypes.ASCIIDOC.includes(extension)) {
        textarea.disabled = false;
        preview.innerHTML = `<h1>Rnotes does not support AsciiDoc yet.</h1><pre>${input}</pre>`;
    } else if (fileTypes.PLAINTEXT.includes(extension)) {
        textarea.disabled = false;
        preview.innerHTML = `<pre>${input}</pre>`;
    } else if (fileTypes.CODE.includes(extension)) {
        textarea.disabled = false;
        preview.innerHTML = `<code><pre>${input}</pre></code>`;
    } else if (fileTypes.LATEX.includes(extension)) {
        textarea.disabled = false;
        preview.innerHTML = `<h1>LaTeX files are not supported for rendering.</h1><pre>${input}</pre>`;
    } else if (fileTypes.IMAGE.includes(extension) || fileTypes.AUDIO.includes(extension) || fileTypes.VIDEO.includes(extension)) {
        textarea.value = 'Install Rote Notes to allow filesystem access and preview Multimedia.';
    } else {
        const convertedMd = write_markdown(input);
        preview.innerHTML = convertedMd;
    }
    updateLineNumbers();
    getWordCount();
    syncScroll();
}

// Adjust zoom function
export function adjustZoom(cmd = '=') {
    switch (cmd) {
        case '+':
            zoomLvl += 0.1;
            break;
        case '-':
            zoomLvl -= 0.1;
            break;
        case '=':
        default:
            zoomLvl = 1;
            break;
    }

    [lineNumbers, textarea, filenameInput, preview].forEach(el => {
        el.style.fontSize = `${zoomLvl}rem`;
        el.style.lineHeight = `${zoomLvl}rem`;
    });
}
