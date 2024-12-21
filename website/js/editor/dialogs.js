const dialogs = {
    linux: document.querySelector('dialog.lin-download'),
    // android: document.querySelector('dialogs.droid-download')
};

// Linux
document.querySelector('#d-linux').addEventListener('click', () => { dialogs.linux.showModal(); });
dialogs.linux.querySelector('button.close').addEventListener('click', () => { dialogs.linux.close(); });

// Android
// document.querySelector('#d-android').addEventListener('click', () => { dialogs.android.showModal(); });
// dialogs.macos.querySelector('button.close').addEventListener('click', () => { dialogs.android.close(); });
