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

function initialPageConfiguration() {
    configureButtons();
    configureDescriptions();
    configureDropdownElements();
    configureLauncherOptions();
    confgureOtherElements();
}

//Get the version's data from the storage.
function getVersionData(releaseId) {
    return localStorage.getItem(releaseId).split("-|||-");
}

//Get version's data and name.
function getVersionName(versionData, fullName = "false") {
    if (fullName.toLowerCase() == "true") {
        return versionData[0];
    }
    else {
        var versionNameSplit = versionData[0].split(" ");
        if (versionNameSplit.length > 1) versionNameSplit.shift();
        return versionNameSplit.join("-");
    }
}

function configureButtons() {
    //Button styling with auto focus.
    var allButtons = document.getElementsByClassName("btn");
    for (button of allButtons) {
        button.addEventListener("mouseover", function() {this.focus()});
        button.addEventListener("mouseleave", function() {this.blur()});
        if (button.classList.contains("release-btn") && button.disabled == false) {
            //Get the id of the current row to get the release's id. After that, get some version data.
            const releaseId = button.parentNode.parentNode.id;
            const versionData = getVersionData(releaseId);
            const versionName = getVersionName(versionData, releaseId);

            //Set the button's style, according to if it's installed.
            if (window.stManagement.checkForVersion(versionName)) {
                //Change the button's style accordingly.
                button.classList.remove("btn-secondary");
                button.classList.add(button.getAttribute("isNightly") == "true" ? "btn-warning" : "btn-success");
                button.innerHTML = "Play!";
                //Add a dropdown for additional options.
                addDropdown("", "btn-secondary", 
                    [{name:"Custom start", class:"customStartOption"}, {divider:true}, {name:"Open installation's directory", action:"openInstallDir"},
                    {name:"Open data directory", action:"openDataDir"}, {divider:true}, {name:"Uninstall", class:"uninstallOption"}], releaseId, true);
            }
            else {
                const currentCell = button.parentNode;
                //Add an additional class to the current button's cell.
                currentCell.classList.add("ver-install");
                //Add an additional cell to the current cell's row.
                const additionalCell = document.createElement("td");
                additionalCell.classList.add("ver-dropdown");
                currentCell.parentNode.appendChild(additionalCell);
                //Change the button's style accordingly.
                button.classList.remove("btn-secondary");
                button.classList.add("btn-primary");
                button.innerHTML = "Install";
            }

            button.addEventListener('click', function() {
                //Save the current version's data in the event listener.
                const currVersionData = versionData;
                const currVersionName = versionName;
                //If a version exists, play it, download it otherwise.
                if (window.stManagement.checkForVersion(currVersionName)) {
                    window.stManagement.startVersion(currVersionName, window.stManagement.getVersionStartCommands(currVersionName));
                }
                else {
                    //Configure the button's style to "Installing...", send name, URL's and the current release button to preload.js and download the version.
                    this.setAttribute("disabled", "");
                    this.innerHTML = "Working...";
                    window.stManagement.installVersion(currVersionName, currVersionData[3].split(","), this);
                }
            });
        }
    }
}

function configureDescriptions() {
    //Making descriptions clickable and able to show info in a modal.
    var allDescriptions = document.getElementsByClassName("ver-description");
    for (description of allDescriptions) {
        //Create a text to inform the user to click.
        const clickInfo = document.createElement("p");
        clickInfo.innerHTML = "Click for more info.";
        clickInfo.className = "ver-click-info";
        description.appendChild(clickInfo);
        //Event listeners
        const currClickInfo = description.childNodes[2];
        description.addEventListener("mouseover", function() {currClickInfo.style.visibility = "visible"});
        description.addEventListener("mouseleave", function() {currClickInfo.style.visibility = null});
        description.addEventListener("click", function() {
            const descriptionModal = document.getElementById("descriptionModal");
            const versionName = getVersionName(getVersionData(this.parentNode.id), "true");
            //Remove additional HTML objects.
            var description = this.innerHTML.split("<p");
            description.pop();
            description = description.join("<p");
            //Set values to modal.
            descriptionModal.querySelector("#modalTitle").innerHTML = versionName;
            descriptionModal.querySelector("#modalBody").innerHTML = description;
        });
        //Attributes to make the modal functional.
        description.setAttribute("data-bs-toggle", "modal");
        description.setAttribute("data-bs-target", "#descriptionModal");
    }
}

function configureDropdownElements() {
    //Configure the custom start options in the dropdowns to open the custom start modal and get the proper version start command.
    var customStartOptions = document.getElementsByClassName("customStartOption");
    for (customStartOption of customStartOptions) {
        const releaseId = customStartOption.parentNode.parentNode.parentNode.id;
        const versionData = getVersionData(releaseId);
        const versionName = getVersionName(versionData);
        const fullVersionName = getVersionName(versionData, "true");
        customStartOption.addEventListener("click", function() {
            document.getElementById("customStartModal").setAttribute("stVersion", versionName);
            document.getElementById("customStartDescription").innerHTML = `Start ${fullVersionName} with additional attributes:`;
            document.getElementById("defaultVersionStartup").innerHTML = window.stManagement.getVersionStartCommands(versionName).startCommand;
        });
        customStartOption.setAttribute("data-bs-toggle", "modal");
        customStartOption.setAttribute("data-bs-target", "#customStartModal");
    }
    //Configure the uninstall options in the dropdowns to open a modal for confirmation when deleting version.
    var uninstallOptions = document.getElementsByClassName("uninstallOption");
    for (uninstallOption of uninstallOptions) {
        const releaseId = uninstallOption.parentNode.parentNode.parentNode.id;
        const versionData = getVersionData(releaseId);
        const versionName = getVersionName(versionData);
        const fullVersionName = getVersionName(versionData, "true");
        uninstallOption.addEventListener("click", function() {
            const uninstallModal = document.getElementById("uninstallModal");
            uninstallModal.setAttribute("stReleaseId", releaseId);
            uninstallModal.setAttribute("stVersion", versionName);
            uninstallModal.querySelector("#modalTitle").innerHTML = `Uninstall ${fullVersionName}`;
            uninstallModal.querySelector("#modalBody").innerHTML = 
                `Are you sure you want to uninstall ${fullVersionName}? Keep in mind:
                <ul class="notice">
                  <li>The release will keep uninstalling in the background.</li>
                  <li>Only the folder where the release is installed will be removed. The application entry in the system
                    wouldn't be used to prevent uninstalling wrong versions.
                </ul>`;
        });
        uninstallOption.setAttribute("data-bs-toggle", "modal");
        uninstallOption.setAttribute("data-bs-target", "#uninstallModal");
    }
}

function confgureOtherElements() {
    //Configure all rows in the release table to add a new dropdown to themselves when the event from preload.js is fired (after succesful version install).
    var allReleaseTableRows = document.getElementById("release-table").getElementsByTagName("tr");
    for (releaseTableRow of allReleaseTableRows) {
        releaseTableRow.addEventListener("addDropdown", function() {
            const releaseAdditionalCell = this.cells[this.cells.length - 1];
            releaseAdditionalCell.remove();
            addDropdown("", "btn-secondary", 
                    [{name:"Custom start", class:"customStartOption"}, {divider:true}, {name:"Open installation's directory", action:"openInstallDir"},
                    {name:"Open data directory", action:"openDataDir"}, {divider:true}, {name:"Uninstall", class:"uninstallOption"}], this.id, true);
            configureDropdownElements();
        });
    }
    //Configure checkboxes to make them have focus when hovered.
    var allCheckboxes = document.getElementsByClassName("form-check-input");
    for (checkbox of allCheckboxes) {
        checkbox.addEventListener("mouseover", function() {this.focus()});
        checkbox.addEventListener("mouseleave", function() {this.blur()});
    }
    //Configure labels for checkboxes make the checkbox have focus when hovered and checked when the label itself is clicked.
    var allLabels = document.getElementsByClassName("labelForCheckbox");
    for (label of allLabels) {
        const currCheckbox = document.getElementById(label.getAttribute("for"));
        label.addEventListener("mouseover", function() {currCheckbox.focus()});
        label.addEventListener("mouseleave", function() {currCheckbox.blur()});
        label.addEventListener("click", function() {!currCheckbox.checked})
    }
    //Configure the devMode checkbox.
    document.getElementById("devModeCheckbox").addEventListener("change", function() {
        const defaultVersionStartupCommand = document.getElementById("defaultVersionStartup");
        const devModeCommand = window.stManagement.getVersionDevModeAttribute(document.getElementById("customStartModal").getAttribute("stVersion"));
        if (this.checked) {
            defaultVersionStartupCommand.innerHTML += ` ${devModeCommand}`;
        }
        else {
            defaultVersionStartupCommand.innerHTML = defaultVersionStartupCommand.innerHTML.replace(` ${devModeCommand}`, "");
        }
    });
    //Make the custom start "Play!" button functional.
    document.getElementById("customStartButton").addEventListener("click", function() {
        //Start the version with the new attributes.
        const currVersionName = document.getElementById("customStartModal").getAttribute("stVersion");
        const execDirectory = window.stManagement.getVersionStartCommands(currVersionName).execDirectory;
        window.stManagement.startVersion(currVersionName, {execDirectory:execDirectory, 
            startCommand:`${document.getElementById("defaultVersionStartup").innerHTML} ${document.getElementById("commandField").value}`});
    });
    //Configure the custom start modal to uncheck all checkboxes when closed.
    document.getElementById("customStartModal").addEventListener("hidden.bs.modal", function() {
        const childInputElements = this.getElementsByTagName("input");
        for (inputElement of childInputElements) {
            //If it's a checkbox, uncheck it.
            if (inputElement.getAttribute("type") == "checkbox") inputElement.checked = false;
        }
    });
    //Make the uninstall version button functional.
    document.getElementById("uninstallButton").addEventListener("click", function() {
        const currVersionName = document.getElementById("uninstallModal").getAttribute("stVersion");
        const releaseButton = document.getElementById(document.getElementById("uninstallModal").getAttribute("stReleaseId") + "Button");
        //Configure the release button's style to "Uninstalling..." and hide the dropdown.
        releaseButton.classList.remove("btn-success");
        releaseButton.classList.add("btn-secondary");
        releaseButton.setAttribute("disabled", "");
        releaseButton.innerHTML = "Working...";
        document.getElementById(releaseButton.id.replace("Button", "Dropdown")).style.visibility = "hidden";
        //Uninstall the version by sending it's name and release button.
        window.stManagement.uninstallVersion(currVersionName, releaseButton);
    });
    //Make the "Install" Nightly button functional.
    document.getElementById("installNightly").addEventListener("click", function() {
      const installerFile = document.getElementById("nightlyInstallerImport").files[0];
      if (!installerFile) return console.error("Nightly build installer file not selected.");
      window.stManagement.installNightly(installerFile.path);
  });
}

function configureLauncherOptions() {
    document.getElementById("preReleasesToggle").addEventListener("click", function() {
        const preReleases = document.getElementsByClassName("pre-release");
        const preReleasesVisible = document.getElementsByClassName("visible-pre-release").length !== 0;
        if (preReleasesVisible) {
            for (var preRelease of preReleases) {
                preRelease.classList.remove("visible-pre-release");
            }
            this.innerHTML = "Show pre-releases";
        }
        else {
            for (var preRelease of preReleases) {
                preRelease.classList.add("visible-pre-release");
            }
            this.innerHTML = "Hide pre-releases";
        }
    });
}
