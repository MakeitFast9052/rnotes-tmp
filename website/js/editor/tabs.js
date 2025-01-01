// Tab Handling (yes this needs a separate file)
import { stat, filenameInput, textarea, } from '../../api/settings.js';
import { extractFilename, translate } from '../../api/f-end.js';

export let currentTab = 0;
export let tabCount = 0;

export let activeTabs = new Map();

// Load saved session -- if any
export async function loadCache() {
    try {
        activeTabs = new Map();
        addTab('', '');
    } catch (error) {
        stat(`! Error loading session: ${error.message}`);
        activeTabs = new Map();
        tabCount = 0;
        addTab('', '');
    }
}

// Add a new tab with provided filename-content as an Array
export function addTab(filename = '', content = '') {
    saveTab(currentTab);
    tabCount += 1;
    activeTabs.set(tabCount, [filename.trim(), content]);
    switchTab(tabCount);
}

// Switch to tab by key + wrapping logic
export async function switchTab(key = currentTab) {
    if (key < 1) {
        key = tabCount;
    } else if (key > tabCount) {
        key = 1;
    }

    if (!activeTabs.has(key)) { return null; }

    saveTab(currentTab);
    const [filename, content] = activeTabs.get(key);
    filenameInput.value = filename;
    textarea.value = content;
    currentTab = key;
    saveTab(currentTab);
    translate();
}

// Save a Tab's contents
function saveTab(key = currentTab) {
    if (!activeTabs.has(key)) { return null; }
    const textValue = textarea.disabled ? '' : textarea.value;
    activeTabs.set(key, [filenameInput.value, textValue]);

    const tabHandle = document.querySelector('div.tabhandle');
    tabHandle.innerHTML = '';

   
    for (const [tabKey, [filename]] of activeTabs) {
        const tabElement = document.createElement('button');
        tabElement.textContent = filename ? extractFilename(filename) : 'New Tab';
        tabElement.className = 'tab-button';

        if (tabKey === currentTab) {
            tabElement.classList.add('active');
        }

        tabElement.addEventListener('click', () => {
            switchTab(tabKey);
        });

        tabHandle.appendChild(tabElement);
    }

   
    const newTab = document.createElement('button');
    newTab.classList = 'NewTab';
    newTab.textContent = '+';
    tabHandle.appendChild(newTab);
}

// Remove current tab
export function rmTab() {
    if (!activeTabs.has(currentTab)) {
        stat(`# Tab does not exist: ${currentTab}`);
        return;
    }

    if (tabCount === 1) { 
        const tmp = currentTab; 
        addTab('', '');
        rmTab(tmp);
        return; 
    }

    activeTabs.delete(currentTab);

    const updatdTabs = new Map();
    let newKey = 1;
    activeTabs.forEach(([filename, content], oldKey) => {
        updatedTabs.set(newKey, [filename, content]);
        newKey++;
    });
    activeTabs = updatedTabs;

    tabCount = activeTabs.size;

    if (tabCount === 0) {
        addTab('', '');
    } else {
        currentTab = currentTab > tabCount ? tabCount : currentTab;
        switchTab(currentTab);
    }

    saveTab();

    stat(`: Removed tab ${currentTab}`);
}
