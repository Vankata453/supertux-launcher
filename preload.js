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

const { contextBridge } = require('electron');
const isOnline = require("is-online");
const wget = require('wget-improved');
const { exec } = require("child_process");
const os = require('os');
const fs = require('fs');
const path = require('path');

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById("sysInfo").innerHTML += `${os.version()}, ${os.arch()}`;
});

contextBridge.exposeInMainWorld('general',
{
    isOnline: () => {
        return isOnline({timeout:2000});
    }
});
contextBridge.exposeInMainWorld('stManagement',
{
    checkForVersion: (versionName) => {
        return fs.existsSync(path.join(process.env.PROGRAMFILES, "SuperTux", versionName));
    },
    getVersionStartCommands: (versionName) => {
        var execDirectory = `%programfiles%\\SuperTux\\${versionName}\\bin`;
        var startCommand = `supertux2.exe --userdir %appdata%\\SuperTux\\${versionName}`;
        //Set executable location and attributes exceptions for older versions.
        if (versionName == "0.1.1" || versionName == "0.1.2" || versionName == "0.1.3" || versionName == "0.3.0") {
            execDirectory = `%programfiles%\\SuperTux\\${versionName}`;
            startCommand = `supertux.exe`;
        }
        else if (versionName == "0.3.3" || versionName == "0.3.4") {
            execDirectory = `%programfiles%\\SuperTux\\${versionName}`;
            startCommand = `supertux2.exe`;
        }
        else if (versionName.includes("0.3.5")) {
            execDirectory = `%programfiles%\\SuperTux\\${versionName}`;
            startCommand = `supertux2.exe --userdir %appdata%\\SuperTux\\${versionName}`;
        }
        return {execDirectory:execDirectory, startCommand:startCommand};
    },
    getVersionDevModeAttribute: (versionName) => {
        if (versionName.substring(0, 3) == "0.1") {
            return "--debug-mode";
        }
        else {
            return "--developer";
        }
    },
    startVersion: (versionName, startCommands) => {
        if (startCommands) {
            exec(`cd ${startCommands.execDirectory} && ${startCommands.startCommand}`, (error, stderr) => {
                if (error) {
                    console.error(`An error occured while running SuperTux ${versionName} or it was closed unexpectedly!\n${error.message}`);
                    alert(`An error occured while running SuperTux ${versionName} or it was closed unexpectedly!\n${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`An error occured while running SuperTux ${versionName} or it was closed unexpectedly!\n${stderr}`);
                    alert(`An error occured while running SuperTux ${versionName} or it was closed unexpectedly!\n${stderr}`);
                    return;
                }
            });
        }
        else {
            console.error(`An error occured while running SuperTux ${versionName}: No start parameters were set.`);
            alert(`An error occured while running SuperTux ${versionName}: No start parameters were set.`)
        }
    },
    installVersion: (versionName, installUrls, button) => {
        var url64Bit = null;
        var url32Bit = null;
        var currUrl = null;

        for (var i = 0; i < installUrls.length; i++) {
            if (installUrls[i].includes("win32") || installUrls[i].includes("supertux-0.1")) {
                url32Bit = installUrls[i];
            }
            else if (installUrls[i].includes("win64")) {
                url64Bit = installUrls[i];
            }
        }

        //If there's no 64-bit release, choose 32-bit, or else get the release for the current OS architecture.
        if (url64Bit) {
            switch (os.arch()) {
                case "x64":
                    currUrl = url64Bit;
                    break;
                case "x86":
                    currUrl = url32Bit;
                    break;
                case "ia32":
                    currUrl = url32Bit;
                    break;
                default:
                    alert("Error downloading version: Couldn't identify OS architecture.");
                    return;
            }
        }
        else {
            currUrl = url32Bit;
        }

        //Get the last part of the download URL.
        const currUrlSplit = currUrl.split("/");
        var currInstallerName = currUrlSplit[currUrlSplit.length - 1];
        //Cases for older versions from SourceForge that don't have the filename in the last part of the URL.
        if (!currInstallerName.includes(".msi") && !currInstallerName.includes(".exe")) {
            currInstallerName = currUrlSplit[currUrlSplit.length - 2];
        }
        const currInstallerFormat = currInstallerName.substring(currInstallerName.length - 3).toUpperCase();
        const currInstallerPath = `${__dirname}\\res\\installer_data\\${currInstallerName}`;
        const currInstallerLogPath = `${__dirname}\\res\\installer_data\\st_latest_install.log`;
        const progressPercentage = document.getElementById("progressPercentage");
        const progressBar = document.getElementById("progressBar");
        const statusInfo = document.getElementById("statusInfo");

        //Reset the progress bar and its data and make it visible.
        progressBar.classList.remove("bg-success");
        progressBar.classList.add("no-transition");
        progressBar.style.width = "0%";
        progressBar.setAttribute("ariaS-valuenow", "0");
        progressBar.classList.remove("no-transition");
        progressBar.parentNode.style.visibility = "visible";
        progressPercentage.innerHTML = "0%";
        statusInfo.innerHTML = "Downloading release...";

        //Download installer.
        var download = wget.download(currUrl, `${__dirname}/res/installer_data/${currInstallerName}`);
        download.on('progress', function(progress) {
            progressPercentage.innerHTML = `${Math.floor(progress * 100)}%`
            progressBar.style.width = `${(progress * 100).toFixed(1)}%`;
            progressBar.setAttribute("aria-valuenow", (progress * 100).toFixed(1));
        });
        download.on('end', function(output) {
            console.log(output);
            progressBar.classList.add("bg-success");
            statusInfo.innerHTML = "Release downloaded! Installing...";
            //Create install command variable, set them according to the file if needed and install the version.
            var installCommand = null;
            if (currInstallerFormat == "EXE") {
                installCommand = `\"${currInstallerPath}\" /DIR=\"%programfiles%\\SuperTux\\${versionName}\" /SILENT /NORESTART /ALLUSERS`;
                //Add 0.3.3's NullSoft installer exception.
                if (versionName.includes("0.3.3")) {
                    installCommand = `\"${currInstallerPath}\" /S /D=%programfiles%\\SuperTux\\${versionName}`
                }
            }
            else if (currInstallerFormat == "MSI") {
                installCommand = `msiexec /i \"${currInstallerPath}\" /qb! /l* \"${currInstallerLogPath}\" INSTALL_ROOT=\"%programfiles%\\SuperTux\\${versionName}\" TRANSFORMS=\"stmsimod.mst\"`;
            }
            //If the insatller isn't MSI or EXE:
            else {
                alert("Error installing version: Couldn't identify installer file format.");
                //Revert button to "Install", because the action failed.
                button.removeAttribute("disabled");
                button.innerHTML = "Install";
                return;
            }
            //Execute the chosen command.
            exec(installCommand, (error, stderr) => {
                if (error || stderr) {
                    if (error) {
                        console.error(`Error installing ${currInstallerFormat}!\n${error.message}`);
                        alert(`Error installing ${currInstallerFormat}!\n${error.message}`);
                    }
                    else if (stderr) {
                        console.error(`Error installing ${currInstallerFormat}!\n${stderr}`);
                        alert(`Error installing ${currInstallerFormat}!\n${stderr}`);
                    }
                    //Check if the installer exists (incase) and delete it if it does. Display errors otherwise.
                    if (fs.existsSync(currInstallerPath)) {
                        try {
                            fs.unlinkSync(currInstallerPath);
                        }
                        catch (err) {
                            console.error(`Error deleting installer file, so it wasn't deleted. Error: ${err}`);
                            alert(`Error deleting installer file, so it wasn't deleted. Error: ${err}`);
                        }
                    }
                    else {
                        console.error("Error finding installer file, so it won't be deleted.");
                        alert("Error finding installer file, so it won't be deleted.");
                    }
                    //Hide the progress bar and empty the status info.
                    progressBar.parentNode.style.visibility = null;
                    statusInfo.innerHTML = null;
                    //Revert button to "Install", because the action failed.
                    button.removeAttribute("disabled");
                    button.innerHTML = "Install";
                    return;
                }
                //Code to execute on successful installation.
                //Check if the installer exists (incase) and delete it if it does. Display errors otherwise.
                if (fs.existsSync(currInstallerPath)) {
                    try {
                        fs.unlinkSync(currInstallerPath);
                    }
                    catch (err) {
                        console.error(`Error deleting installer file, so it wasn't deleted. Error: ${err}`);
                        alert(`Error deleting installer file, so it wasn't deleted. Error: ${err}`);
                    }
                }
                else {
                    console.error("Error finding installer file, so it won't be deleted.");
                    alert("Error finding installer file, so it won't be deleted.");
                }
                //Hide the progress bar and empty the status info.
                progressBar.parentNode.style.visibility = null;
                statusInfo.innerHTML = null;
                //Because everything is successful, make the button "Play!".
                button.classList.remove("btn-secondary");
                button.classList.add("btn-success");
                button.parentNode.classList.remove("ver-install");
                button.removeAttribute("disabled");
                button.innerHTML = "Play!";
                //Add a dropdown next to the "Play!" button by firing an event on the current release's row in page.js.
                const releaseRow = button.parentNode.parentNode;
                releaseRow.dispatchEvent(new Event("addDropdown"));
            });
        });
        download.on('error', function(err) {
            console.error(`Error downloading version! ${err}`);
            alert(`Error downloading version! ${err}`);
            //Check if the installer exists (incase) and delete it if it does. Display errors otherwise.
            if (fs.existsSync(currInstallerPath)) {
                try {
                    fs.unlinkSync(currInstallerPath);
                }
                catch (err) {
                    console.error(`Error deleting installer file, so it wasn't deleted. Error: ${err}`);
                    alert(`Error deleting installer file, so it wasn't deleted. Error: ${err}`);
                }
            }
            else {
                console.error("Error finding installer file, so it won't be deleted.");
                alert("Error finding installer file, so it won't be deleted.");
            }
            //Hide the progress bar and empty the status info.
            progressBar.parentNode.style.visibility = null;
            statusInfo.innerHTML = null;
            //Revert button to "Install", because the action failed.
            button.removeAttribute("disabled");
            button.innerHTML = "Install";
        });
    },
    openInstallDir: (versionName) => {
        exec(`explorer %programfiles%\\SuperTux\\${versionName}`);
    },
    openDataDir: (versionName) => {
        //Predefine the needed variables and set their data to be valid for the newest versions by default.
        var envVariable = process.env.APPDATA;
        var dirToOpen = `SuperTux\\${versionName}`;
        //Check if a data folder of an older SuperTux version is requested and if so - change the variables' values accordingly.
        if (versionName.substring(0, 3) == "0.1") {
            envVariable = process.env.USERPROFILE;
            dirToOpen = ".supertux";
        }
        else if (versionName == "0.3.3" || versionName == "0.3.4") {
            envVariable = process.env.LOCALAPPDATA;
            dirToOpen = `VirtualStore\\Program Files\\SuperTux\\${versionName}`;
        }
        //Check if the directory exists. If it does, open it, alert the user otherwise.
        var directory = path.join(envVariable, dirToOpen);
        if (fs.existsSync(directory)) {
            exec(`explorer ${directory}`);
        }
        else {
            alert(`The directory you're trying to open currently doesn't exist. Non-existent directory: ${directory}`);
        }
    },
    uninstallVersion: (versionName, button) => {
        const releaseDropdown = document.getElementById(button.id.replace("Button", "Dropdown"));
        //Get only first 5 characters (3 version fields, excluding dots) from the version's name, because more than three fields are not used in a release's ProductVersion.
        const productVersion = versionName.substring(0, 5);
        //Set the uninstall command for 0.4.x and above first.
        var uninstallCommand = `wmic product where \"name='SuperTux' and version='${productVersion}'\" call uninstall`;
        //Change it to 0.3.x and below if needed.
        if (versionName.substring(0, 3) == "0.1" || versionName.substring(0, 3) == "0.3") {
            uninstallCommand = `\"%programfiles%\\SuperTux\\${versionName}\\unins000.exe\"`;
            //Add 0.3.3's NullSoft uninstaller exception.
            if (versionName == "0.3.3") {
                uninstallCommand = `\"%programfiles%\\SuperTux\\${versionName}\\Uninstall.exe\"`;
            }
        }
        //Add "Start-Process" and its attributes to the command to request elevated permissions.
        uninstallCommand = `Start-Process cmd -WindowStyle Hidden -Verb RunAs {/C \"${uninstallCommand}\"}`;
        //Execute the uninstall command.
        exec(uninstallCommand, {'shell':'powershell.exe'}, (error) => {
            if (error) {
                console.error(`Error uninstalling ${versionName}!\n${error.message}`);
                alert(`Error uninstalling ${versionName}!\n${error.message}`);
                //Revert button to "Play!" and show its dropdown, because the action failed.
                button.classList.remove("btn-secondary");
                button.classList.add("btn-success");
                button.removeAttribute("disabled");
                button.innerHTML = "Play!";
                releaseDropdown.style.visibility = null;
                return;
            }
            //If everything is successful, make the button "Install" and remove its dropdown.
            button.classList.remove("btn-secondary");
            button.classList.add("btn-primary");
            button.removeAttribute("disabled");
            button.innerHTML = "Install";
            button.parentNode.classList.add("ver-install");
            releaseDropdown.remove();
        });
    }
});