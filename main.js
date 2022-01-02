/*
* This program is free software: you can redistribute it and/or modify  
* it under the terms of the GNU General Public License as published by  
* the Free Software Foundation, version 3.
*
* This program is distributed in the hope that it will be useful, but 
* WITHOUT ANY WARRANTY; without even the implied warranty of 
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU 
* General Public License for more details.
*
* You should have received a copy of the GNU General Public License 
* along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

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
      icon: path.join(__dirname, 'res', 'supertux.ico'),
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