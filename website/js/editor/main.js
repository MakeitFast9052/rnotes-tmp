import { stat, textarea, lineNumbers, preview } from '../../api/settings.js';

// Line number logic
export function updateLineNumbers() { // Sauce: https://webtips.dev/add-line-numbers-to-html-textarea
    const numberOfLines = textarea.value.split('\n').length;

    lineNumbers.innerHTML = Array(numberOfLines)
        .fill('<span></span>')
        .join('');
}

export function syncScroll() { 
    lineNumbers.scrollTop = textarea.scrollTop; 
}

// Word count logic
export function getWordCount() {
    if (textarea.disabled) { return; } // Don't mess with wordcount if the file is multimedia (see `translate`)
    const content = textarea.value.trim();
    const chars = content.length;
    const words = (content.match(/\S+/g) || []).length;

    const charsString = chars.toLocaleString();
    const wordsString = words.toLocaleString();

    document.querySelector('div.wordcount span#chars').textContent = charsString;
    document.querySelector('div.wordcount span#words').textContent = wordsString;
}
