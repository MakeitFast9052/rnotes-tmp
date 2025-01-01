// Tab Handling (yes this needs a separate file)
import { invoke, stat, filenameInput, textarea, preview, saveSession } from '../../api/settings.js';
import { extractFilename, getExtension, translate } from '../../api/f-end.js';

export let currentTab = 0;
export let tabCount = 0;

export let activeTabs = new Map(); // Key: Tab ID, Value: [filename, content]

// Load saved session -- if any
export async function loadCache() {
    try {
        const [msg, content] = await invoke('cache', { kind: 'load', data: '' });

        stat(msg);

        if (content) {
            const loadedTabs = new Map(Object.entries(JSON.parse(content)));
            activeTabs = new Map();
            tabCount = 0;

            for (const [key, [filename, content]] of loadedTabs) {
                ++tabCount;
                activeTabs.set(tabCount, [filename, content]);
            }
            switchTab(1);
        } else {
            activeTabs = new Map();
            addTab('', '');
        }
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
    cacheTabs();    // bc This might be invoked by `openFile`
}

// Switch to tab by key + wrapping logic
export async function switchTab(key = currentTab) {
    if (key < 1) {
        key = tabCount;
    } else if (key > tabCount) {
        key = 1;
    }

    if (!activeTabs.has(key)) { return null; } // This is done after because if they try to overflow before we wrap it'll always fail

    // Save the current tab's content before switching
    saveTab(currentTab);

    // Update the current tab to the new tab
    const [filename, content] = activeTabs.get(key);
    filenameInput.value = filename;
    textarea.value = content;
    currentTab = key;

    // Update the tab display
    const tabHandle = document.querySelector('div.tabhandle');
    tabHandle.innerHTML = '';

    for (const [tabKey, [filename]] of activeTabs) {
        const tabElement = document.createElement('button');
        tabElement.textContent = filename ? extractFilename(filename) : 'New Tab';
        tabElement.className = 'tab-button';

        tabElement.setAttribute('aria-selected', tabKey === currentTab ? 'true' : 'false');

        if (tabKey === currentTab) {
            tabElement.classList.add('active');
        }

        tabElement.addEventListener('click', () => {
            switchTab(tabKey);
        });

        tabHandle.appendChild(tabElement);
    }
    // Reset the NewTab button
    const newTab = document.createElement('button');
    newTab.classList = 'NewTab';
    newTab.textContent = '+';
    tabHandle.appendChild(newTab);

    // Save the new current tab
    saveTab(currentTab);
    translate();
    if (saveSession === 'always') { cacheTabs(); }
}

// Save a Tab's contents
export function saveTab(key = currentTab) {
    if (!activeTabs.has(key)) { return null; }
    const textValue = textarea.disabled ? '' : textarea.value;
    activeTabs.set(key, [filenameInput.value, textValue]);

    const tabHandle = document.querySelector('div.tabhandle');
    const tabButtons = tabHandle.querySelectorAll('.tab-button');
    if (tabButtons.length > 0 && tabButtons[key - 1]) { // `key - 1` because tab keys are 1-based
        tabButtons[key - 1].textContent = filenameInput.value ? extractFilename(filenameInput.value) : 'New Tab';
    }

    if (saveSession === 'always') { cacheTabs(); } // bc `saveTab` is called on every translate
}

// Cache Tabs to Disk (based on settings)
export async function cacheTabs() {
    if (saveSession === 'never') { return; }
    const cacheData = JSON.stringify(Object.fromEntries(activeTabs));

    try {
        const [msg, content] = await invoke('cache', { kind: 'save', data: cacheData });
        stat(msg);
    } catch (error) {
        stat(`! Error caching tabs: ${error.message}`);
    }
}

// Remove current tab
export function rmTab(key = currentTab) {
    if (!activeTabs.has(key)) { 
        stat(`# Tab does not exist: ${key}`); 
        return; 
    }
    
    if (tabCount == 1) { addTab(); rmTab(key); stat(`: Removed tab ${key}`); return; }

    activeTabs.delete(key);

    const updatedTabs = new Map();
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
        key = key > tabCount ? tabCount : key;
    }

    cacheTabs();
    switchTab(1);

    stat(`: Removed tab ${key}`);
}
