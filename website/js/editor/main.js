import { stat, textarea, linenumbers, preview } from '../../api/settings.js';

// Line number logic
export function update_linenumbers() { // Sauce: https://webtips.dev/add-line-numbers-to-html-textarea
    const number_of_lines = textarea.value.split('\n').length;

    linenumbers.innerHTML = Array(number_of_lines)
        .fill('<span></span>')
        .join('');
}

export function sync_scroll() { linenumbers.scrollTop = textarea.scrollTop; }

// Wordcount logic
export function get_wordcount() {
    if (textarea.disabled) { return; } // Don't mess with Wordcount if the file is Multimedia (see `translate`)
    const content = textarea.value.trim();
    const chars = content.length;
    const words = (content.match(/\S+/g) || []).length;

    const chars_string = chars.toLocaleString();
    const words_string = words.toLocaleString();

    document.querySelector('div.wordcount span#chars').textContent = chars_string;
    document.querySelector('div.wordcount span#words').textContent = words_string;
}
