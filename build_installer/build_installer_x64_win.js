const { MSICreator } = require('electron-wix-msi');
const path = require('path');

const APP_DIR = path.resolve(__dirname, '../SuperTux Launcher-win32-x64'); 
const OUT_DIR = path.resolve(__dirname, '../windows_installer_x64');

const msiCreator = new MSICreator({
    appDirectory: APP_DIR,
    outputDirectory: OUT_DIR,
    description: 'A simple and easy to use SuperTux launcher, featuring all versions of the game.',
    exe: 'SuperTux Launcher',
    name: 'SuperTux Launcher',
    manufacturer: 'Vankata453',
    version: '0.1.0',
	arch: 'x64',
	appIconPath: path.resolve(__dirname, '../res/supertux.ico'),
	
    ui: {
        chooseDirectory: true,
		images: {
			background: path.resolve(__dirname, '../res/wix_installer_images/installer_dialog.bmp'),
			banner: path.resolve(__dirname, '../res/wix_installer_images/installer_banner.bmp'),
			exclamationIcon: path.resolve(__dirname, '../res/supertux.ico'),
			infoIcon: path.resolve(__dirname, '../res/supertux.ico')
		}
    },
});

msiCreator.create().then(function() {
    msiCreator.compile();
});