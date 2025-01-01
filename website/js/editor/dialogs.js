import { stat, filenameInput, textarea, saveSession } from '../../api/settings.js';
import { translate, adjustZoom } from '../../api/f-end.js';
import { tabCount, currentTab, loadCache, switchTab, addTab, rmTab, } from '../editor/tabs.js';

// Dialog Handling
const dialogs = {
    linux: document.querySelector('dialog.lin-download'),
    windows: document.querySelector('dialog.win-download'),
    keybinds: document.querySelector('dialog.kbd-shortcuts'),
};

// Linux
document.querySelector('#d-linux').addEventListener('click', () => { dialogs.linux.showModal(); });
dialogs.linux.querySelector('button.close').addEventListener('click', () => { dialogs.linux.close(); });

// Windows
document.querySelector('#d-windows').addEventListener('click', () => { dialogs.windows.showModal(); });
dialogs.windows.querySelector('button.close').addEventListener('click', () => { dialogs.windows.close(); });

// Keybinds
document.querySelector('#v-kbd').addEventListener('click', () => { dialogs.keybinds.showModal(); });
dialogs.keybinds.querySelector('button.close').addEventListener('click', () => { dialogs.keybinds.close(); });

const actionMap = {
    addTab: () => addTab('', ''),
    rmTab,
    previousTab: () => switchTab(--currentTab),
    nextTab: () => switchTab(++currentTab),
    zoomIn: () => adjustZoom('+'),
    resetZoom: () => adjustZoom('='),
    zoomOut: () => adjustZoom('-'),
};

function initKbd() {
    const buttons = dialogs.keybinds.querySelectorAll('.kbd-entry button');
    let activeIndex = 0;

    buttons.forEach((btn) => {
        const action = btn.dataset.action;
        if (action && actionMap[action]) {
            btn.addEventListener('click', actionMap[action]);
        }
    });

    function highlightButton(index) {
        buttons.forEach((btn, i) => {
            btn.style.outline = i === index ? '0.12rem solid var(--primary-accent)' : 'none';
        });
    }

    highlightButton(activeIndex);

    dialogs.keybinds.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();

        if (key === 'arrowdown') {
            activeIndex = (activeIndex + 1) % buttons.length;
            highlightButton(activeIndex);
            event.preventDefault();
        } else if (key === 'arrowup') {
            activeIndex = (activeIndex - 1 + buttons.length) % buttons.length;
            highlightButton(activeIndex);
            event.preventDefault();
        } else if (key === 'enter') {
            const activeButton = buttons[activeIndex];
            const action = activeButton.dataset.action;
            if (action && actionMap[action]) {
                actionMap[action]();
            }
            event.preventDefault();
        } else if (key === 'escape') {
            dialogs.keybinds.close();
            event.preventDefault();
        }
    });

    buttons.forEach((btn, index) => {
        btn.addEventListener('mouseenter', () => highlightButton(index));
    });
}

initKbd();
