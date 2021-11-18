const { app, BrowserWindow } = require('electron');
const path = require('path');
const os = require('os');

function createWindow() {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      maximizable: false,
      resizable: false,
      autoHideMenuBar: true,
      icon: `${__dirname}/res/supertux.ico`,
      webPreferences: {
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js')
      }
    });
  
    win.loadFile('index.html');
}

app.whenReady().then(() => {
  //Don't allow any operating systems other than Windows (for the moment).
    if (os.version().includes("Windows")) {
        createWindow();
    }
    else {
        console.log("Operating systems other than Windows aren't supported for this release. Aborting start.");
        app.quit();
    }
})

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit();
})